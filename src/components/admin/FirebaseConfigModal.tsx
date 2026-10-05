'use client';

import React, { useState } from 'react';
import {
  getActiveFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
} from '@/lib/firebase';
import { FirebaseConnectionConfig } from '@/types/smartscreen';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Flame,
  Check,
  Save,
  RotateCcw,
  X,
} from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseConfigModal({ isOpen, onClose }: FirebaseConfigModalProps) {
  const { isFirebaseConnected } = useSmartScreen();

  const [apiKey, setApiKey] = useState(() => getActiveFirebaseConfig()?.apiKey || '');
  const [projectId, setProjectId] = useState(() => getActiveFirebaseConfig()?.projectId || '');
  const [authDomain, setAuthDomain] = useState(() => getActiveFirebaseConfig()?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(() => getActiveFirebaseConfig()?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(() => getActiveFirebaseConfig()?.messagingSenderId || '');
  const [appId, setAppId] = useState(() => getActiveFirebaseConfig()?.appId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) return;

    const config: FirebaseConnectionConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveStoredFirebaseConfig(config);
    // Push to server /api/config so all connected TVs/screens automatically receive it
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseConfig: config }),
    }).catch(() => {});

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1500);
  };

  const handleClear = () => {
    clearStoredFirebaseConfig();
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseConfig: null }),
    }).catch(() => {});
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Firebase Cloud State Setup</h3>
              <p className="text-[11px] text-slate-400">
                Configure Firestore realtime synchronization & Firebase Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isFirebaseConnected
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-sky-950/30 border-sky-500/40 text-sky-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isFirebaseConnected ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'
              }`}
            />
            <span className="font-bold">
              {isFirebaseConnected
                ? 'Connected to Firebase Firestore & Storage'
                : 'Operating in Local Mesh Mode (Zero-Config)'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-black/40 px-2 py-0.5 rounded">
            {isFirebaseConnected ? 'Live Cloud' : 'Local Mesh'}
          </span>
        </div>

        <p className="text-slate-400 leading-relaxed text-[11px]">
          SmartScreen functions automatically across tabs and windows using local realtime mesh sync.
          To synchronize across separate devices on different networks (TVs, projectors, laptops),
          provide your Firebase project credentials below or set environment variables in{' '}
          <code className="text-sky-400">.env.local</code>.
        </p>

        {/* Config Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">API Key</label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Project ID</label>
            <input
              type="text"
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="my-smartscreen-event"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-event.firebaseapp.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="my-event.appspot.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="123456789..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:12345:web:abcd..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Local Mode</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-lg shadow-sky-950/40"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Connecting...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
