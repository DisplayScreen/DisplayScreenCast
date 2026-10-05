'use client';

import React from 'react';
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
    <div className="w-full bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
          Quick Broadcast Actions
        </span>
        <span className="text-[11px] text-neutral-500 font-mono">1-Click Live Transition</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isEmergency = action.isEmergency;

          let buttonStyle =
            'bg-neutral-900/90 border-white/10 hover:border-blue-500/50 hover:bg-neutral-800 text-neutral-300 hover:text-white';

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
              <Icon className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
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
