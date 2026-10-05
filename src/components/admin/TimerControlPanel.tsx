'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { DisplayTimer } from '@/components/display/DisplayTimer';
import { AuthoritativeTimerState, TimerStyle } from '@/types/smartscreen';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
} from 'lucide-react';

export function TimerControlPanel() {
  const {
    eventState,
    updateTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTimer,
  } = useSmartScreen();

  const timer = eventState.timer;
  const { status, mode } = timer;

  const [activeTab, setActiveTab] = useState<'controls' | 'customization' | 'presets'>('controls');
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(15);
  const [customSeconds, setCustomSeconds] = useState(0);

  const [targetClockTime, setTargetClockTime] = useState('16:00');

  const presets = [
    { label: '1m', ms: 1 * 60 * 1000 },
    { label: '3m', ms: 3 * 60 * 1000 },
    { label: '5m', ms: 5 * 60 * 1000 },
    { label: '10m', ms: 10 * 60 * 1000 },
    { label: '15m', ms: 15 * 60 * 1000 },
    { label: '20m', ms: 20 * 60 * 1000 },
    { label: '30m', ms: 30 * 60 * 1000 },
    { label: '45m', ms: 45 * 60 * 1000 },
    { label: '60m', ms: 60 * 60 * 1000 },
  ];

  const timerStyles: Array<{ id: TimerStyle; label: string; desc: string }> = [
    { id: 'massive', label: 'Massive Minimal', desc: 'Ultra-large high contrast numerals' },
    { id: 'circular', label: 'Radial Ring Gauge', desc: 'Futuristic glowing progress circle' },
    { id: 'segmented', label: 'Segmented Glass Cards', desc: 'Individual frosted cards for HH/MM/SS' },
    { id: 'pill', label: 'Capsule Pill Bar', desc: 'Horizontal glass badge with progress' },
  ];

  const handleApplyExactDuration = () => {
    const totalMs = (customHours * 3600 + customMinutes * 60 + customSeconds) * 1000;
    if (totalMs > 0) {
      resetTimer(totalMs);
    }
  };

  const handleSetTargetClockTime = () => {
    const [h, m] = targetClockTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        // Target is next day
        diff += 24 * 3600 * 1000;
      }
      resetTimer(diff);
      updateTimer({
        mode: 'countdown',
        label: `COUNTDOWN TO ${targetClockTime}`,
      });
    }
  };

  const updateSetting = <K extends keyof AuthoritativeTimerState>(
    key: K,
    value: AuthoritativeTimerState[K]
  ) => {
    updateTimer({ [key]: value });
  };

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Authoritative Timer Console</h3>
            <p className="text-[11px] text-neutral-400">
              Synchronized timestamp engine • A to Z customizer • Zero recurring writes
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Controls
          </button>
          <button
            onClick={() => setActiveTab('customization')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'customization'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            A-Z Styling
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Duration
          </button>
        </div>
      </div>

      {/* Big Live Clock Mirror */}
      <div className="p-6 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-3 left-4 flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === 'running'
                ? 'bg-blue-500 animate-ping'
                : status === 'paused'
                ? 'bg-amber-400'
                : 'bg-neutral-600'
            }`}
          />
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            STATUS: <span className="text-white">{status}</span>
          </span>
        </div>

        <div className="absolute top-3 right-4 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase">
            {timer.style || 'massive'}
          </span>
        </div>

        <div className="my-2 w-full flex justify-center">
          <DisplayTimer
            timer={eventState.timer}
            fontSizeRem={3.8}
            showLabel={true}
          />
        </div>
      </div>

      {/* ================= TAB 1: OPERATOR CONTROLS ================= */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          {/* Main Playback Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {status === 'running' ? (
              <button
                onClick={pauseTimer}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-950/50"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : status === 'paused' ? (
              <button
                onClick={resumeTimer}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-950/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={() => startTimer()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-950/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={() => resetTimer()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition-all border border-white/10"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => adjustTimer(60000)}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition-all border border-white/10"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+1 Min</span>
            </button>
          </div>

          {/* Quick Delta Adjust Buttons (Numbers White, Buttons Blue) */}
          <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-neutral-400 font-mono text-[11px]">Instant Delta Adjust:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => adjustTimer(-300000)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-bold border border-white/10 transition-colors"
              >
                -5m
              </button>
              <button
                onClick={() => adjustTimer(-60000)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-bold border border-white/10 transition-colors"
              >
                -1m
              </button>
              <button
                onClick={() => adjustTimer(-30000)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-bold border border-white/10 transition-colors"
              >
                -30s
              </button>
              <button
                onClick={() => adjustTimer(30000)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white font-mono font-bold border border-blue-500/40 transition-colors"
              >
                +30s
              </button>
              <button
                onClick={() => adjustTimer(60000)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white font-mono font-bold border border-blue-500/40 transition-colors"
              >
                +1m
              </button>
              <button
                onClick={() => adjustTimer(300000)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white font-mono font-bold border border-blue-500/40 transition-colors"
              >
                +5m
              </button>
              <button
                onClick={() => adjustTimer(600000)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white font-mono font-bold border border-blue-500/40 transition-colors"
              >
                +10m
              </button>
            </div>
          </div>

          {/* Titles & Mode Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-neutral-400 text-xs font-semibold block mb-1">
                Headline / Round Label
              </label>
              <input
                type="text"
                value={timer.label}
                onChange={(e) => updateSetting('label', e.target.value)}
                placeholder="ROUND 1 COUNTDOWN"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 text-xs font-semibold block mb-1">
                Supporting Subtitle / Guidance
              </label>
              <input
                type="text"
                value={timer.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Submit all solutions before buzzer"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: A TO Z CUSTOMIZATION ================= */}
      {activeTab === 'customization' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Visual Presentation Styles */}
          <div>
            <label className="text-neutral-300 font-bold block mb-2">Visual Presentation Style</label>
            <div className="grid grid-cols-2 gap-2">
              {timerStyles.map((s) => {
                const isSelected = (timer.style || 'massive') === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => updateSetting('style', s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-md shadow-blue-950/40'
                        : 'bg-neutral-900 border-white/10 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{s.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
            {/* Show Hours */}
            <div
              onClick={() => updateSetting('showHours', !timer.showHours)}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Show Hours</span>
                <span className="text-[10px] text-neutral-400">Display HH:MM:SS</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.showHours ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {timer.showHours && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Show Milliseconds */}
            <div
              onClick={() => updateSetting('showMilliseconds', !timer.showMilliseconds)}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Milliseconds</span>
                <span className="text-[10px] text-neutral-400">Dramatic fast tick</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.showMilliseconds ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {timer.showMilliseconds && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Colon Blinking */}
            <div
              onClick={() => updateSetting('blinkSeparator', !(timer.blinkSeparator ?? true))}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Colon Flashing</span>
                <span className="text-[10px] text-neutral-400">Pulse separator</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.blinkSeparator ?? true ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {(timer.blinkSeparator ?? true) && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Progress Bar */}
            <div
              onClick={() => updateSetting('showProgressBar', !(timer.showProgressBar ?? true))}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Progress Bar</span>
                <span className="text-[10px] text-neutral-400">Bottom elapsed bar</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.showProgressBar ?? true ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {(timer.showProgressBar ?? true) && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Sound on Finish */}
            <div
              onClick={() => updateSetting('soundOnFinish', !(timer.soundOnFinish ?? true))}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Audio Chime</span>
                <span className="text-[10px] text-neutral-400">Synthesizer alert</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.soundOnFinish ?? true ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {(timer.soundOnFinish ?? true) && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Allow Negative Overtime */}
            <div
              onClick={() => updateSetting('allowNegativeOvertime', !timer.allowNegativeOvertime)}
              className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-500/50"
            >
              <div>
                <span className="font-bold text-white block">Overtime Count</span>
                <span className="text-[10px] text-neutral-400">Count past zero</span>
              </div>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  timer.allowNegativeOvertime ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                }`}
              >
                {timer.allowNegativeOvertime && <Check className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Thresholds and Finish Message */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="text-neutral-400 text-xs font-semibold block mb-1">
                Warning Threshold (sec)
              </label>
              <input
                type="number"
                min={5}
                max={600}
                value={timer.warningThresholdSeconds ?? 120}
                onChange={(e) => updateSetting('warningThresholdSeconds', Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-neutral-400 text-xs font-semibold block mb-1">
                Critical Threshold (sec)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={timer.criticalThresholdSeconds ?? 30}
                onChange={(e) => updateSetting('criticalThresholdSeconds', Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-neutral-400 text-xs font-semibold block mb-1">
                Finish Message
              </label>
              <input
                type="text"
                value={timer.finishMessage || "TIME'S UP • PENCILS DOWN"}
                onChange={(e) => updateSetting('finishMessage', e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DURATION & TARGETS ================= */}
      {activeTab === 'presets' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-white/10">
            <div>
              <span className="font-bold text-white block">Operating Mode</span>
              <span className="text-[10px] text-neutral-400">
                Choose countdown, stopwatch, or clock target
              </span>
            </div>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => updateTimer({ mode: 'countdown' })}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mode === 'countdown'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Countdown
              </button>
              <button
                onClick={() => updateTimer({ mode: 'stopwatch' })}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mode === 'stopwatch'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Stopwatch
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-neutral-300 font-bold block mb-2">Preset Durations:</span>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => resetTimer(p.ms)}
                  className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold text-xs transition-all border border-white/10 hover:border-blue-500/50 hover:scale-105"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exact Duration Dials */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-white/10 space-y-3">
            <span className="text-neutral-300 font-bold block">Set Exact Hours, Minutes & Seconds</span>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                  Hours
                </span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold text-center"
                />
              </div>
              <span className="text-white text-xl font-bold font-mono pt-4">:</span>
              <div className="flex-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                  Minutes
                </span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold text-center"
                />
              </div>
              <span className="text-white text-xl font-bold font-mono pt-4">:</span>
              <div className="flex-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                  Seconds
                </span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold text-center"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleApplyExactDuration}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-950/50 shrink-0"
                >
                  Set Duration
                </button>
              </div>
            </div>
          </div>

          {/* Scheduled Target Clock Time */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white block">Countdown to Scheduled Clock Time</span>
              <span className="text-[10px] text-neutral-400">
                Automatically calculates remaining time to a specific target hour (24-hour)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={targetClockTime}
                onChange={(e) => setTargetClockTime(e.target.value)}
                className="bg-neutral-950 border border-white/10 rounded-xl p-2 text-white font-mono font-bold text-xs"
              />
              <button
                onClick={handleSetTargetClockTime}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-950/50"
              >
                Set Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
