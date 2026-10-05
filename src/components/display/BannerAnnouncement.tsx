'use client';

import React, { useEffect, useState } from 'react';
import { BannerAnnouncement as BannerType } from '@/types/smartscreen';
import { Bell, AlertCircle, Info, X } from 'lucide-react';

interface BannerAnnouncementProps {
  banner: BannerType | null;
  onDismiss?: () => void;
}

// Gentle Web Audio API synthesizer chime
function playPingChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Dual-tone pleasant chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  } catch {
    // Audio autoplay might be blocked before first interaction
  }
}

export function BannerAnnouncement({ banner, onDismiss }: BannerAnnouncementProps) {
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(100);

  const durationSeconds = banner?.durationSeconds || 8;
  const isPingMode = banner?.mode !== 'pinned';
  const bannerKey = banner && banner.active && banner.text ? `${banner.id || 'b'}_${banner.text}` : null;
  const isVisible = Boolean(bannerKey && dismissedKey !== bannerKey);

  useEffect(() => {
    if (!bannerKey) return;

    // Play pleasant attention chime on arrival
    playPingChime();

    // Auto-dismiss countdown if ping mode
    if (isPingMode) {
      const startTime = Date.now();
      const totalMs = durationSeconds * 1000;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalMs - elapsed);
        const percent = (remaining / totalMs) * 100;
        setProgressPercent(percent);

        if (remaining <= 0) {
          clearInterval(progressInterval);
          setDismissedKey(bannerKey);
          if (onDismiss) onDismiss();
        }
      }, 50);

      return () => clearInterval(progressInterval);
    }
  }, [bannerKey, durationSeconds, isPingMode, onDismiss]);

  if (!banner || !banner.active || !banner.text || !isVisible) {
    return null;
  }

  const typeConfig = {
    urgent: {
      border: 'border-red-500/80',
      bg: 'bg-slate-950/95',
      badge: 'bg-red-600 text-white',
      glow: 'shadow-red-950/60',
      icon: AlertCircle,
      tag: 'URGENT ANNOUNCEMENT',
      progress: 'bg-red-500',
    },
    warning: {
      border: 'border-amber-500/80',
      bg: 'bg-slate-950/95',
      badge: 'bg-amber-500 text-slate-950 font-black',
      glow: 'shadow-amber-950/60',
      icon: Bell,
      tag: 'EVENT NOTICE',
      progress: 'bg-amber-500',
    },
    info: {
      border: 'border-sky-500/80',
      bg: 'bg-slate-950/95',
      badge: 'bg-sky-500 text-slate-950 font-black',
      glow: 'shadow-sky-950/60',
      icon: Info,
      tag: 'LIVE ANNOUNCEMENT',
      progress: 'bg-sky-500',
    },
  }[banner.type || 'info'];

  const Icon = typeConfig.icon;

  // Render as floating ping notification (or top bar if pinned)
  if (!isPingMode) {
    // Persistent Top Bar
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 border-b-2 border-sky-500 shadow-2xl py-3 px-6 flex items-center justify-between select-none animate-slide-down">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${typeConfig.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {typeConfig.tag}
          </span>
          <p className="text-base md:text-xl font-bold tracking-wide text-white truncate">
            {banner.text}
          </p>
        </div>
      </div>
    );
  }

  // Floating Ping Notification Pill / Card
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 select-none animate-bounce-short">
      <div
        className={`relative overflow-hidden rounded-2xl ${typeConfig.bg} border-2 ${typeConfig.border} shadow-2xl ${typeConfig.glow} backdrop-blur-xl p-4 md:p-5 flex flex-col gap-2.5 transition-all`}
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 0 20px rgba(255,255,255,0.05)',
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
            </span>
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black tracking-wider uppercase ${typeConfig.badge}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{typeConfig.tag}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              DISMISSING IN <span className="text-white font-mono font-black">{Math.ceil((durationSeconds * progressPercent) / 100)}s</span>
            </span>
          </div>

          <button
            onClick={() => {
              setDismissedKey(bannerKey);
              if (onDismiss) onDismiss();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Headline & Body */}
        <div>
          {banner.title && (
            <h4 className="text-sm md:text-base font-black text-sky-400 uppercase tracking-wide">
              {banner.title}
            </h4>
          )}
          <p className="text-base md:text-xl font-bold text-white leading-snug drop-shadow-md">
            {banner.text}
          </p>
        </div>

        {/* Progress Countdown Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full ${typeConfig.progress} transition-all duration-75`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
