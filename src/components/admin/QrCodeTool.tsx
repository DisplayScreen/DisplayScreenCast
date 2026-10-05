'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Check,
  Wifi,
  FileText,
  MessageSquare,
} from 'lucide-react';

export function QrCodeTool() {
  const { activeScene, updateScene } = useSmartScreen();

  const [qrUrl, setQrUrl] = useState('https://smartscreen.live/schedule');
  const [qrLabel, setQrLabel] = useState('Scan for Live Schedule & Slido Q&A');
  const [added, setAdded] = useState(false);

  const presets = [
    { label: 'Live Schedule', url: 'https://smartscreen.live/schedule', desc: 'Scan for Schedule & Agenda', icon: FileText },
    { label: 'Event Feedback', url: 'https://smartscreen.live/feedback', desc: 'Scan to Share Feedback', icon: MessageSquare },
    { label: 'Guest Wi-Fi', url: 'WIFI:S:TechSummit-Guest;T:WPA;P:innovate2026;;', desc: 'Scan to Join Event Wi-Fi', icon: Wifi },
    { label: 'Attendee Registration', url: 'https://smartscreen.live/register', desc: 'Scan to Check-in / Register', icon: QrCode },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setQrUrl(p.url);
    setQrLabel(p.desc);
  };

  const handleAddToCurrentScene = async () => {
    if (!activeScene) return;

    const newElement = {
      id: 'el-qr-' + Date.now().toString(36),
      type: 'qrcode' as const,
      name: 'Dynamic QR Code',
      style: {
        left: 40,
        top: 60,
        width: 20,
        height: 25,
        zIndex: (activeScene.elements.length || 0) + 1,
      },
      content: {
        qrUrl,
        qrLabel,
      },
    };

    await updateScene(activeScene.id, {
      elements: [...activeScene.elements, newElement],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">QR Code Generator</h3>
            <p className="text-[11px] text-slate-400">
              Create and embed dynamic QR codes for screens
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <span className="text-xs font-semibold text-slate-400 block mb-2">Popular Event Presets:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/20 text-left transition-colors text-xs"
              >
                <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Generator Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Target URL or Data</label>
            <input
              type="text"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Display Caption / Label</label>
            <input
              type="text"
              value={qrLabel}
              onChange={(e) => setQrLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              placeholder="e.g. Scan to Register"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleAddToCurrentScene}
              disabled={!activeScene}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{added ? 'Added to Scene!' : 'Insert into Active Scene'}</span>
            </button>
          </div>
        </div>

        {/* Live SVG Preview Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
          <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <QRCodeSVG
              value={qrUrl || 'https://smartscreen.live'}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          {qrLabel && (
            <p className="mt-3 text-xs font-bold text-slate-200 text-center tracking-wide max-w-xs">
              {qrLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
