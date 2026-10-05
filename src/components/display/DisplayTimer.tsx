'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AuthoritativeTimerState } from '@/types/smartscreen';

interface DisplayTimerProps {
  timer: AuthoritativeTimerState;
  fontSize?: string | number;
  fontSizeRem?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

// Gentle Web Audio API synthesizer chime when timer reaches 0
function playTimerCompleteChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Triumphant 3-tone event chime
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.8);
    });
  } catch {
    // Audio autoplay might be blocked before first interaction
  }
}

export function DisplayTimer({
  timer,
  fontSize,
  fontSizeRem = 6,
  className = '',
  showLabel = true,
}: DisplayTimerProps) {
  const [tickerMs, setTickerMs] = useState<number>(0);
  const [colonVisible, setColonVisible] = useState(true);
  const hasChimedRef = useRef(false);

  const style = timer.style || 'massive';
  const showHours = timer.showHours ?? false;
  const showMilliseconds = timer.showMilliseconds ?? false;
  const showProgressBar = timer.showProgressBar ?? true;
  const blinkSeparator = timer.blinkSeparator ?? true;
  const soundOnFinish = timer.soundOnFinish ?? true;
  const finishMessage = timer.finishMessage || "TIME'S UP • SESSION FINISHED";
  const allowNegativeOvertime = timer.allowNegativeOvertime ?? false;
  const warningThreshold = (timer.warningThresholdSeconds ?? 120) * 1000;
  const criticalThreshold = (timer.criticalThresholdSeconds ?? 30) * 1000;

  useEffect(() => {
    if (timer.status !== 'running') {
      hasChimedRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (timer.mode === 'countdown' && timer.targetEndTime) {
        const remaining = timer.targetEndTime - now;
        if (remaining <= 0 && !allowNegativeOvertime) {
          setTickerMs(0);
          if (!hasChimedRef.current && soundOnFinish) {
            hasChimedRef.current = true;
            playTimerCompleteChime();
          }
        } else {
          setTickerMs(remaining);
          if (remaining <= 0 && !hasChimedRef.current && soundOnFinish) {
            hasChimedRef.current = true;
            playTimerCompleteChime();
          }
        }
      } else if (timer.mode === 'stopwatch' && timer.startTime) {
        setTickerMs(Math.max(0, now - timer.startTime));
      }
    }, showMilliseconds ? 33 : 100);

    return () => clearInterval(interval);
  }, [
    timer.status,
    timer.mode,
    timer.targetEndTime,
    timer.startTime,
    showMilliseconds,
    allowNegativeOvertime,
    soundOnFinish,
  ]);

  // Colon blink effect
  useEffect(() => {
    if (!blinkSeparator || timer.status !== 'running') {
      return;
    }
    const blinkInterval = setInterval(() => {
      setColonVisible((v) => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, [blinkSeparator, timer.status]);

  // Authoritative display milliseconds
  const displayMs =
    timer.status === 'running' ? tickerMs : timer.pausedRemaining || 0;

  const isNegative = displayMs < 0;
  const absMs = Math.abs(displayMs);
  const totalSeconds = Math.floor(absMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((absMs % 1000) / 10); // 2-digit centiseconds

  const pad = (n: number) => String(n).padStart(2, '0');

  const isCritical =
    timer.mode === 'countdown' &&
    timer.status === 'running' &&
    displayMs <= criticalThreshold &&
    displayMs > 0;

  const isWarning =
    timer.mode === 'countdown' &&
    timer.status === 'running' &&
    displayMs <= warningThreshold &&
    displayMs > criticalThreshold;

  const isExpired =
    timer.mode === 'countdown' && displayMs <= 0 && timer.status === 'running';

  // Calculate progress percentage
  const totalDuration = timer.totalDuration || 1;
  const progressPercent =
    timer.mode === 'countdown'
      ? Math.max(0, Math.min(100, (displayMs / totalDuration) * 100))
      : Math.min(100, (displayMs / totalDuration) * 100);

  const separatorClass =
    blinkSeparator && timer.status === 'running' && !colonVisible
      ? 'opacity-20'
      : 'opacity-100';

  const shouldRenderHours = showHours || hours > 0;

  // Render digits based on visual style
  const renderDigits = () => {
    const hoursStr = pad(hours);
    const minutesStr = pad(minutes);
    const secondsStr = pad(seconds);
    const millisStr = pad(millis);

    if (style === 'segmented') {
      return (
        <div className="flex items-center gap-2 sm:gap-4 my-2">
          {shouldRenderHours && (
            <>
              <div className="flex flex-col items-center">
                <div className="px-4 py-3 sm:px-6 sm:py-5 rounded-2xl bg-neutral-900/90 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                  <span className="font-mono font-black text-white text-3xl sm:text-6xl md:text-7xl tracking-wider">
                    {hoursStr}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1">
                  HOURS
                </span>
              </div>
              <span className={`text-white text-3xl sm:text-5xl font-mono font-black ${separatorClass}`}>
                :
              </span>
            </>
          )}

          <div className="flex flex-col items-center">
            <div className="px-4 py-3 sm:px-6 sm:py-5 rounded-2xl bg-neutral-900/90 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center">
              <span className="font-mono font-black text-white text-3xl sm:text-6xl md:text-7xl tracking-wider">
                {minutesStr}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1">
              MINUTES
            </span>
          </div>

          <span className={`text-white text-3xl sm:text-5xl font-mono font-black ${separatorClass}`}>
            :
          </span>

          <div className="flex flex-col items-center">
            <div className="px-4 py-3 sm:px-6 sm:py-5 rounded-2xl bg-neutral-900/90 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center">
              <span className="font-mono font-black text-white text-3xl sm:text-6xl md:text-7xl tracking-wider">
                {secondsStr}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1">
              SECONDS
            </span>
          </div>

          {showMilliseconds && (
            <>
              <span className="text-white text-2xl sm:text-4xl font-mono font-black opacity-60">.</span>
              <div className="flex flex-col items-center">
                <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                  <span className="font-mono font-bold text-white text-xl sm:text-4xl tracking-wider">
                    {millisStr}
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 mt-1">
                  MS
                </span>
              </div>
            </>
          )}
        </div>
      );
    }

    if (style === 'circular') {
      const radius = 130;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

      return (
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Active glowing ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150"
            />
          </svg>

          {/* Center Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isNegative && <span className="text-xs font-mono font-bold text-blue-400">OVERTIME</span>}
            <div className="flex items-baseline font-mono font-black text-white tracking-tight drop-shadow-2xl">
              <span className="text-4xl sm:text-6xl text-white">
                {isNegative ? '-' : ''}
                {shouldRenderHours ? `${hoursStr}:` : ''}
                {minutesStr}
                <span className={separatorClass}>:</span>
                {secondsStr}
              </span>
              {showMilliseconds && (
                <span className="text-lg sm:text-2xl text-white opacity-70 ml-1 font-mono">
                  .{millisStr}
                </span>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-white mt-1">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      );
    }

    if (style === 'pill') {
      return (
        <div className="px-8 py-5 rounded-full bg-neutral-950/80 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col items-center my-3 relative overflow-hidden">
          <div className="flex items-baseline font-mono font-black text-white tracking-tight">
            <span className="text-4xl sm:text-7xl text-white">
              {isNegative ? '-' : ''}
              {shouldRenderHours ? `${hoursStr}:` : ''}
              {minutesStr}
              <span className={separatorClass}>:</span>
              {secondsStr}
            </span>
            {showMilliseconds && (
              <span className="text-xl sm:text-3xl text-white opacity-80 ml-1 font-mono">
                .{millisStr}
              </span>
            )}
          </div>
          {showProgressBar && (
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-3 max-w-xs">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      );
    }

    // Default: Massive style
    return (
      <div
        style={{
          fontSize:
            typeof fontSize === 'string'
              ? fontSize
              : `${fontSize ?? fontSizeRem}rem`,
          lineHeight: 1,
        }}
        className={`font-black font-mono tracking-tight text-white transition-colors duration-300 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-baseline ${
          isCritical ? 'animate-pulse' : ''
        }`}
      >
        <span className="text-white">
          {isNegative ? '-' : ''}
          {shouldRenderHours ? `${hoursStr}:` : ''}
          {minutesStr}
          <span className={separatorClass}>:</span>
          {secondsStr}
        </span>
        {showMilliseconds && (
          <span className="text-[0.45em] text-white opacity-75 ml-2 font-mono">
            .{millisStr}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none text-center ${className}`}
    >
      {/* Title & Subtitle Badge */}
      {showLabel && timer.label && (
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs md:text-sm font-black tracking-widest uppercase">
            {timer.label}
          </span>
          {isCritical && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-white text-[11px] font-mono font-bold animate-pulse">
              FINAL SECONDS
            </span>
          )}
          {isWarning && !isCritical && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-600/20 border border-amber-500/40 text-white text-[11px] font-mono font-bold">
              CLOSING SOON
            </span>
          )}
        </div>
      )}

      {/* Digits Container */}
      {renderDigits()}

      {/* Bottom Subtitle / Instruction */}
      {timer.subtitle && (
        <p className="text-xs md:text-sm text-neutral-400 mt-2 font-medium max-w-lg">
          {timer.subtitle}
        </p>
      )}

      {/* Horizontal Progress Bar for massive / segmented styles */}
      {showProgressBar && style !== 'pill' && style !== 'circular' && (
        <div className="w-full max-w-md h-1.5 bg-neutral-900 border border-white/10 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100 shadow-sm shadow-blue-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Expired / Finish Message Banner */}
      {isExpired && (
        <div className="mt-4 px-6 py-2.5 rounded-2xl bg-neutral-950/90 border border-blue-500/50 backdrop-blur-xl shadow-2xl text-white font-black text-sm md:text-base tracking-wider uppercase animate-bounce">
          {finishMessage}
        </div>
      )}
    </div>
  );
}
