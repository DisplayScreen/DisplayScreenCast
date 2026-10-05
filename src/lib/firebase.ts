import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseConnectionConfig } from '@/types/smartscreen';

const STORAGE_KEY_CUSTOM_CONFIG = 'smartscreen_custom_firebase_config';

export function getStoredFirebaseConfig(): FirebaseConnectionConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading custom firebase config from localStorage:', err);
  }
  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseConnectionConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving custom firebase config:', err);
  }
}

export function clearStoredFirebaseConfig() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_CONFIG);
  } catch (err) {
    console.error('Error clearing firebase config:', err);
  }
}

export function getActiveFirebaseConfig(): FirebaseConnectionConfig | null {
  // 1. Check custom stored config first
  const custom = getStoredFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return { ...custom, isCustomConfig: true };
  }

  // 2. Check environment variables
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      isCustomConfig: false,
    };
  }

  return null;
}

export async function syncSharedFirebaseConfig(): Promise<FirebaseConnectionConfig | null> {
  if (typeof window === 'undefined') return null;
  const current = getActiveFirebaseConfig();
  if (current) return current;

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data && data.firebaseConfig && data.firebaseConfig.apiKey) {
        saveStoredFirebaseConfig(data.firebaseConfig);
        return data.firebaseConfig;
      }
    }
  } catch {
    // Non-fatal
  }
  return null;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initializeFirebaseServices(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  isConfigured: boolean;
} {
  const config = getActiveFirebaseConfig();
  if (!config) {
    return { app: null, db: null, storage: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    storage = getStorage(app);
    return { app, db, storage, isConfigured: true };
  } catch (err) {
    console.error('Failed to initialize Firebase services:', err);
    return { app: null, db: null, storage: null, isConfigured: false };
  }
}
