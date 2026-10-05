'use client';

import React from 'react';
import { SceneType } from '@/types/smartscreen';
import {
  Sparkles,
  BookOpen,
  Timer,
  Megaphone,
  Coffee,
  Trophy,
  Heart,
  Plus,
  X,
} from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateType: SceneType) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const templates: Array<{
    type: SceneType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      type: 'welcome',
      title: 'Welcome Presentation',
      description: 'Grand arrival screen with event headline, schedule QR, venue badge, and custom logo.',
      icon: Sparkles,
    },
    {
      type: 'rules',
      title: 'Competition Regulations',
      description: 'Structured rule cards with numbers, guidelines, and helpline information.',
      icon: BookOpen,
    },
    {
      type: 'timer',
      title: 'High-Visibility Timer',
      description: 'Giant authoritative synchronized countdown arena for rounds, hacks, or deadlines.',
      icon: Timer,
    },
    {
      type: 'announcement',
      title: 'Event Announcement',
      description: 'High-impact alert headline card for important schedule updates, room changes, or notifications.',
      icon: Megaphone,
    },
    {
      type: 'break',
      title: 'Intermission & Networking',
      description: 'Relaxing intermission screen with coffee motif, program resume timestamp, and next speaker.',
      icon: Coffee,
    },
    {
      type: 'results',
      title: 'Live Leaderboard',
      description: 'Tournament ranking table with gold/silver/bronze highlights and live scores.',
      icon: Trophy,
    },
    {
      type: 'thank_you',
      title: 'Thank You & Closing',
      description: 'Event wrap-up screen with closing message, feedback QR code, and social links.',
      icon: Heart,
    },
    {
      type: 'custom',
      title: 'Blank Canvas',
      description: 'Start from scratch with a clean slate to craft your own custom display composition.',
      icon: Plus,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-white">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">
              Choose Scene Template
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select a pre-designed layout or begin with an empty stage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-6 overflow-y-auto">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.type}
                onClick={() => onSelectTemplate(tpl.type)}
                className="p-5 rounded-2xl border border-white/10 bg-neutral-900/80 hover:bg-neutral-900 hover:border-blue-500/60 transition-all cursor-pointer flex flex-col justify-between group shadow-lg shadow-black/40 hover:scale-[1.01]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">
                    TYPE: {tpl.type}
                  </span>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm shadow-blue-950/50">
                    Use Template →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
