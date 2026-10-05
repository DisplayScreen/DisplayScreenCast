'use client';

import React, { useState, useEffect } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Radio,
  RotateCcw,
} from 'lucide-react';

export function PresentationControls() {
  const {
    scenes,
    eventState,
    broadcastScene,
  } = useSmartScreen();

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoIntervalSec = 15;

  const currentIndex = scenes.findIndex((s) => s.id === eventState.activeSceneId);
  const activeScene = currentIndex >= 0 ? scenes[currentIndex] : scenes[0];

  const handlePrevious = () => {
    if (scenes.length === 0) return;
    const nextIdx = (currentIndex - 1 + scenes.length) % scenes.length;
    broadcastScene(scenes[nextIdx].id);
  };

  const handleNext = () => {
    if (scenes.length === 0) return;
    const nextIdx = (currentIndex + 1) % scenes.length;
    broadcastScene(scenes[nextIdx].id);
  };

  // Auto slide rotation interval
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      const nextIdx = (currentIndex + 1) % scenes.length;
      broadcastScene(scenes[nextIdx].id);
    }, autoIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex, scenes, autoIntervalSec, broadcastScene]);

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl text-white">
      {/* Current Scene Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          <span>
            LIVE #<span className="text-white font-mono font-bold">{currentIndex + 1}</span>/
            <span className="text-white font-mono font-bold">{scenes.length}</span>
          </span>
        </div>
        <div className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
          {activeScene?.name || 'No scene active'}
        </div>
      </div>

      {/* Playhead Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors border border-white/10"
          title="Previous Scene"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isAutoPlaying
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-950/50'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-white/10'
          }`}
          title={isAutoPlaying ? 'Pause Auto-cycle' : 'Start Auto-cycle Scene Slideshow'}
        >
          {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoPlaying ? 'Auto Cycling' : 'Auto Play'}</span>
        </button>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors border border-white/10"
          title="Next Scene"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Re-broadcast current scene */}
        <button
          onClick={() => broadcastScene(eventState.activeSceneId)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/50"
          title="Force-push active scene state to all displays"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
}
