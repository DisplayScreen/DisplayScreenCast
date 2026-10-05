import {
  EventState,
  Scene,
  AnnouncementItem,
  ScheduleItem,
  DisplayPresence,
  FirebaseConnectionConfig,
} from '@/types/smartscreen';
import {
  defaultInitialEventState,
  defaultScenes,
  defaultAnnouncements,
  defaultSchedule,
} from './default-data';
import fs from 'fs';
import path from 'path';

export interface ServerSyncData {
  eventState: EventState;
  scenes: Scene[];
  announcements: AnnouncementItem[];
  schedule: ScheduleItem[];
  presence: Record<string, DisplayPresence>;
  firebaseConfig: FirebaseConnectionConfig | null;
  version: number;
  updatedAt: number;
}

// In-memory global state across warm invocations
const globalState: ServerSyncData = {
  eventState: { ...defaultInitialEventState, version: 1, updatedAt: Date.now() },
  scenes: [...defaultScenes],
  announcements: [...defaultAnnouncements],
  schedule: [...defaultSchedule],
  presence: {},
  firebaseConfig: null,
  version: 1,
  updatedAt: Date.now(),
};

const CACHE_FILE = path.join('/tmp', 'smartscreen_cloud_state.json');
const KVDB_URL = 'https://kvdb.io/4T6Hq1PZ9xN8wL3s2K/smartscreen_v1';

// Try loading cached state from disk on container startup
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version) {
      Object.assign(globalState, parsed);
    }
  }
} catch {
  // Ignore filesystem cache miss on serverless start
}

export async function getServerState(): Promise<ServerSyncData> {
  // Prune stale display presence heartbeats (older than 45 seconds)
  const now = Date.now();
  const prunedPresence: Record<string, DisplayPresence> = {};
  for (const [id, pres] of Object.entries(globalState.presence)) {
    if (now - pres.lastSeen < 45000) {
      prunedPresence[id] = pres;
    }
  }
  globalState.presence = prunedPresence;

  return globalState;
}

export async function updateServerState(
  updates: Partial<ServerSyncData>
): Promise<ServerSyncData> {
  if (updates.eventState) {
    globalState.eventState = {
      ...globalState.eventState,
      ...updates.eventState,
      version: (globalState.version || 1) + 1,
      updatedAt: Date.now(),
    };
  }

  if (updates.scenes) {
    globalState.scenes = updates.scenes;
  }

  if (updates.announcements) {
    globalState.announcements = updates.announcements;
  }

  if (updates.schedule) {
    globalState.schedule = updates.schedule;
  }

  if (updates.presence) {
    globalState.presence = {
      ...globalState.presence,
      ...updates.presence,
    };
  }

  if (updates.firebaseConfig !== undefined) {
    globalState.firebaseConfig = updates.firebaseConfig;
  }

  globalState.version = (globalState.version || 1) + 1;
  globalState.updatedAt = Date.now();

  // Asynchronously save to /tmp cache file
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(globalState), 'utf-8');
  } catch {
    // Non-fatal if /tmp is not writable
  }

  // Asynchronously broadcast to cloud KV for cross-container sync (fire-and-forget)
  try {
    fetch(KVDB_URL, {
      method: 'POST',
      body: JSON.stringify({
        eventState: globalState.eventState,
        scenes: globalState.scenes,
        version: globalState.version,
        updatedAt: globalState.updatedAt,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  } catch {
    // Non-fatal
  }

  return globalState;
}

export function registerServerPresence(presence: DisplayPresence) {
  globalState.presence[presence.sessionId] = {
    ...presence,
    lastSeen: Date.now(),
  };
}
