'use client';

import React from 'react';
import { ElementType } from '@/types/smartscreen';
import {
  Type,
  Image as ImageIcon,
  Video,
  Timer,
  QrCode,
  Award,
  Square,
  Minus,
  Trophy,
  ListOrdered,
} from 'lucide-react';

interface ElementToolbarProps {
  onAddElement: (type: ElementType) => void;
}

export function ElementToolbar({ onAddElement }: ElementToolbarProps) {
  const tools: Array<{
    type: ElementType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { type: 'text', label: 'Text', icon: Type },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'timer', label: 'Timer', icon: Timer },
    { type: 'qrcode', label: 'QR Code', icon: QrCode },
    { type: 'logo', label: 'Logo', icon: Award },
    { type: 'shape', label: 'Card / Box', icon: Square },
    { type: 'divider', label: 'Divider', icon: Minus },
    { type: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { type: 'rule_cards', label: 'Rules Grid', icon: ListOrdered },
  ];

  return (
    <div className="flex items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase px-2 shrink-0">
        Add Element:
      </span>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.type}
            onClick={() => onAddElement(tool.type)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors shrink-0 border border-slate-700/50"
          >
            <Icon className="w-3.5 h-3.5 text-sky-400" />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
