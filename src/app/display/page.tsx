'use client';

import React, { useEffect } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { SceneRenderer } from '@/components/display/SceneRenderer';
import { EmergencyOverlay } from '@/components/display/EmergencyOverlay';
import { BannerAnnouncement } from '@/components/display/BannerAnnouncement';
import { OfflineIndicator } from '@/components/display/OfflineIndicator';

export default function DisplayPage() {
  const {
    eventState,
    activeScene,
    isOnline,
    isFirebaseConnected,
    registerDisplayPresence,
  } = useSmartScreen();

  // Send anonymous display presence heartbeat every 15 seconds
  useEffect(() => {
    registerDisplayPresence(activeScene?.id);
    const interval = setInterval(() => {
      registerDisplayPresence(activeScene?.id);
    }, 15000);

    return () => clearInterval(interval);
  }, [activeScene?.id, registerDisplayPresence]);

  // Handle stage blackout mode
  if (eventState.overrideMode === 'blackout') {
    return (
      <main className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center cursor-none">
        <OfflineIndicator
          isOnline={isOnline}
          isFirebaseConnected={isFirebaseConnected}
        />
      </main>
    );
  }

  // Handle emergency broadcast takeover
  if (eventState.overrideMode === 'emergency') {
    return (
      <main className="w-screen h-screen bg-black overflow-hidden relative">
        <EmergencyOverlay emergency={eventState.emergency} />
        <OfflineIndicator
          isOnline={isOnline}
          isFirebaseConnected={isFirebaseConnected}
        />
      </main>
    );
  }

  if (!activeScene) {
    return (
      <main className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase">Connecting to Event SmartScreen...</p>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950 relative select-none">
      {/* Top Banner Announcement if active */}
      <BannerAnnouncement banner={eventState.bannerAnnouncement} />

      {/* Main Authoritative Scene Presentation */}
      <SceneRenderer
        scene={activeScene}
        timerState={eventState.timer}
        aspectRatio="fullscreen"
      />

      {/* Discreet connection & presentation helper */}
      <OfflineIndicator
        isOnline={isOnline}
        isFirebaseConnected={isFirebaseConnected}
      />
    </main>
  );
}
