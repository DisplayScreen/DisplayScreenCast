'use client';

import React from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Tv,
  Radio,
  AlertTriangle,
  Moon,
  ExternalLink,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenEmergencyModal: () => void;
  onOpenSettingsModal: () => void;
}

export function AdminHeader({
  onOpenEmergencyModal,
  onOpenSettingsModal,
}: AdminHeaderProps) {
  const {
    eventState,
    connectedDisplaysCount,
    isFirebaseConnected,
    toggleBlackout,
    restoreFromEmergency,
  } = useSmartScreen();

  const isEmergencyActive = eventState.overrideMode === 'emergency';
  const isBlackoutActive = eventState.overrideMode === 'blackout';

  return (
    <header className="bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Event Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/60">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-white uppercase font-mono">
                  SmartScreen
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                  Console
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium truncate max-w-[240px] md:max-w-md">
                {eventState.brandKit.eventName || 'Centralized Event Display'}
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-white/10" />

          {/* Connected Displays Presence Badge (Number in pure white) */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10">
            <Tv className="w-4 h-4 text-blue-400" />
            <div className="text-xs">
              <span className="text-neutral-400 uppercase font-medium mr-1.5 text-[11px] tracking-wider">
                Displays:
              </span>
              <span className="font-mono font-black text-white text-sm">
                {connectedDisplaysCount}
              </span>
            </div>
          </div>

          {/* Sync Engine Status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs">
            {isFirebaseConnected ? (
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Firebase Cloud Sync
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Local Mesh Sync
              </span>
            )}
          </div>
        </div>

        {/* Right: Operations & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Open Public Display in New Window (Blue Toned Button) */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/50"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Open /display</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          {/* Stage Blackout Toggle */}
          <button
            onClick={toggleBlackout}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isBlackoutActive
                ? 'bg-neutral-800 text-white border-white/40 ring-1 ring-white/30'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10'
            }`}
            title="Blackout all connected displays"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{isBlackoutActive ? 'Exit Blackout' : 'Blackout'}</span>
          </button>

          {/* Emergency Broadcast Button */}
          {isEmergencyActive ? (
            <button
              onClick={restoreFromEmergency}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-900/50 animate-pulse transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Restore Scene</span>
            </button>
          ) : (
            <button
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-700/50 text-xs font-black uppercase tracking-wider transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 transition-colors"
            title="Configure Firebase & System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
