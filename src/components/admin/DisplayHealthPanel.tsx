'use client';

import React from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Tv,
  Activity,
} from 'lucide-react';

export function DisplayHealthPanel() {
  const {
    connectedDisplays,
    connectedDisplaysCount,
    lastSyncTime,
    activeScene,
  } = useSmartScreen();

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Physical Display Presence & Health</h3>
            <p className="text-[11px] text-neutral-400">
              Anonymous zero-configuration telemetry across connected venue screens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            LIVE TELEMETRY
          </span>
        </div>
      </div>

      {/* 4-Stat High-Visibility Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 tracking-wider block mb-1">
            Connected Displays
          </span>
          <div className="text-3xl font-black font-mono text-white">
            {connectedDisplaysCount}
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Physical screens active</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 tracking-wider block mb-1">
            Online Clients
          </span>
          <div className="text-3xl font-black font-mono text-white">
            {connectedDisplaysCount}
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Heartbeat &lt; 40s</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 tracking-wider block mb-1">
            Last Synchronization
          </span>
          <div className="text-xl font-black font-mono text-white truncate mt-1">
            {new Date(lastSyncTime).toLocaleTimeString()}
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Realtime push verified</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Current Active Scene
          </span>
          <div className="text-sm font-black text-white truncate mt-1">
            {activeScene?.name || 'None'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block uppercase font-mono">
            Type: {activeScene?.type}
          </span>
        </div>
      </div>

      {/* Anonymous Screen Session Resolutions */}
      {connectedDisplays.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold block">
            Active Physical Screen Viewports:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {connectedDisplays.map((disp, idx) => (
              <div
                key={disp.sessionId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-slate-300 font-bold">Screen #{idx + 1}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{disp.resolution}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
