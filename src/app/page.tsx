'use client';

import React from 'react';
import Link from 'next/link';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Tv,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  ShieldAlert,
  Timer,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const {
    connectedDisplaysCount,
  } = useSmartScreen();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[160px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/60">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-mono font-black text-sm tracking-wider uppercase text-white">
                SmartScreen
              </span>
              <span className="text-[10px] text-blue-400 font-mono ml-2 px-1.5 py-0.5 rounded bg-blue-600/20 border border-blue-500/30">
                PRO CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-white/[0.08] text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-white font-bold">{connectedDisplaysCount}</span> Display(s) Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Centralized Event Display System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          One Admin Console. <br />
          <span className="bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
            Unlimited Physical Screens.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed mb-10">
          Zero screen registration. No device pairing or manual setup. Open{' '}
          <code className="text-blue-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.08] font-mono font-bold">
            /display
          </code>{' '}
          on any TV, projector, or screen to instantly receive realtime broadcasts from{' '}
          <code className="text-blue-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.08] font-mono font-bold">
            /admin
          </code>
          .
        </p>

        {/* The Two Primary Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          {/* Public Display Card */}
          <Link
            href="/display"
            target="_blank"
            className="group relative p-8 rounded-3xl bg-neutral-950/80 border border-white/[0.08] hover:border-blue-500/50 hover:bg-neutral-900/80 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                  /display
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Presentation Screen
                </span>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed">
                Open this URL on all physical screens, venue TVs, and stage projectors.
                Automatically receives the current scene, timers, and emergency overrides.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span className="flex items-center gap-1.5">
                <span>Launch Presentation Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Admin Control Center Card */}
          <Link
            href="/admin"
            className="group relative p-8 rounded-3xl bg-neutral-950/80 border border-white/[0.08] hover:border-blue-500/50 hover:bg-neutral-900/80 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                  /admin
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Operations Console
                </span>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed">
                Control the active event scene, authoritative countdown timers, visual drag-and-drop
                editor, announcements queue, schedule, and emergency broadcasts.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Open Admin Control Center</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mt-12 text-left">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/[0.08]">
            <Zap className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Realtime Sync</h4>
            <p className="text-[11px] text-neutral-400">
              Firebase Firestore + Local Mesh BroadcastChannel for zero-latency updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/[0.08]">
            <Timer className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Authoritative Timer</h4>
            <p className="text-[11px] text-neutral-400">
              Synced timestamp engine. Local client countdowns with zero Firestore writes per sec.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/[0.08]">
            <Layers className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Visual Studio</h4>
            <p className="text-[11px] text-neutral-400">
              Drag-and-drop designer with movable text, images, videos, timers, and QR codes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/[0.08]">
            <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Emergency Override</h4>
            <p className="text-[11px] text-neutral-400">
              1-click safety broadcast taking over all screens simultaneously with 1-click restore.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-6 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SmartScreen Centralized Event Display Engine</span>
          <span>Designed for Physical Displays, TVs, and Projectors</span>
        </div>
      </footer>
    </div>
  );
}
