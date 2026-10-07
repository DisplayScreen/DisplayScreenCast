'use client';

import React, { useState, useEffect } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Sparkles,
  BookOpen,
  Timer,
  Megaphone,
  Coffee,
  Trophy,
  Moon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Radio,
} from 'lucide-react';

interface QuickBroadcastBarProps {
  onOpenEmergencyModal: () => void;
  onSelectPreset?: (type: string) => void;
}

export function QuickBroadcastBar({ onOpenEmergencyModal, onSelectPreset }: QuickBroadcastBarProps) {
  const {
    scenes,
    eventState,
    broadcastScene,
    toggleBlackout,
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

  // Helper to find a scene by its type
  const getSceneIdByType = (type: string) => {
    const found = scenes.find((s) => s.type === type);
    return found ? found.id : null;
  };

  const handleBroadcastType = (type: string) => {
    if (onSelectPreset) {
      onSelectPreset(type);
    }
    const targetId = getSceneIdByType(type);
    if (targetId) {
      broadcastScene(targetId);
    }
  };

  const activeSceneType = scenes.find((s) => s.id === eventState.activeSceneId)?.type;
  const isBlackout = eventState.overrideMode === 'blackout';

  const quickActions = [
    {
      id: 'welcome',
      label: 'Welcome',
      icon: Sparkles,
      action: () => handleBroadcastType('welcome'),
      isActive: activeSceneType === 'welcome' && !isBlackout,
    },
    {
      id: 'rules',
      label: 'Rules',
      icon: BookOpen,
      action: () => handleBroadcastType('rules'),
      isActive: activeSceneType === 'rules' && !isBlackout,
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: Timer,
      action: () => handleBroadcastType('timer'),
      isActive: activeSceneType === 'timer' && !isBlackout,
    },
    {
      id: 'announcement',
      label: 'Announcement',
      icon: Megaphone,
      action: () => handleBroadcastType('announcement'),
      isActive: activeSceneType === 'announcement' && !isBlackout,
    },
    {
      id: 'break',
      label: 'Break',
      icon: Coffee,
      action: () => handleBroadcastType('break'),
      isActive: activeSceneType === 'break' && !isBlackout,
    },
    {
      id: 'results',
      label: 'Results',
      icon: Trophy,
      action: () => handleBroadcastType('results'),
      isActive: activeSceneType === 'results' && !isBlackout,
    },
    {
      id: 'blackout',
      label: 'Clear Screen',
      icon: Moon,
      action: toggleBlackout,
      isActive: isBlackout,
    },
    {
      id: 'emergency',
      label: 'Emergency Alert',
      icon: AlertTriangle,
      action: onOpenEmergencyModal,
      isActive: eventState.overrideMode === 'emergency',
      isEmergency: true,
    },
  ];

  return (
    <div className="w-full bg-neutral-950/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl space-y-3.5">
      {/* Top Director Bar: Header Info + Presentation Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        {/* Left: Section Label & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              Broadcast Director
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-bold">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>
              LIVE #<span className="text-white font-mono font-bold">{currentIndex + 1}</span>/
              <span className="text-white font-mono font-bold">{scenes.length}</span>:
            </span>
            <span className="text-white font-bold truncate max-w-[140px] sm:max-w-[200px]">
              {activeScene?.name || 'Ready'}
            </span>
          </div>
        </div>

        {/* Right: Slide Deck Playhead Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handlePrevious}
            className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-white/[0.08]"
            title="Previous Scene"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAutoPlaying
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-950/60'
                : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/[0.08]'
            }`}
            title={isAutoPlaying ? 'Pause Auto-cycle' : 'Start Auto-cycle Scene Slideshow'}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isAutoPlaying ? 'Cycling' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-white/[0.08]"
            title="Next Scene"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Sync Now button */}
          <button
            onClick={() => broadcastScene(eventState.activeSceneId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/50"
            title="Force-push active scene state to all displays"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sync Now</span>
          </button>
        </div>
      </div>

      {/* Preset Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isEmergency = action.isEmergency;

          let buttonStyle =
            'bg-neutral-900/80 border-white/[0.08] hover:border-blue-500/40 hover:bg-neutral-800/90 text-neutral-300 hover:text-white';

          if (action.isActive) {
            if (isEmergency) {
              buttonStyle =
                'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-950/60';
            } else {
              buttonStyle =
                'bg-blue-600 border-blue-500 text-white ring-1 ring-blue-500 shadow-lg shadow-blue-950/50';
            }
          } else if (isEmergency) {
            buttonStyle =
              'bg-red-950/40 border-red-900/40 hover:bg-red-900/60 hover:border-red-600 text-red-400 hover:text-white';
          }

          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group cursor-pointer ${buttonStyle}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold tracking-tight truncate w-full">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
