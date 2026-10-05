'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Maximize, Minimize } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  isFirebaseConnected: boolean;
}

export function OfflineIndicator({ isOnline, isFirebaseConnected }: OfflineIndicatorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Request screen wake lock to keep event display on
  useEffect(() => {
    let wakeLockSentinel: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
        }
      } catch {
        // Wake lock may fail if page is not focused or unsupported
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release().catch(() => {});
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40 transition-opacity duration-300"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div
        className={`flex items-center gap-2 p-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl transition-all duration-300 ${
          showControls || !isOnline ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        }`}
      >
        {/* Offline Badge */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Cached Mode</span>
          </div>
        )}

        {/* Online / Synced indicator */}
        {isOnline && showControls && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isFirebaseConnected ? 'Cloud Sync' : 'Local Mesh Sync'}</span>
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Presentation Mode)'}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
