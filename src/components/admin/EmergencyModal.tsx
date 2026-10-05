'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CloudLightning,
  Wrench,
  X,
  Radio,
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { triggerEmergency } = useSmartScreen();

  const presets = [
    {
      title: 'IMMEDIATE EVACUATION',
      message: 'Please remain calm and proceed immediately to the nearest emergency exit. Do not use elevators.',
      severity: 'critical' as const,
      icon: Flame,
    },
    {
      title: 'SEVERE WEATHER ALERT',
      message: 'Severe weather condition reported in the area. Please remain inside the main auditorium until all clear.',
      severity: 'warning' as const,
      icon: CloudLightning,
    },
    {
      title: 'TECHNICAL INTERMISSION',
      message: 'We are experiencing temporary technical difficulties. Main stage program will resume shortly.',
      severity: 'warning' as const,
      icon: Wrench,
    },
    {
      title: 'MEDICAL ASSISTANCE REQUIRED',
      message: 'Medical response team is attending to an incident. Please clear aisle ways and keep passages free.',
      severity: 'critical' as const,
      icon: ShieldAlert,
    },
  ];

  const [selectedTitle, setSelectedTitle] = useState(presets[0].title);
  const [selectedMessage, setSelectedMessage] = useState(presets[0].message);
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setSelectedTitle(p.title);
    setSelectedMessage(p.message);
    setSeverity(p.severity);
  };

  const handleBroadcast = async () => {
    if (!confirmed) return;
    await triggerEmergency(selectedTitle, selectedMessage, severity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-red-600/70 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Pulsing red top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600 animate-pulse" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <h2 className="text-lg font-black tracking-wider uppercase text-white font-mono">
              Emergency Broadcast Override
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          {/* Presets */}
          <div>
            <span className="text-slate-400 font-semibold block mb-2">Select Emergency Preset:</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-600/50 hover:bg-red-950/20 text-left transition-colors"
                  >
                    <Icon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-200 truncate">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Override Headline</label>
            <input
              type="text"
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold text-sm tracking-wide"
            />
          </div>

          {/* Message input */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Emergency Instructions</label>
            <textarea
              rows={3}
              value={selectedMessage}
              onChange={(e) => setSelectedMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs leading-relaxed"
            />
          </div>

          {/* Severity selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-300 font-semibold">Visual Severity:</span>
            <div className="flex gap-2">
              {(['critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    severity === sev
                      ? sev === 'critical'
                        ? 'bg-red-600 text-white'
                        : sev === 'warning'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Accidental click protection confirmation */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-red-950/30 border border-red-600/30 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 rounded accent-red-600"
            />
            <span className="text-red-200 text-[11px] leading-tight">
              I confirm that I intend to override all physical screens immediately with this alert.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!confirmed}
            onClick={handleBroadcast}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/50 transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Broadcast Emergency</span>
          </button>
        </div>
      </div>
    </div>
  );
}
