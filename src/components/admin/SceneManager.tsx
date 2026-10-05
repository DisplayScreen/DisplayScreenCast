'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { SceneType } from '@/types/smartscreen';
import { TemplateSelector } from './TemplateSelector';
import { defaultScenes } from '@/lib/default-data';
import {
  Radio,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface SceneManagerProps {
  onEditScene: (sceneId: string) => void;
}

export function SceneManager({ onEditScene }: SceneManagerProps) {
  const {
    scenes,
    eventState,
    broadcastScene,
    createScene,
    duplicateScene,
    deleteScene,
  } = useSmartScreen();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleSelectTemplate = async (templateType: SceneType) => {
    setIsTemplateModalOpen(false);

    // Look for matching sample template in defaultScenes
    const templateMatch = defaultScenes.find((s) => s.type === templateType);

    if (templateMatch) {
      const newId = await createScene({
        name: `${templateMatch.name} (New)`,
        type: templateMatch.type,
        description: templateMatch.description,
        background: templateMatch.background,
        elements: templateMatch.elements.map((el) => ({
          ...el,
          id: 'el-' + Math.random().toString(36).substring(2, 9),
        })),
        transition: templateMatch.transition,
      });
      onEditScene(newId);
    } else {
      const newId = await createScene({
        name: 'Custom Scene',
        type: 'custom',
        background: {
          type: 'gradient',
          value: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
        },
        elements: [
          {
            id: 'el-' + Math.random().toString(36).substring(2, 9),
            type: 'text',
            name: 'Title',
            style: {
              left: 20,
              top: 35,
              width: 60,
              height: 20,
              zIndex: 1,
              color: '#ffffff',
              fontSize: 3.5,
              fontWeight: 'bold',
              textAlign: 'center',
            },
            content: { text: 'Custom Presentation Scene' },
          },
        ],
      });
      onEditScene(newId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with New Scene action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Event Scene Library</span>
          </h2>
          <p className="text-xs text-neutral-400">
            <span className="text-white font-mono font-bold">{scenes.length}</span> {scenes.length === 1 ? 'scene' : 'scenes'} configured • Ready for live broadcast
          </p>
        </div>

        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>New Scene</span>
        </button>
      </div>

      {/* Grid of Scenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {scenes.map((scene) => {
          const isLive = eventState.activeSceneId === scene.id && eventState.overrideMode === 'none';

          return (
            <div
              key={scene.id}
              className={`flex flex-col justify-between rounded-2xl border overflow-hidden transition-all bg-neutral-900/80 backdrop-blur-xl shadow-xl ${
                isLive
                  ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-blue-950/50'
                  : 'border-white/10 hover:border-blue-500/50 hover:scale-[1.01]'
              }`}
            >
              {/* Scene Card Header / Thumbnail Area */}
              <div
                style={{
                  background:
                    scene.background.type === 'image'
                      ? `url(${scene.background.value}) center/cover no-repeat`
                      : scene.background.value,
                }}
                className="relative aspect-video w-full flex items-center justify-center p-3 select-none"
              >
                {/* Live Pill */}
                {isLive ? (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-wider uppercase shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>ON AIR</span>
                  </div>
                ) : (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-md uppercase border border-white/10">
                    {scene.type}
                  </span>
                )}

                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded font-bold border border-white/10">
                  {scene.elements.length} elements
                </span>

                <div className="text-center px-4">
                  <p className="text-sm font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                    {scene.name}
                  </p>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 bg-neutral-950/90 border-t border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate">{scene.name}</span>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/10">
                  {/* Broadcast Button */}
                  <button
                    onClick={() => broadcastScene(scene.id)}
                    disabled={isLive}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      isLive
                        ? 'bg-blue-600/20 text-blue-400 cursor-default border border-blue-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/50'
                    }`}
                  >
                    {isLive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Broadcasting</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        <span>Broadcast</span>
                      </>
                    )}
                  </button>

                  {/* Edit in Designer */}
                  <button
                    onClick={() => onEditScene(scene.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit in Visual Designer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateScene(scene.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Duplicate Scene"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete (if more than 1 scene) */}
                  {scenes.length > 1 && (
                    <button
                      onClick={() => deleteScene(scene.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/70 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Selector Modal */}
      {isTemplateModalOpen && (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}
    </div>
  );
}
