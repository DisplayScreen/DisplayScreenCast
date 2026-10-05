'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { BrandKit } from '@/types/smartscreen';
import { ImageSelectField } from './AssetPickerModal';
import {
  Palette,
  Save,
  Check,
} from 'lucide-react';

export function BrandKitPanel() {
  const { eventState, updateBrandKit } = useSmartScreen();
  const [brandKit, setBrandKit] = useState<BrandKit>(eventState.brandKit);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key: keyof BrandKit, value: string) => {
    setBrandKit((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBrandKit(brandKit);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-6 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Event Brand Kit</h3>
            <p className="text-[11px] text-neutral-400">
              Global theme, typography, event logo, and color identity
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-950/50"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Saved to Event!' : 'Save Brand Kit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Event Name */}
        <div>
          <label className="text-neutral-300 font-semibold block mb-1">Event Name</label>
          <input
            type="text"
            value={brandKit.eventName}
            onChange={(e) => handleChange('eventName', e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            placeholder="e.g. GLOBAL TECH SUMMIT 2026"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="text-neutral-300 font-semibold block mb-1">Event Tagline</label>
          <input
            type="text"
            value={brandKit.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. Leading the Future of AI & Innovation"
          />
        </div>
      </div>

      {/* Event Logo with Universal Image Picker */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10">
        <ImageSelectField
          label="Event Emblem / Logo"
          value={brandKit.logoUrl}
          onChange={(url) => handleChange('logoUrl', url)}
          placeholder="https://..."
          modalTitle="Select Event Emblem / Logo"
        />
      </div>

      {/* Colors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-neutral-300 font-semibold block mb-1.5">Primary Accent</label>
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl p-2">
            <input
              type="color"
              value={brandKit.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-white text-[11px] font-bold">
              {brandKit.primaryColor}
            </span>
          </div>
        </div>

        <div>
          <label className="text-neutral-300 font-semibold block mb-1.5">Secondary Color</label>
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl p-2">
            <input
              type="color"
              value={brandKit.secondaryColor}
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-white text-[11px] font-bold">
              {brandKit.secondaryColor}
            </span>
          </div>
        </div>

        <div>
          <label className="text-neutral-300 font-semibold block mb-1.5">Highlight Accent</label>
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl p-2">
            <input
              type="color"
              value={brandKit.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-white text-[11px] font-bold">
              {brandKit.accentColor}
            </span>
          </div>
        </div>

        <div>
          <label className="text-neutral-300 font-semibold block mb-1.5">Canvas Base</label>
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl p-2">
            <input
              type="color"
              value={brandKit.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-white text-[11px] font-bold">
              {brandKit.backgroundColor}
            </span>
          </div>
        </div>
      </div>

      {/* Typography Font */}
      <div className="text-xs">
        <label className="text-neutral-300 font-semibold block mb-1">
          Preferred Display Typography Font
        </label>
        <select
          value={brandKit.fontFamily}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="Inter, system-ui, sans-serif">Modern Sans (Inter / Clean)</option>
          <option value="'Space Grotesk', system-ui, sans-serif">High Tech (Space Grotesk)</option>
          <option value="'JetBrains Mono', monospace">Terminal / Code (JetBrains Mono)</option>
          <option value="system-ui, sans-serif">Native System High Contrast</option>
        </select>
      </div>
    </form>
  );
}
