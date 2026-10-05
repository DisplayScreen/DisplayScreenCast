'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { SceneRenderer } from '@/components/display/SceneRenderer';
import { EmergencyOverlay } from '@/components/display/EmergencyOverlay';
import { BannerAnnouncement } from '@/components/display/BannerAnnouncement';
import { OfflineIndicator } from '@/components/display/OfflineIndicator';
import { Smartphone, Maximize2 } from 'lucide-react';

export default function DisplayPage() {
  const {
    eventState,
    activeScene,
    isOnline,
    isFirebaseConnected,
    registerDisplayPresence,
  } = useSmartScreen();

  const [isPortrait, setIsPortrait] = useState(false);
  const [showRotationTip, setShowRotationTip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check screen orientation and adapt to mobile screens
  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(portrait);
      if (portrait) {
        setShowRotationTip(true);
        const timer = setTimeout(() => setShowRotationTip(false), 5000);
        return () => clearTimeout(timer);
      } else {
        setShowRotationTip(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Send anonymous display presence heartbeat every 10 seconds
  useEffect(() => {
    registerDisplayPresence(activeScene?.id);
    const interval = setInterval(() => {
      registerDisplayPresence(activeScene?.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeScene?.id, registerDisplayPresence]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

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
      <main className="w-screen h-screen bg-black flex flex-col items-center justify-center text-slate-400 font-mono">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase">Connecting to Event SmartScreen...</p>
      </main>
    );
  }

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center relative select-none"
      onDoubleClick={toggleFullscreen}
    >
      {/* Top Banner Announcement if active */}
      <BannerAnnouncement banner={eventState.bannerAnnouncement} />

      {/* Auto-Fitting Screen Width Presentation Stage */}
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
        <div
          className="w-full aspect-video flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-300"
          style={{
            maxWidth: 'calc(100vh * (16 / 9))',
            maxHeight: '100vh',
            width: '100%',
          }}
        >
          <SceneRenderer
            scene={activeScene}
            timerState={eventState.timer}
            aspectRatio="16:9"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Mobile Portrait Orientation Floating Reminder */}
      {showRotationTip && isPortrait && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 border border-white/20 text-neutral-200 text-xs py-2 px-4 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none">
          <Smartphone className="w-4 h-4 text-blue-400 rotate-90 animate-pulse" />
          <span>Rotate phone for widescreen TV presentation</span>
        </div>
      )}

      {/* Discreet Fullscreen Quick Action on Mobile / Touch */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-white/50 hover:text-white border border-white/10 backdrop-blur-md transition-all sm:opacity-0 sm:hover:opacity-100"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Discreet connection & presentation helper */}
      <OfflineIndicator
        isOnline={isOnline}
        isFirebaseConnected={isFirebaseConnected}
      />
    </main>
  );
}
