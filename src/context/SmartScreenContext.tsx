'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  EventState,
  Scene,
  AnnouncementItem,
  ScheduleItem,
  AssetItem,
  DisplayPresence,
  AuthoritativeTimerState,
  BannerAnnouncement,
  BrandKit,
} from '@/types/smartscreen';
import {
  defaultInitialEventState,
  defaultScenes,
  defaultAnnouncements,
  defaultSchedule,
  defaultAssets,
} from '@/lib/default-data';
import { initializeFirebaseServices } from '@/lib/firebase';
import {
  loadLocalData,
  saveLocalData,
  broadcastLocalMessage,
  getOrCreateDisplaySessionId,
} from '@/lib/sync-engine';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

interface SmartScreenContextType {
  eventState: EventState;
  scenes: Scene[];
  announcements: AnnouncementItem[];
  schedule: ScheduleItem[];
  assets: AssetItem[];
  activeScene: Scene | undefined;
  connectedDisplays: DisplayPresence[];
  connectedDisplaysCount: number;
  isFirebaseConnected: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number;

  // Actions
  broadcastScene: (sceneId: string) => Promise<void>;
  triggerEmergency: (title: string, message: string, severity?: 'critical' | 'warning' | 'info') => Promise<void>;
  restoreFromEmergency: () => Promise<void>;
  toggleBlackout: () => Promise<void>;
  updateTimer: (updates: Partial<AuthoritativeTimerState>) => Promise<void>;
  startTimer: (durationMs?: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  resetTimer: (durationMs?: number) => Promise<void>;
  adjustTimer: (deltaMs: number) => Promise<void>;
  updateBannerAnnouncement: (banner: BannerAnnouncement | null) => Promise<void>;
  createScene: (scene: Partial<Scene>) => Promise<string>;
  updateScene: (sceneId: string, updates: Partial<Scene>) => Promise<void>;
  duplicateScene: (sceneId: string) => Promise<string>;
  deleteScene: (sceneId: string) => Promise<void>;
  updateBrandKit: (brandKit: Partial<BrandKit>) => Promise<void>;
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  reorderAnnouncements: (ids: string[]) => Promise<void>;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => Promise<void>;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;
  addAsset: (asset: AssetItem) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  registerDisplayPresence: (currentSceneId?: string) => void;
  reloadAllData: () => void;
}

const SmartScreenContext = createContext<SmartScreenContextType | null>(null);

export function SmartScreenProvider({ children }: { children: React.ReactNode }) {
  const [eventState, setEventState] = useState<EventState>(() =>
    loadLocalData('smartscreen_event_state', defaultInitialEventState)
  );
  const [scenes, setScenes] = useState<Scene[]>(() =>
    loadLocalData('smartscreen_scenes', defaultScenes)
  );
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    loadLocalData('smartscreen_announcements', defaultAnnouncements)
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() =>
    loadLocalData('smartscreen_schedule', defaultSchedule)
  );
  const [assets, setAssets] = useState<AssetItem[]>(() =>
    loadLocalData('smartscreen_assets', defaultAssets)
  );
  const [presenceMap, setPresenceMap] = useState<Record<string, DisplayPresence>>(() =>
    loadLocalData('smartscreen_presence', {})
  );

  const [isFirebaseConnected] = useState<boolean>(() => {
    return initializeFirebaseServices().isConfigured;
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [activeDisplays, setActiveDisplays] = useState<DisplayPresence[]>([]);

  // Listen to browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    saveLocalData('smartscreen_event_state', eventState);
    saveLocalData('smartscreen_scenes', scenes);
    saveLocalData('smartscreen_announcements', announcements);
    saveLocalData('smartscreen_schedule', schedule);
    saveLocalData('smartscreen_assets', assets);
    saveLocalData('smartscreen_presence', presenceMap);
  }, [eventState, scenes, announcements, schedule, assets, presenceMap]);

  // Setup Firebase Listeners or Local BroadcastChannel
  useEffect(() => {
    const { db, isConfigured } = initializeFirebaseServices();

    if (isConfigured && db) {
      // 1. Listen to 'events/current' document
      const eventDocRef = doc(db, 'events', 'current');
      const unsubEvent = onSnapshot(
        eventDocRef,
        (snap) => {
          setIsSyncing(false);
          setLastSyncTime(Date.now());
          if (snap.exists()) {
            const data = snap.data() as EventState;
            setEventState(data);
          } else {
            // First time setup: seed with default initial state
            setDoc(eventDocRef, defaultInitialEventState).catch(console.error);
          }
        },
        (err) => {
          console.error('Firestore eventState listener error:', err);
          setIsSyncing(false);
        }
      );

      // 2. Listen to 'scenes' collection
      const scenesColRef = collection(db, 'scenes');
      const unsubScenes = onSnapshot(
        scenesColRef,
        (snap) => {
          setLastSyncTime(Date.now());
          if (!snap.empty) {
            const loadedScenes: Scene[] = [];
            snap.forEach((d) => loadedScenes.push(d.data() as Scene));
            setScenes(loadedScenes);
          } else {
            defaultScenes.forEach((s) => {
              setDoc(doc(db, 'scenes', s.id), s).catch(console.error);
            });
          }
        },
        (err) => console.error('Firestore scenes listener error:', err)
      );

      // 3. Listen to 'announcements' collection
      const annColRef = collection(db, 'announcements');
      const unsubAnnouncements = onSnapshot(
        annColRef,
        (snap) => {
          if (!snap.empty) {
            const loaded: AnnouncementItem[] = [];
            snap.forEach((d) => loaded.push(d.data() as AnnouncementItem));
            loaded.sort((a, b) => a.order - b.order);
            setAnnouncements(loaded);
          } else {
            defaultAnnouncements.forEach((a) => {
              setDoc(doc(db, 'announcements', a.id), a).catch(console.error);
            });
          }
        },
        (err) => console.error('Firestore announcements error:', err)
      );

      // 4. Listen to 'schedule' collection
      const schColRef = collection(db, 'schedule');
      const unsubSchedule = onSnapshot(
        schColRef,
        (snap) => {
          if (!snap.empty) {
            const loaded: ScheduleItem[] = [];
            snap.forEach((d) => loaded.push(d.data() as ScheduleItem));
            setSchedule(loaded);
          } else {
            defaultSchedule.forEach((sc) => {
              setDoc(doc(db, 'schedule', sc.id), sc).catch(console.error);
            });
          }
        },
        (err) => console.error('Firestore schedule error:', err)
      );

      // 5. Listen to 'assets' collection
      const assetColRef = collection(db, 'assets');
      const unsubAssets = onSnapshot(
        assetColRef,
        (snap) => {
          if (!snap.empty) {
            const loaded: AssetItem[] = [];
            snap.forEach((d) => loaded.push(d.data() as AssetItem));
            setAssets(loaded);
          } else {
            defaultAssets.forEach((as) => {
              setDoc(doc(db, 'assets', as.id), as).catch(console.error);
            });
          }
        },
        (err) => console.error('Firestore assets error:', err)
      );

      // 6. Listen to 'displayPresence' collection
      const presColRef = collection(db, 'displayPresence');
      const unsubPresence = onSnapshot(
        presColRef,
        (snap) => {
          const map: Record<string, DisplayPresence> = {};
          snap.forEach((d) => {
            const item = d.data() as DisplayPresence;
            map[item.sessionId] = item;
          });
          setPresenceMap(map);
        },
        (err) => console.error('Firestore presence error:', err)
      );

      return () => {
        unsubEvent();
        unsubScenes();
        unsubAnnouncements();
        unsubSchedule();
        unsubAssets();
        unsubPresence();
      };
    } else {
      // Local BroadcastChannel sync across tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('smartscreen_realtime_mesh');
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          setLastSyncTime(Date.now());
          if (type === 'EVENT_STATE_UPDATE') {
            setEventState(payload);
          } else if (type === 'SCENES_UPDATE') {
            setScenes(payload);
          } else if (type === 'ANNOUNCEMENTS_UPDATE') {
            setAnnouncements(payload);
          } else if (type === 'SCHEDULE_UPDATE') {
            setSchedule(payload);
          } else if (type === 'ASSETS_UPDATE') {
            setAssets(payload);
          } else if (type === 'PRESENCE_PING') {
            setPresenceMap((prev) => ({
              ...prev,
              [payload.sessionId]: payload,
            }));
          }
        };

        return () => {
          bc.close();
        };
      }
    }
  }, []);

  // Anonymous presence heartbeat registration (Called by `/display`)
  const registerDisplayPresence = useCallback((currentSceneId?: string) => {
    if (typeof window === 'undefined') return;
    const sessionId = getOrCreateDisplaySessionId();
    const presenceData: DisplayPresence = {
      sessionId,
      lastSeen: Date.now(),
      resolution: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent,
      currentSceneId: currentSceneId || eventState.activeSceneId,
      online: true,
    };

    setPresenceMap((prev) => ({ ...prev, [sessionId]: presenceData }));
    broadcastLocalMessage('PRESENCE_PING', presenceData);

    const { db } = initializeFirebaseServices();
    if (db) {
      setDoc(doc(db, 'displayPresence', sessionId), presenceData, { merge: true }).catch((err) =>
        console.warn('Failed to update presence in Firestore:', err)
      );
    }
  }, [eventState.activeSceneId]);

  // Periodic active display calculation and cleanup
  useEffect(() => {
    const updateActive = () => {
      const cutoff = Date.now() - 45000;
      const activeList = Object.values(presenceMap).filter((p) => p.lastSeen > cutoff);
      setActiveDisplays(activeList);
    };

    updateActive();
    const interval = setInterval(updateActive, 10000);
    return () => clearInterval(interval);
  }, [presenceMap]);

  const connectedDisplaysCount = activeDisplays.length;

  // Active Scene helper
  const activeScene = scenes.find((s) => s.id === eventState.activeSceneId) || scenes[0];

  // Write Event State helper
  const persistEventState = useCallback(
    async (updater: (prev: EventState) => EventState) => {
      setEventState((prev) => {
        const next = updater(prev);
        const versioned = {
          ...next,
          version: (prev.version || 0) + 1,
          updatedAt: Date.now(),
        };
        broadcastLocalMessage('EVENT_STATE_UPDATE', versioned);
        saveLocalData('smartscreen_event_state', versioned);

        const { db } = initializeFirebaseServices();
        if (db) {
          setDoc(doc(db, 'events', 'current'), versioned).catch((err) =>
            console.error('Failed to sync event state to Firestore:', err)
          );
        }
        return versioned;
      });
    },
    []
  );

  // Broadcast Scene
  const broadcastScene = useCallback(
    async (sceneId: string) => {
      await persistEventState((prev) => ({
        ...prev,
        activeSceneId: sceneId,
        overrideMode: 'none',
        bannerAnnouncement: null, // Clear any banner/ping overlay so the new preset takes over completely
      }));
    },
    [persistEventState]
  );

  // Emergency Broadcast
  const triggerEmergency = useCallback(
    async (
      title: string,
      message: string,
      severity: 'critical' | 'warning' | 'info' = 'critical'
    ) => {
      await persistEventState((prev) => ({
        ...prev,
        overrideMode: 'emergency',
        emergency: {
          active: true,
          title,
          message,
          severity,
          audioAlert: true,
          timestamp: Date.now(),
          previousSceneId: prev.activeSceneId,
        },
      }));
    },
    [persistEventState]
  );

  const restoreFromEmergency = useCallback(async () => {
    await persistEventState((prev) => ({
      ...prev,
      overrideMode: 'none',
      emergency: {
        ...prev.emergency,
        active: false,
      },
      activeSceneId: prev.emergency.previousSceneId || prev.activeSceneId,
    }));
  }, [persistEventState]);

  // Blackout
  const toggleBlackout = useCallback(async () => {
    await persistEventState((prev) => ({
      ...prev,
      overrideMode: prev.overrideMode === 'blackout' ? 'none' : 'blackout',
      bannerAnnouncement: null,
    }));
  }, [persistEventState]);

  // Authoritative Timer Controls
  const updateTimer = useCallback(
    async (updates: Partial<AuthoritativeTimerState>) => {
      await persistEventState((prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          ...updates,
          updatedAt: Date.now(),
        },
      }));
    },
    [persistEventState]
  );

  const startTimer = useCallback(
    async (durationMs?: number) => {
      const dur = durationMs ?? eventState.timer.pausedRemaining;
      const targetEndTime = Date.now() + dur;
      await updateTimer({
        status: 'running',
        targetEndTime,
        pausedRemaining: dur,
        totalDuration: durationMs ?? eventState.timer.totalDuration,
        startTime: Date.now(),
      });
    },
    [eventState.timer.pausedRemaining, eventState.timer.totalDuration, updateTimer]
  );

  const pauseTimer = useCallback(async () => {
    if (eventState.timer.status !== 'running') return;
    const now = Date.now();
    let remaining = 0;
    if (eventState.timer.mode === 'countdown' && eventState.timer.targetEndTime) {
      remaining = Math.max(0, eventState.timer.targetEndTime - now);
    } else if (eventState.timer.mode === 'stopwatch' && eventState.timer.startTime) {
      remaining = now - eventState.timer.startTime;
    }
    await updateTimer({
      status: 'paused',
      pausedRemaining: remaining,
      targetEndTime: null,
    });
  }, [eventState.timer, updateTimer]);

  const resumeTimer = useCallback(async () => {
    if (eventState.timer.status !== 'paused') return;
    const now = Date.now();
    if (eventState.timer.mode === 'countdown') {
      const targetEndTime = now + eventState.timer.pausedRemaining;
      await updateTimer({
        status: 'running',
        targetEndTime,
      });
    } else {
      // stopwatch
      const startTime = now - eventState.timer.pausedRemaining;
      await updateTimer({
        status: 'running',
        startTime,
      });
    }
  }, [eventState.timer, updateTimer]);

  const resetTimer = useCallback(
    async (durationMs?: number) => {
      const dur = durationMs ?? eventState.timer.totalDuration;
      await updateTimer({
        status: 'stopped',
        targetEndTime: null,
        pausedRemaining: dur,
        startTime: null,
      });
    },
    [eventState.timer.totalDuration, updateTimer]
  );

  const adjustTimer = useCallback(
    async (deltaMs: number) => {
      const now = Date.now();
      if (eventState.timer.status === 'running' && eventState.timer.targetEndTime) {
        const newTarget = Math.max(now, eventState.timer.targetEndTime + deltaMs);
        const newRemaining = Math.max(0, newTarget - now);
        await updateTimer({
          targetEndTime: newTarget,
          pausedRemaining: newRemaining,
        });
      } else {
        const newRemaining = Math.max(0, eventState.timer.pausedRemaining + deltaMs);
        await updateTimer({
          pausedRemaining: newRemaining,
          totalDuration: Math.max(newRemaining, eventState.timer.totalDuration),
        });
      }
    },
    [eventState.timer, updateTimer]
  );

  // Banner Announcement
  const updateBannerAnnouncement = useCallback(
    async (banner: BannerAnnouncement | null) => {
      await persistEventState((prev) => ({
        ...prev,
        bannerAnnouncement: banner,
      }));
    },
    [persistEventState]
  );

  // Brand Kit
  const updateBrandKit = useCallback(
    async (brandKitUpdates: Partial<BrandKit>) => {
      await persistEventState((prev) => ({
        ...prev,
        brandKit: {
          ...prev.brandKit,
          ...brandKitUpdates,
        },
      }));
    },
    [persistEventState]
  );

  // Scenes Operations
  const persistScenes = useCallback((newScenes: Scene[]) => {
    setScenes(newScenes);
    broadcastLocalMessage('SCENES_UPDATE', newScenes);
    saveLocalData('smartscreen_scenes', newScenes);
  }, []);

  const createScene = useCallback(
    async (sceneData: Partial<Scene>): Promise<string> => {
      const newId = 'scene-' + Date.now().toString(36);
      const newScene: Scene = {
        id: newId,
        name: sceneData.name || 'New Scene',
        type: sceneData.type || 'custom',
        description: sceneData.description || '',
        background: sceneData.background || {
          type: 'gradient',
          value: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        },
        elements: sceneData.elements || [],
        transition: sceneData.transition || 'fade',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updated = [newScene, ...scenes];
      persistScenes(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        setDoc(doc(db, 'scenes', newId), newScene).catch(console.error);
      }

      return newId;
    },
    [scenes, persistScenes]
  );

  const updateScene = useCallback(
    async (sceneId: string, updates: Partial<Scene>) => {
      const updated = scenes.map((s) =>
        s.id === sceneId ? { ...s, ...updates, updatedAt: Date.now() } : s
      );
      persistScenes(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        const target = updated.find((s) => s.id === sceneId);
        if (target) {
          setDoc(doc(db, 'scenes', sceneId), target).catch(console.error);
        }
      }
    },
    [scenes, persistScenes]
  );

  const duplicateScene = useCallback(
    async (sceneId: string): Promise<string> => {
      const original = scenes.find((s) => s.id === sceneId);
      if (!original) return '';
      const newId = 'scene-' + Date.now().toString(36);
      const cloned: Scene = {
        ...original,
        id: newId,
        name: `${original.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        elements: original.elements.map((el) => ({
          ...el,
          id: 'el-' + Math.random().toString(36).substring(2, 9),
        })),
      };

      const updated = [cloned, ...scenes];
      persistScenes(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        setDoc(doc(db, 'scenes', newId), cloned).catch(console.error);
      }
      return newId;
    },
    [scenes, persistScenes]
  );

  const deleteScene = useCallback(
    async (sceneId: string) => {
      if (scenes.length <= 1) return;
      const updated = scenes.filter((s) => s.id !== sceneId);
      persistScenes(updated);

      if (eventState.activeSceneId === sceneId && updated.length > 0) {
        await broadcastScene(updated[0].id);
      }

      const { db } = initializeFirebaseServices();
      if (db) {
        deleteDoc(doc(db, 'scenes', sceneId)).catch(console.error);
      }
    },
    [scenes, eventState.activeSceneId, persistScenes, broadcastScene]
  );

  // Announcement Operations
  const persistAnnouncements = useCallback((newList: AnnouncementItem[]) => {
    setAnnouncements(newList);
    broadcastLocalMessage('ANNOUNCEMENTS_UPDATE', newList);
    saveLocalData('smartscreen_announcements', newList);
  }, []);

  const addAnnouncement = useCallback(
    async (item: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
      const newItem: AnnouncementItem = {
        ...item,
        id: 'ann-' + Date.now().toString(36),
        createdAt: Date.now(),
      };
      const updated = [newItem, ...announcements];
      persistAnnouncements(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        setDoc(doc(db, 'announcements', newItem.id), newItem).catch(console.error);
      }
    },
    [announcements, persistAnnouncements]
  );

  const updateAnnouncement = useCallback(
    async (id: string, updates: Partial<AnnouncementItem>) => {
      const updated = announcements.map((a) => (a.id === id ? { ...a, ...updates } : a));
      persistAnnouncements(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        const target = updated.find((a) => a.id === id);
        if (target) {
          setDoc(doc(db, 'announcements', id), target).catch(console.error);
        }
      }
    },
    [announcements, persistAnnouncements]
  );

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      const updated = announcements.filter((a) => a.id !== id);
      persistAnnouncements(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        deleteDoc(doc(db, 'announcements', id)).catch(console.error);
      }
    },
    [announcements, persistAnnouncements]
  );

  const reorderAnnouncements = useCallback(
    async (ids: string[]) => {
      const updated = [...announcements].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      const renumbered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
      persistAnnouncements(renumbered);

      const { db } = initializeFirebaseServices();
      if (db) {
        renumbered.forEach((item) => {
          setDoc(doc(db, 'announcements', item.id), item).catch(console.error);
        });
      }
    },
    [announcements, persistAnnouncements]
  );

  // Schedule Operations
  const persistSchedule = useCallback((newList: ScheduleItem[]) => {
    setSchedule(newList);
    broadcastLocalMessage('SCHEDULE_UPDATE', newList);
    saveLocalData('smartscreen_schedule', newList);
  }, []);

  const addScheduleItem = useCallback(
    async (item: Omit<ScheduleItem, 'id'>) => {
      const newItem: ScheduleItem = {
        ...item,
        id: 'sch-' + Date.now().toString(36),
      };
      const updated = [...schedule, newItem];
      persistSchedule(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        setDoc(doc(db, 'schedule', newItem.id), newItem).catch(console.error);
      }
    },
    [schedule, persistSchedule]
  );

  const updateScheduleItem = useCallback(
    async (id: string, updates: Partial<ScheduleItem>) => {
      const updated = schedule.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persistSchedule(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        const target = updated.find((s) => s.id === id);
        if (target) {
          setDoc(doc(db, 'schedule', id), target).catch(console.error);
        }
      }
    },
    [schedule, persistSchedule]
  );

  const deleteScheduleItem = useCallback(
    async (id: string) => {
      const updated = schedule.filter((s) => s.id !== id);
      persistSchedule(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        deleteDoc(doc(db, 'schedule', id)).catch(console.error);
      }
    },
    [schedule, persistSchedule]
  );

  // Asset Operations
  const persistAssets = useCallback((newList: AssetItem[]) => {
    setAssets(newList);
    broadcastLocalMessage('ASSETS_UPDATE', newList);
    saveLocalData('smartscreen_assets', newList);
  }, []);

  const addAsset = useCallback(
    async (asset: AssetItem) => {
      const updated = [asset, ...assets];
      persistAssets(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        setDoc(doc(db, 'assets', asset.id), asset).catch(console.error);
      }
    },
    [assets, persistAssets]
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      const updated = assets.filter((a) => a.id !== id);
      persistAssets(updated);

      const { db } = initializeFirebaseServices();
      if (db) {
        deleteDoc(doc(db, 'assets', id)).catch(console.error);
      }
    },
    [assets, persistAssets]
  );

  // Reload action for testing or manual reset
  const reloadAllData = useCallback(() => {
    setEventState(loadLocalData('smartscreen_event_state', defaultInitialEventState));
    setScenes(loadLocalData('smartscreen_scenes', defaultScenes));
    setAnnouncements(loadLocalData('smartscreen_announcements', defaultAnnouncements));
    setSchedule(loadLocalData('smartscreen_schedule', defaultSchedule));
    setAssets(loadLocalData('smartscreen_assets', defaultAssets));
  }, []);

  // Automatic schedule checker
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;

      schedule.forEach((item) => {
        if (item.enabled && item.autoTrigger && item.scheduledTime === timeStr) {
          if (eventState.activeSceneId !== item.sceneId) {
            broadcastScene(item.sceneId);
          }
        }
      });
    };

    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [schedule, eventState.activeSceneId, broadcastScene]);

  const value = {
    eventState,
    scenes,
    announcements,
    schedule,
    assets,
    activeScene,
    connectedDisplays: activeDisplays,
    connectedDisplaysCount,
    isFirebaseConnected,
    isOnline,
    isSyncing,
    lastSyncTime,

    broadcastScene,
    triggerEmergency,
    restoreFromEmergency,
    toggleBlackout,
    updateTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTimer,
    updateBannerAnnouncement,
    createScene,
    updateScene,
    duplicateScene,
    deleteScene,
    updateBrandKit,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    reorderAnnouncements,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    addAsset,
    deleteAsset,
    registerDisplayPresence,
    reloadAllData,
  };

  return <SmartScreenContext.Provider value={value}>{children}</SmartScreenContext.Provider>;
}

export function useSmartScreen() {
  const ctx = useContext(SmartScreenContext);
  if (!ctx) {
    throw new Error('useSmartScreen must be used within a SmartScreenProvider');
  }
  return ctx;
}
