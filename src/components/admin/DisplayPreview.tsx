'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { SceneRenderer } from '@/components/display/SceneRenderer';
import { EmergencyOverlay } from '@/components/display/EmergencyOverlay';
import { BannerAnnouncement } from '@/components/display/BannerAnnouncement';
import { Maximize2 } from 'lucide-react';

export function DisplayPreview() {
  const {
    activeScene,
    eventState,
    connectedDisplaysCount,
  } = useSmartScreen();

  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9');

  const isEmergency = eventState.overrideMode === 'emergency';
  const isBlackout = eventState.overrideMode === 'blackout';

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl text-white">
      {/* Top Bar with Live Indicator & Aspect Ratio Switcher */}
      <div className="px-4 py-3 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            Live Screen Simulator
          </span>
          <span className="text-[11px] text-neutral-300 bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/10 font-mono">
            <span className="text-white font-bold">{connectedDisplaysCount}</span> {connectedDisplaysCount === 1 ? 'screen' : 'screens'} active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-white/10 text-[11px] font-mono">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              16:9 TV
            </button>
            <button
              onClick={() => setAspectRatio('4:3')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                aspectRatio === '4:3'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              4:3 Projector
            </button>
          </div>

          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            title="Open /display in dedicated window"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Simulator Screen Frame */}
      <div className="p-4 bg-slate-950/60 flex items-center justify-center min-h-[300px] lg:min-h-[420px]">
        <div
          className={`relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl transition-all ${
            aspectRatio === '16:9' ? 'aspect-video max-w-4xl' : 'aspect-[4/3] max-w-2xl'
          }`}
        >
          {isBlackout ? (
            <div className="w-full h-full bg-black flex items-center justify-center text-zinc-600 font-mono text-xs">
              STAGE BLACKOUT ACTIVE
            </div>
          ) : isEmergency ? (
            <div className="w-full h-full relative">
              <EmergencyOverlay emergency={eventState.emergency} />
            </div>
          ) : activeScene ? (
            <div className="w-full h-full relative">
              <BannerAnnouncement banner={eventState.bannerAnnouncement} />
              <SceneRenderer
                scene={activeScene}
                timerState={eventState.timer}
                aspectRatio={aspectRatio}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
              No active scene selected
            </div>
          )}
        </div>
      </div>

      {/* Simulator Status Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="truncate">
          Current Broadcast: <strong className="text-white">{activeScene?.name}</strong>
        </span>
        <span className="flex items-center gap-2">
          <span>Type: {activeScene?.type}</span>
          <span>•</span>
          <span>Mode: {aspectRatio}</span>
        </span>
      </div>
    </div>
  );
}
