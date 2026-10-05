// Singleton broadcast channel for cross-tab local realtime sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('smartscreen_realtime_mesh');
  } catch (err) {
    console.warn('BroadcastChannel not supported in this environment', err);
  }
}

export function broadcastLocalMessage(type: string, payload: unknown) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (err) {
      console.error('Failed to broadcast message:', err);
    }
  }

  // Also push to Cloud Sync API asynchronously for cross-device synchronization
  if (typeof window !== 'undefined' && (type === 'EVENT_STATE_UPDATE' || type === 'SCENES_UPDATE' || type === 'PRESENCE_PING')) {
    pushCloudSync(type, payload).catch(() => {});
  }
}

export async function pushCloudSync(type: string, payload: unknown) {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
      keepalive: true,
    });
  } catch {
    // Non-fatal if offline
  }
}

export async function fetchCloudSyncState() {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Non-fatal if network drop
  }
  return null;
}

export function loadLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
  }
  return fallback;
}

export function saveLocalData<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Presence Heartbeat Helper
export function getOrCreateDisplaySessionId(): string {
  if (typeof window === 'undefined') return 'server_display';
  let id = sessionStorage.getItem('smartscreen_display_session_id');
  if (!id) {
    id = 'disp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem('smartscreen_display_session_id', id);
  }
  return id;
}
