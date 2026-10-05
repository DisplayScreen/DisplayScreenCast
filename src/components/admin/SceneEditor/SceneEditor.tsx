'use client';

import React, { useState, useRef } from 'react';
import { Scene, SceneElement, ElementType } from '@/types/smartscreen';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { ElementToolbar } from './ElementToolbar';
import { PropertyInspector } from './PropertyInspector';
import { CanvasElement } from './CanvasElement';
import { TemplateCustomizer } from './TemplateCustomizer';
import { ImageSelectField } from '../AssetPickerModal';
import {
  ArrowLeft,
  Radio,
  Save,
  Palette,
  Grid,
  FileEdit,
  Layers,
} from 'lucide-react';

interface SceneEditorProps {
  sceneId: string;
  onClose: () => void;
}

export function SceneEditor({ sceneId, onClose }: SceneEditorProps) {
  const {
    scenes,
    eventState,
    updateScene,
    broadcastScene,
    resetTimer,
  } = useSmartScreen();

  const originalScene = scenes.find((s) => s.id === sceneId);
  const [currentScene, setCurrentScene] = useState<Scene | null>(() => originalScene || null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'template' | 'elements' | 'background'>('template');
  const [isSaved, setIsSaved] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  if (!currentScene) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Scene not found or deleted.
        <button onClick={onClose} className="block mt-4 text-sky-400 underline mx-auto">
          Return to Scenes
        </button>
      </div>
    );
  }

  const selectedElement =
    currentScene.elements.find((el) => el.id === selectedElementId) || null;

  // Add Element
  const handleAddElement = (type: ElementType) => {
    const id = 'el-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    let defaultContent: SceneElement['content'] = {};
    const defaultStyle: SceneElement['style'] = {
      left: 25,
      top: 30,
      width: 50,
      height: 15,
      zIndex: (currentScene.elements.length || 0) + 1,
      color: '#ffffff',
      fontSize: 2.2,
      fontWeight: 'bold',
      textAlign: 'center',
    };

    switch (type) {
      case 'text':
        defaultContent = { text: 'New Text Heading' };
        break;
      case 'image':
        defaultContent = {
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
          alt: 'Event Photo',
        };
        defaultStyle.height = 35;
        defaultStyle.width = 40;
        break;
      case 'video':
        defaultContent = {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        };
        defaultStyle.height = 40;
        defaultStyle.width = 60;
        break;
      case 'timer':
        defaultContent = { timerLabel: 'SESSION TIMER', timerFormat: 'MM:SS' };
        defaultStyle.fontSize = 5.5;
        defaultStyle.height = 30;
        defaultStyle.width = 50;
        break;
      case 'qrcode':
        defaultContent = { qrUrl: 'https://smartscreen.live', qrLabel: 'Scan for Information' };
        defaultStyle.width = 20;
        defaultStyle.height = 24;
        break;
      case 'logo':
        defaultContent = {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
        };
        defaultStyle.width = 20;
        defaultStyle.height = 15;
        break;
      case 'shape':
        defaultStyle.left = 20;
        defaultStyle.top = 20;
        defaultStyle.width = 60;
        defaultStyle.height = 60;
        defaultStyle.zIndex = 1;
        defaultStyle.backgroundColor = 'rgba(15, 23, 42, 0.7)';
        defaultStyle.borderColor = 'rgba(56, 189, 248, 0.3)';
        defaultStyle.borderWidth = 1;
        defaultStyle.borderRadius = 16;
        defaultStyle.backdropBlur = 16;
        break;
      case 'divider':
        defaultStyle.left = 25;
        defaultStyle.top = 50;
        defaultStyle.width = 50;
        defaultStyle.height = 0.5;
        defaultStyle.zIndex = 2;
        defaultStyle.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        break;
      case 'leaderboard':
        defaultContent = {
          leaderboardData: [
            { rank: 1, name: 'Team Alpha', score: '98 pts', badge: '1st' },
            { rank: 2, name: 'Team Beta', score: '92 pts', badge: '2nd' },
            { rank: 3, name: 'Team Gamma', score: '87 pts', badge: '3rd' },
          ],
        };
        defaultStyle.width = 70;
        defaultStyle.height = 50;
        break;
      case 'rule_cards':
        defaultContent = {
          ruleCardsData: [
            { number: 1, title: 'Code Deadline', description: 'All repos locked at 12:00 PM' },
            { number: 2, title: 'Live Pitch', description: 'Each team has 3 minutes to pitch' },
          ],
        };
        defaultStyle.width = 75;
        defaultStyle.height = 45;
        break;
    }

    const newElement: SceneElement = {
      id: id,
      type: type,
      name: `${type.toUpperCase()} #${currentScene.elements.length + 1}`,
      style: defaultStyle,
      content: defaultContent,
    };

    const updated = {
      ...currentScene,
      elements: [...currentScene.elements, newElement],
    };

    setCurrentScene(updated);
    setSelectedElementId(newElement.id);
    setSidebarTab('elements');
  };

  const handleUpdateElement = (updatedElement: SceneElement) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === updatedElement.id ? updatedElement : el
        ),
      };
    });
  };

  const handleDeleteElement = (id: string) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.filter((el) => el.id !== id),
      };
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    const target = currentScene.elements.find((el) => el.id === id);
    if (!target) return;
    const newId = 'el-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const cloned: SceneElement = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      style: {
        ...target.style,
        left: Math.min(80, target.style.left + 3),
        top: Math.min(80, target.style.top + 3),
        zIndex: (currentScene.elements.length || 0) + 1,
      },
    };
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: [...prev.elements, cloned],
      };
    });
    setSelectedElementId(newId);
  };

  const handleBringForward = (id: string) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, style: { ...el.style, zIndex: (el.style.zIndex || 1) + 1 } } : el
        ),
      };
    });
  };

  const handleSendBackward = (id: string) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id
            ? { ...el, style: { ...el.style, zIndex: Math.max(1, (el.style.zIndex || 1) - 1) } }
            : el
        ),
      };
    });
  };

  const handleUpdatePosition = (id: string, left: number, top: number) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, style: { ...el.style, left, top } } : el
        ),
      };
    });
  };

  const handleUpdateSize = (id: string, width: number, height: number) => {
    setCurrentScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, style: { ...el.style, width, height } } : el
        ),
      };
    });
  };

  const handleSave = async () => {
    if (!currentScene) return;
    await updateScene(currentScene.id, currentScene);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleBroadcast = async () => {
    if (!currentScene) return;
    await updateScene(currentScene.id, currentScene);
    await broadcastScene(currentScene.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to Scenes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={currentScene.name}
              onChange={(e) => setCurrentScene({ ...currentScene, name: e.target.value })}
              className="font-bold text-base bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 focus:outline-none text-white px-1 font-mono"
            />
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 px-1">
              <span>Type: {currentScene.type}</span>
              <span>•</span>
              <span>{currentScene.elements.length} elements</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showGrid
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Canvas Grid"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={handleBroadcast}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-sky-950/40"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Broadcast Now</span>
          </button>
        </div>
      </div>

      {/* Element Addition Bar */}
      <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
        <ElementToolbar onAddElement={handleAddElement} />
      </div>

      {/* Main Workspace (Canvas + Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Canvas Area */}
        <div
          className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950"
          onClick={() => setSelectedElementId(null)}
        >
          <div
            ref={canvasRef}
            style={{
              background:
                currentScene.background.type === 'image'
                  ? `url(${currentScene.background.value}) center/cover no-repeat`
                  : currentScene.background.value,
              containerType: 'inline-size',
            }}
            className={`relative aspect-video w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
              showGrid
                ? 'bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]'
                : ''
            }`}
          >
            {/* Background Overlay */}
            {currentScene.background.overlayColor && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: currentScene.background.overlayColor,
                  opacity: currentScene.background.overlayOpacity ?? 0.5,
                }}
              />
            )}

            {/* Elements */}
            {currentScene.elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={selectedElementId === el.id}
                timerState={eventState.timer}
                canvasRef={canvasRef}
                onSelect={() => {
                  setSelectedElementId(el.id);
                  setSidebarTab('elements');
                }}
                onUpdatePosition={handleUpdatePosition}
                onUpdateSize={handleUpdateSize}
              />
            ))}
          </div>
        </div>

        {/* Sidebar: Navigation Tabs & Customizers */}
        <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSidebarTab('template')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidebarTab === 'template'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Template Content</span>
            </button>

            <button
              onClick={() => setSidebarTab('elements')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidebarTab === 'elements'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visual Elements</span>
            </button>

            <button
              onClick={() => setSidebarTab('background')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidebarTab === 'background'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Background</span>
            </button>
          </div>

          {/* Active Sidebar Tab View */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'template' ? (
              <TemplateCustomizer
                scene={currentScene}
                onUpdateScene={setCurrentScene}
                onSetTimerDuration={(mins) => resetTimer(mins * 60 * 1000)}
              />
            ) : sidebarTab === 'background' ? (
              <div className="p-4 space-y-4 text-xs text-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white uppercase font-mono">
                    Scene Background
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Background Type</span>
                  <select
                    value={currentScene.background.type}
                    onChange={(e) =>
                      setCurrentScene({
                        ...currentScene,
                        background: {
                          ...currentScene.background,
                          type: e.target.value as 'gradient' | 'color' | 'image' | 'video',
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="gradient">CSS Gradient</option>
                    <option value="color">Solid Color</option>
                    <option value="image">Image URL</option>
                    <option value="video">Video URL</option>
                  </select>
                </div>

                {currentScene.background.type === 'image' ? (
                  <ImageSelectField
                    label="Backdrop Image Source"
                    value={currentScene.background.value}
                    onChange={(url) =>
                      setCurrentScene({
                        ...currentScene,
                        background: {
                          ...currentScene.background,
                          value: url,
                        },
                      })
                    }
                    placeholder="https://..."
                    modalTitle="Select Scene Backdrop Image"
                  />
                ) : (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Value (CSS / Color / URL)
                    </span>
                    <textarea
                      rows={3}
                      value={currentScene.background.value}
                      onChange={(e) =>
                        setCurrentScene({
                          ...currentScene,
                          background: {
                            ...currentScene.background,
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Quick Presets</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() =>
                        setCurrentScene({
                          ...currentScene,
                          background: {
                            type: 'gradient',
                            value:
                              'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 65%, #030712 100%)',
                          },
                        })
                      }
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-left truncate"
                    >
                      Cosmic Blue
                    </button>
                    <button
                      onClick={() =>
                        setCurrentScene({
                          ...currentScene,
                          background: {
                            type: 'gradient',
                            value:
                              'linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #0b132b 100%)',
                          },
                        })
                      }
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-left truncate"
                    >
                      Cyber Dark
                    </button>
                    <button
                      onClick={() =>
                        setCurrentScene({
                          ...currentScene,
                          background: {
                            type: 'gradient',
                            value:
                              'radial-gradient(circle at center, #172554 0%, #030712 75%)',
                          },
                        })
                      }
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-left truncate"
                    >
                      Deep Cobalt
                    </button>
                    <button
                      onClick={() =>
                        setCurrentScene({
                          ...currentScene,
                          background: {
                            type: 'color',
                            value: '#09090b',
                          },
                        })
                      }
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-left truncate"
                    >
                      Clean Dark
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <PropertyInspector
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
