'use client';

import React from 'react';
import { EmergencyBroadcastState } from '@/types/smartscreen';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface EmergencyOverlayProps {
  emergency: EmergencyBroadcastState;
}

export function EmergencyOverlay({ emergency }: EmergencyOverlayProps) {
  const isCritical = emergency.severity === 'critical';
  const isWarning = emergency.severity === 'warning';

  const themeColors = isCritical
    ? {
        bg: 'bg-red-950/95',
        border: 'border-red-600',
        text: 'text-red-400',
        accent: 'bg-red-600',
        glow: 'rgba(239, 68, 68, 0.4)',
      }
    : isWarning
    ? {
        bg: 'bg-amber-950/95',
        border: 'border-amber-500',
        text: 'text-amber-400',
        accent: 'bg-amber-500',
        glow: 'rgba(245, 158, 11, 0.4)',
      }
    : {
        bg: 'bg-sky-950/95',
        border: 'border-sky-500',
        text: 'text-sky-400',
        accent: 'bg-sky-500',
        glow: 'rgba(14, 165, 233, 0.4)',
      };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 md:p-16 ${themeColors.bg} backdrop-blur-xl animate-fade-in select-none`}
      style={{
        boxShadow: `inset 0 0 100px ${themeColors.glow}`,
      }}
    >
      {/* Pulsing Emergency Border Indicator */}
      <div
        className={`absolute inset-4 md:inset-8 border-4 ${themeColors.border} rounded-3xl animate-pulse pointer-events-none`}
      />

      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-8 z-10">
        {/* Animated Badge */}
        <div
          className={`flex items-center gap-3 px-6 py-2.5 rounded-full ${themeColors.accent} text-white font-black tracking-widest text-sm md:text-base uppercase shadow-2xl animate-bounce`}
        >
          {isCritical ? (
            <ShieldAlert className="w-6 h-6 animate-spin" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
          <span>EMERGENCY BROADCAST ACTIVE</span>
        </div>

        {/* Emergency Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-none drop-shadow-2xl">
          {emergency.title || 'ATTENTION REQUIRED'}
        </h1>

        {/* Emergency Message */}
        <div className="w-full max-w-4xl p-8 rounded-2xl bg-black/60 border border-white/20 shadow-2xl backdrop-blur-md">
          <p className="text-2xl sm:text-3xl md:text-4xl text-slate-100 font-medium leading-relaxed">
            {emergency.message ||
              'Please pause event activities and follow official venue staff instructions.'}
          </p>
        </div>

        {/* Timestamp & Status */}
        <div className="flex items-center gap-6 text-sm md:text-base font-mono text-slate-300">
          <span>BROADCAST TIME: {new Date(emergency.timestamp).toLocaleTimeString()}</span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            STAND BY FOR UPDATES
          </span>
        </div>
      </div>
    </div>
  );
}
