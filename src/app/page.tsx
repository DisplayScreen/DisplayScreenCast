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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[130px]" />
        <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-950/50">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-mono font-black text-sm tracking-wider uppercase">
                SmartScreen
              </span>
              <span className="text-[10px] text-sky-400 font-mono ml-2 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                v2.0 PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {connectedDisplaysCount} Display(s) Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold tracking-wide uppercase mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Centralized Event Display System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          One Admin Console. <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Unlimited Physical Screens.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Zero screen registration. No device pairing or manual setup. Open{' '}
          <code className="text-sky-400 bg-slate-900 px-2 py-0.5 rounded font-mono font-bold">
            /display
          </code>{' '}
          on any TV, projector, or screen to instantly receive realtime broadcasts from{' '}
          <code className="text-sky-400 bg-slate-900 px-2 py-0.5 rounded font-mono font-bold">
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
            className="group relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                  /display
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Presentation Screen
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                Open this URL on all physical screens, venue TVs, and stage projectors.
                Automatically receives the current scene, timers, and emergency overrides.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
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
            className="group relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                  /admin
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Operations Console
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                Control the active event scene, authoritative countdown timers, visual drag-and-drop
                editor, announcements queue, schedule, and emergency broadcasts.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Open Admin Control Center</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mt-12 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Realtime Sync</h4>
            <p className="text-[11px] text-slate-400">
              Firebase Firestore + Local Mesh BroadcastChannel for zero-latency updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Timer className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Authoritative Timer</h4>
            <p className="text-[11px] text-slate-400">
              Synced timestamp engine. Local client countdowns with zero Firestore writes per sec.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Layers className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Visual Studio</h4>
            <p className="text-[11px] text-slate-400">
              Drag-and-drop designer with movable text, images, videos, timers, and QR codes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
            <h4 className="font-bold text-white text-xs mb-1">Emergency Override</h4>
            <p className="text-[11px] text-slate-400">
              1-click safety broadcast taking over all screens simultaneously with 1-click restore.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SmartScreen Centralized Event Display Engine</span>
          <span>Designed for Physical Displays, TVs, and Projectors</span>
        </div>
      </footer>
    </div>
  );
}
