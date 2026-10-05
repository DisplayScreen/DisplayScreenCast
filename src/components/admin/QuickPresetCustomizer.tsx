'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { SceneElement } from '@/types/smartscreen';
import {
  Sparkles,
  BookOpen,
  Timer as TimerIcon,
  Megaphone,
  Coffee,
  Trophy,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Radio,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { ImageSelectField } from './AssetPickerModal';

interface QuickPresetCustomizerProps {
  selectedPresetType?: string;
  onSelectPresetType?: (type: string) => void;
}

export function QuickPresetCustomizer({
  selectedPresetType,
  onSelectPresetType,
}: QuickPresetCustomizerProps) {
  const {
    scenes,
    eventState,
    updateScene,
    broadcastScene,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useSmartScreen();

  const [internalPreset, setInternalPreset] = useState<string>('welcome');

  const activeType = selectedPresetType || internalPreset;

  const handleSelectPreset = (type: string) => {
    setInternalPreset(type);
    if (onSelectPresetType) {
      onSelectPresetType(type);
    }
  };

  // Find the target scene matching this preset type
  const targetScene = scenes.find((s) => s.type === activeType) || scenes[0];
  const isSceneLive = eventState.activeSceneId === targetScene?.id && eventState.overrideMode === 'none';

  // Helper to find an element in targetScene by ID prefix or fallback keywords
  const findElement = (
    idPrefix: string,
    fallbackKeywords: string[] = [],
    fallbackType?: string
  ): SceneElement | undefined => {
    if (!targetScene) return undefined;
    // 1. Direct or prefix ID match
    let el = targetScene.elements.find(
      (e) => e.id === idPrefix || e.id.startsWith(idPrefix) || idPrefix.startsWith(e.id)
    );
    if (el) return el;

    // 2. Name keywords match
    if (fallbackKeywords.length > 0) {
      el = targetScene.elements.find((e) =>
        fallbackKeywords.some((kw) => e.name.toLowerCase().includes(kw.toLowerCase()))
      );
      if (el) return el;
    }

    // 3. Fallback type
    if (fallbackType) {
      el = targetScene.elements.find((e) => e.type === fallbackType);
      if (el) return el;
    }

    return undefined;
  };

  // Master element updater
  const updateElement = (
    elementId: string,
    styleUpdates: Partial<SceneElement['style']>,
    contentUpdates?: Partial<SceneElement['content']>
  ) => {
    if (!targetScene) return;

    const newElements = targetScene.elements.map((el) => {
      if (el.id === elementId) {
        return {
          ...el,
          style: {
            ...el.style,
            ...styleUpdates,
          },
          content: contentUpdates
            ? {
                ...el.content,
                ...contentUpdates,
              }
            : el.content,
        };
      }
      return el;
    });

    updateScene(targetScene.id, { elements: newElements });
  };

  const handleBroadcastCurrentPreset = () => {
    if (targetScene) {
      broadcastScene(targetScene.id);
    }
  };

  const presetTabs = [
    { type: 'welcome', label: 'Welcome', icon: Sparkles },
    { type: 'rules', label: 'Rules', icon: BookOpen },
    { type: 'timer', label: 'Timer', icon: TimerIcon },
    { type: 'announcement', label: 'Announcement', icon: Megaphone },
    { type: 'break', label: 'Break', icon: Coffee },
    { type: 'results', label: 'Results', icon: Trophy },
  ];

  // Quick color choices
  const colorPalette = [
    { label: 'White', value: '#ffffff' },
    { label: 'Blue', value: '#38bdf8' },
    { label: 'Amber', value: '#fbbf24' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Slate', value: '#94a3b8' },
  ];

  // Reusable sub-component for text + placement control
  const renderTextAndPlacementControl = ({
    label,
    element,
    isTextarea = false,
    showAlignment = true,
  }: {
    label: string;
    element: SceneElement | undefined;
    isTextarea?: boolean;
    showAlignment?: boolean;
  }) => {
    if (!element) return null;

    const currentText = element.content.text || '';
    const currentTop = Math.round(element.style.top ?? 20);
    const currentLeft = Math.round(element.style.left ?? 10);
    const currentFontSize = element.style.fontSize ?? 2.0;
    const currentAlign = element.style.textAlign || 'center';
    const currentColor = element.style.color || '#ffffff';

    return (
      <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs">{label}</span>
          <span className="text-[10px] font-mono text-neutral-400">
            Top: <span className="text-white font-bold">{currentTop}%</span> • Size: <span className="text-white font-bold">{currentFontSize}cqw</span>
          </span>
        </div>

        {/* Text Input / Textarea */}
        {isTextarea ? (
          <textarea
            rows={2}
            value={currentText}
            onChange={(e) =>
              updateElement(element.id, {}, { text: e.target.value })
            }
            className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-500 placeholder-neutral-500 leading-relaxed"
            placeholder={`Enter ${label}...`}
          />
        ) : (
          <input
            type="text"
            value={currentText}
            onChange={(e) =>
              updateElement(element.id, {}, { text: e.target.value })
            }
            className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-white font-semibold text-xs focus:outline-none focus:border-blue-500 placeholder-neutral-500"
            placeholder={`Enter ${label}...`}
          />
        )}

        {/* Placement & Typography Controls */}
        <div className="pt-2 border-t border-white/10 space-y-2.5 text-[11px]">
          {/* Vertical Placement Slider */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
              Y-Position:
            </span>
            <input
              type="range"
              min="2"
              max="95"
              step="1"
              value={currentTop}
              onChange={(e) =>
                updateElement(element.id, { top: Number(e.target.value) })
              }
              className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="w-12 text-right font-mono font-bold text-white text-xs">
              {currentTop}%
            </span>
          </div>

          {/* Horizontal Placement Slider */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
              X-Position:
            </span>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={currentLeft}
              onChange={(e) =>
                updateElement(element.id, { left: Number(e.target.value) })
              }
              className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="w-12 text-right font-mono font-bold text-white text-xs">
              {currentLeft}%
            </span>
          </div>

          {/* Font Size Scale Slider */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
              Font Scale:
            </span>
            <input
              type="range"
              min="0.8"
              max="7.0"
              step="0.1"
              value={currentFontSize}
              onChange={(e) =>
                updateElement(element.id, { fontSize: Number(e.target.value) })
              }
              className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="w-12 text-right font-mono font-bold text-white text-xs">
              {currentFontSize}cqw
            </span>
          </div>

          {/* Horizontal Alignment & Color Palette */}
          <div className="flex items-center justify-between pt-1">
            {showAlignment && (
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  title="Align Left"
                  onClick={() => updateElement(element.id, { textAlign: 'left' })}
                  className={`p-1.5 rounded transition-colors ${
                    currentAlign === 'left' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Align Center"
                  onClick={() => updateElement(element.id, { textAlign: 'center' })}
                  className={`p-1.5 rounded transition-colors ${
                    currentAlign === 'center' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Align Right"
                  onClick={() => updateElement(element.id, { textAlign: 'right' })}
                  className={`p-1.5 rounded transition-colors ${
                    currentAlign === 'right' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {colorPalette.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => updateElement(element.id, { color: col.value })}
                  style={{ backgroundColor: col.value }}
                  title={col.label}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    currentColor.toLowerCase() === col.value.toLowerCase()
                      ? 'scale-125 border-white ring-2 ring-blue-500'
                      : 'border-white/30 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl text-white space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Preset Customizer & Placement Deck</h3>
            <p className="text-[11px] text-neutral-400">
              Customize text & adjust on-screen placement with instant live preview
            </p>
          </div>
        </div>

        {/* Live Broadcast Button */}
        <div>
          {isSceneLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>LIVE ON DISPLAY</span>
            </div>
          ) : (
            <button
              onClick={handleBroadcastCurrentPreset}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-950/50"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Broadcast Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Selector Pill Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-neutral-900/90 p-1.5 rounded-xl border border-white/10">
        {presetTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = tab.type === activeType;

          return (
            <button
              key={tab.type}
              onClick={() => handleSelectPreset(tab.type)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Status & Notice */}
      <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between text-xs">
        <span className="text-neutral-300 font-medium">
          Editing preset: <strong className="text-white uppercase font-mono">{activeType}</strong> screen
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          ✓ Full Independent Screen (No Overlays)
        </span>
      </div>

      {/* ========================================================
          1. WELCOME SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'welcome' && (
        <div className="space-y-4">
          {/* Main Title */}
          {renderTextAndPlacementControl({
            label: 'Event Main Title',
            element: findElement('el-welcome-title', ['Main Title', 'Title']),
          })}

          {/* Subtitle */}
          {renderTextAndPlacementControl({
            label: 'Subtitle / Keynote Time',
            element: findElement('el-welcome-sub', ['Subtitle', 'Sub']),
          })}

          {/* Pill Badge */}
          {renderTextAndPlacementControl({
            label: 'Top Pill Badge',
            element: findElement('el-welcome-badge', ['Badge', 'Pill']),
          })}

          {/* QR Code & Container Placement */}
          {(() => {
            const qrCard = findElement('el-welcome-qr-card', ['QR Container', 'Card']);
            const qrEl = findElement('el-welcome-qr', ['QR Code', 'QR']);
            if (!qrEl) return null;

            const currentQrTop = Math.round(qrCard?.style.top ?? qrEl.style.top ?? 58);

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Event Guide QR Code</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Card Top: <span className="text-white font-bold">{currentQrTop}%</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Target URL:</label>
                    <input
                      type="text"
                      value={qrEl.content.qrUrl || ''}
                      onChange={(e) =>
                        updateElement(qrEl.id, {}, { qrUrl: e.target.value })
                      }
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">QR Caption:</label>
                    <input
                      type="text"
                      value={qrEl.content.qrLabel || ''}
                      onChange={(e) =>
                        updateElement(qrEl.id, {}, { qrLabel: e.target.value })
                      }
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Y-Placement for QR */}
                <div className="flex items-center gap-3 pt-1 border-t border-white/10 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Y-Position:
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="1"
                    value={currentQrTop}
                    onChange={(e) => {
                      const newTop = Number(e.target.value);
                      if (qrCard) updateElement(qrCard.id, { top: newTop });
                      updateElement(qrEl.id, { top: newTop + 3 });
                    }}
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {currentQrTop}%
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Wi-Fi & Venue Notice */}
          {renderTextAndPlacementControl({
            label: 'Wi-Fi & Venue Notice Footer',
            element: findElement('el-welcome-footer', ['Footer', 'Wifi']),
          })}

          {/* Background Image Selection */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10">
            <ImageSelectField
              label="Welcome Screen Backdrop Photo"
              value={targetScene.background.type === 'image' ? targetScene.background.value : ''}
              onChange={(url) => {
                updateScene(targetScene.id, {
                  background: {
                    type: 'image',
                    value: url,
                  },
                });
              }}
              placeholder="Select high-resolution backdrop preset or upload..."
              modalTitle="Select Welcome Screen Backdrop"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          2. RULES SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'rules' && (
        <div className="space-y-4">
          {/* Rules Heading */}
          {renderTextAndPlacementControl({
            label: 'Regulations Heading',
            element: findElement('el-rules-heading', ['Heading', 'Title']),
          })}

          {/* Subtitle / Timeline */}
          {renderTextAndPlacementControl({
            label: 'Subtitle / Adherence Rule',
            element: findElement('el-rules-sub', ['Subtitle', 'Sub']),
          })}

          {/* Rule Cards Grid Roster & Placement */}
          {(() => {
            const cardsEl = findElement('el-rules-cards', ['Rule Cards', 'Rules'], 'rule_cards');
            if (!cardsEl) return null;

            const rules = cardsEl.content.ruleCardsData || [];
            const gridTop = Math.round(cardsEl.style.top ?? 28);

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Rule Cards Grid Roster</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Grid Top: <span className="text-white font-bold">{gridTop}%</span>
                  </span>
                </div>

                {/* Y-Position slider for the rule cards grid */}
                <div className="flex items-center gap-3 pb-2 border-b border-white/10 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Grid Y-Pos:
                  </span>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="1"
                    value={gridTop}
                    onChange={(e) =>
                      updateElement(cardsEl.id, { top: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {gridTop}%
                  </span>
                </div>

                {/* Individual Rule Cards */}
                <div className="space-y-2.5">
                  {rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-xs">
                          Rule #{rule.number}
                        </span>
                        <input
                          type="text"
                          value={rule.tag || ''}
                          placeholder="Category Tag"
                          onChange={(e) => {
                            const updated = [...rules];
                            updated[idx] = { ...updated[idx], tag: e.target.value };
                            updateElement(cardsEl.id, {}, { ruleCardsData: updated });
                          }}
                          className="w-28 bg-neutral-900 border border-white/10 rounded px-2 py-1 text-[10px] text-right text-white font-mono"
                        />
                      </div>
                      <input
                        type="text"
                        value={rule.title}
                        placeholder="Rule Headline"
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateElement(cardsEl.id, {}, { ruleCardsData: updated });
                        }}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-bold text-xs"
                      />
                      <textarea
                        rows={2}
                        value={rule.description}
                        placeholder="Rule Description"
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          updateElement(cardsEl.id, {}, { ruleCardsData: updated });
                        }}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-300 text-xs leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Helpline Footer */}
          {renderTextAndPlacementControl({
            label: 'Helpline & Mentor Footer',
            element: findElement('el-rules-footer', ['Footer', 'Questions']),
          })}
        </div>
      )}

      {/* ========================================================
          3. TIMER SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'timer' && (
        <div className="space-y-4">
          {/* Round Title / Session Badge */}
          {renderTextAndPlacementControl({
            label: 'Active Session Banner',
            element: findElement('el-timer-banner', ['Banner', 'Badge']),
          })}

          {/* Timer Clock Placement & Sizing */}
          {(() => {
            const clockEl = findElement('el-timer-clock', ['Big Central Timer', 'Clock'], 'timer');
            if (!clockEl) return null;

            const clockTop = Math.round(clockEl.style.top ?? 20);
            const clockFontSize = clockEl.style.fontSize ?? 7.5;

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Authoritative Timer Clock Display</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Top: <span className="text-white font-bold">{clockTop}%</span> • Size: <span className="text-white font-bold">{clockFontSize}cqw</span>
                  </span>
                </div>

                {/* Clock Y-Position */}
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Clock Y-Pos:
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="1"
                    value={clockTop}
                    onChange={(e) =>
                      updateElement(clockEl.id, { top: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {clockTop}%
                  </span>
                </div>

                {/* Clock Font Size */}
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Clock Scale:
                  </span>
                  <input
                    type="range"
                    min="4.0"
                    max="11.0"
                    step="0.5"
                    value={clockFontSize}
                    onChange={(e) =>
                      updateElement(clockEl.id, { fontSize: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {clockFontSize}cqw
                  </span>
                </div>

                {/* Quick Countdown Buttons (Numbers white, blue buttons) */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Quick Set Countdown Duration:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => startTimer(mins * 60 * 1000)}
                        className="py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-white font-mono font-bold text-xs transition-colors"
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>

                  {/* Timer Start / Pause / Reset controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startTimer()}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      Start Countdown
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer()}
                      className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTimer()}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Round Instructions Subtitle */}
          {renderTextAndPlacementControl({
            label: 'Round Instructions Subtitle',
            element: findElement('el-timer-sub', ['Instructions', 'Sub']),
          })}

          {/* Next Phase Notice */}
          {renderTextAndPlacementControl({
            label: 'Next Phase Notice Footer',
            element: findElement('el-timer-next', ['Next Phase', 'Next']),
          })}
        </div>
      )}

      {/* ========================================================
          4. ANNOUNCEMENT SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'announcement' && (
        <div className="space-y-4">
          {/* Notice Tag */}
          {renderTextAndPlacementControl({
            label: 'Notice Category Tag',
            element: findElement('el-ann-tag', ['Notice Tag', 'Tag']),
          })}

          {/* Headline */}
          {renderTextAndPlacementControl({
            label: 'Announcement Headline',
            element: findElement('el-ann-headline', ['Headline', 'Title']),
          })}

          {/* Message Body */}
          {renderTextAndPlacementControl({
            label: 'Message Body Details',
            element: findElement('el-ann-body', ['Message Body', 'Body']),
            isTextarea: true,
          })}

          {/* Action Reminder Callout */}
          {renderTextAndPlacementControl({
            label: 'Action Reminder Callout',
            element: findElement('el-ann-action', ['Action Reminder', 'Action']),
          })}

          {/* Card Frame Placement */}
          {(() => {
            const cardEl = findElement('el-ann-card', ['Card Background', 'Card']);
            if (!cardEl) return null;

            const cardTop = Math.round(cardEl.style.top ?? 14);

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Announcement Card Frame</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Card Top: <span className="text-white font-bold">{cardTop}%</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Frame Y-Pos:
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={cardTop}
                    onChange={(e) =>
                      updateElement(cardEl.id, { top: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {cardTop}%
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================
          5. BREAK SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'break' && (
        <div className="space-y-4">
          {/* Break Title */}
          {renderTextAndPlacementControl({
            label: 'Intermission Headline',
            element: findElement('el-break-title', ['Break Title', 'Title']),
          })}

          {/* Break Subtitle */}
          {renderTextAndPlacementControl({
            label: 'Lounge & Refreshment Guidance',
            element: findElement('el-break-sub', ['Break Subtitle', 'Sub']),
          })}

          {/* Resumes At Time Badge & Placement */}
          {(() => {
            const timeCard = findElement('el-break-time-card', ['Resume Time Card', 'Card']);
            const timeLabel = findElement('el-break-resume-label', ['Resume Label']);
            const timeVal = findElement('el-break-resume-time', ['Resume Time Value']);
            if (!timeVal) return null;

            const cardTop = Math.round(timeCard?.style.top ?? 46);

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Program Resumption Time</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Top: <span className="text-white font-bold">{cardTop}%</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Badge Label:</label>
                    <input
                      type="text"
                      value={timeLabel?.content.text || 'PROGRAM RESUMES AT'}
                      onChange={(e) =>
                        timeLabel && updateElement(timeLabel.id, {}, { text: e.target.value })
                      }
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Resume Time:</label>
                    <input
                      type="text"
                      value={timeVal.content.text || '01:30 PM'}
                      onChange={(e) =>
                        updateElement(timeVal.id, {}, { text: e.target.value })
                      }
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-bold text-xs"
                      placeholder="e.g. 02:00 PM"
                    />
                  </div>
                </div>

                {/* Y-Placement */}
                <div className="flex items-center gap-3 pt-1 border-t border-white/10 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Badge Y-Pos:
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    step="1"
                    value={cardTop}
                    onChange={(e) => {
                      const newTop = Number(e.target.value);
                      if (timeCard) updateElement(timeCard.id, { top: newTop });
                      if (timeLabel) updateElement(timeLabel.id, { top: newTop + 4 });
                      updateElement(timeVal.id, { top: newTop + 10 });
                    }}
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {cardTop}%
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Next Topic Footer */}
          {renderTextAndPlacementControl({
            label: 'Next Session Topic Info',
            element: findElement('el-break-footer', ['Next Topic', 'Footer']),
          })}
        </div>
      )}

      {/* ========================================================
          6. RESULTS SCREEN CUSTOMIZER & PLACEMENT
         ======================================================== */}
      {activeType === 'results' && (
        <div className="space-y-4">
          {/* Results Title */}
          {renderTextAndPlacementControl({
            label: 'Leaderboard Heading',
            element: findElement('el-res-title', ['Results Title', 'Title']),
          })}

          {/* Results Subtitle */}
          {renderTextAndPlacementControl({
            label: 'Subtitle / Realtime Standings',
            element: findElement('el-res-subtitle', ['Subtitle', 'Sub']),
          })}

          {/* Leaderboard Table Customization & Placement */}
          {(() => {
            const tableEl = findElement('el-res-table', ['Leaderboard Component', 'Leaderboard'], 'leaderboard');
            if (!tableEl) return null;

            const standings = tableEl.content.leaderboardData || [];
            const tableTop = Math.round(tableEl.style.top ?? 24);

            return (
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Leaderboard Standings Roster</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Table Top: <span className="text-white font-bold">{tableTop}%</span>
                  </span>
                </div>

                {/* Y-Position slider for the leaderboard table */}
                <div className="flex items-center gap-3 pb-2 border-b border-white/10 text-[11px]">
                  <span className="w-20 text-neutral-400 font-mono text-[10px] uppercase">
                    Table Y-Pos:
                  </span>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="1"
                    value={tableTop}
                    onChange={(e) =>
                      updateElement(tableEl.id, { top: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono font-bold text-white text-xs">
                    {tableTop}%
                  </span>
                </div>

                {/* Teams List (Numbers Pure White) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Ranks & Points (Numbers White):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRow = {
                          rank: standings.length + 1,
                          name: `Team ${standings.length + 1}`,
                          score: '88.0 pts',
                          badge: 'Finalist',
                        };
                        updateElement(tableEl.id, {}, { leaderboardData: [...standings, newRow] });
                      }}
                      className="flex items-center gap-1 text-[11px] text-blue-400 font-bold hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Team</span>
                    </button>
                  </div>

                  {standings.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/80 border border-white/10"
                    >
                      {/* Rank number pure white */}
                      <span className="font-mono font-bold text-white w-6 text-center text-xs">
                        #{row.rank}
                      </span>
                      <input
                        type="text"
                        value={row.name}
                        placeholder="Team Name"
                        onChange={(e) => {
                          const updated = [...standings];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateElement(tableEl.id, {}, { leaderboardData: updated });
                        }}
                        className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                      />
                      {/* Score numbers pure white */}
                      <input
                        type="text"
                        value={row.score}
                        placeholder="Score"
                        onChange={(e) => {
                          const updated = [...standings];
                          updated[idx] = { ...updated[idx], score: e.target.value };
                          updateElement(tableEl.id, {}, { leaderboardData: updated });
                        }}
                        className="w-24 bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-mono font-bold text-xs text-right focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = standings.filter((_, i) => i !== idx);
                          updateElement(tableEl.id, {}, { leaderboardData: filtered });
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Ceremony Footer */}
          {renderTextAndPlacementControl({
            label: 'Ceremony & Stage Notice Footer',
            element: findElement('el-res-footer', ['Ceremony', 'Footer']),
          })}
        </div>
      )}
    </div>
  );
}
