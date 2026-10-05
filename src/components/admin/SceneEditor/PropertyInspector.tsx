'use client';

import React from 'react';
import { SceneElement, BaseElementStyle, TextStyle } from '@/types/smartscreen';
import { ImageSelectField } from '../AssetPickerModal';
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
} from 'lucide-react';

interface PropertyInspectorProps {
  element: SceneElement | null;
  onUpdateElement: (updated: SceneElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export function PropertyInspector({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
}: PropertyInspectorProps) {
  if (!element) {
    return (
      <div className="p-6 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center h-full">
        <Layers className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
        <p>No element selected</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Click an element on canvas to inspect and edit properties
        </p>
      </div>
    );
  }

  const { style, content } = element;

  const updateStyle = (
    key: keyof BaseElementStyle | keyof TextStyle,
    value: string | number | undefined
  ) => {
    onUpdateElement({
      ...element,
      style: {
        ...element.style,
        [key]: value,
      },
    });
  };

  const updateContent = (
    key: string,
    value: string | number | boolean | unknown[] | undefined
  ) => {
    onUpdateElement({
      ...element,
      content: {
        ...element.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-4 space-y-5 text-xs text-slate-200 overflow-y-auto max-h-[700px]">
      {/* Header & Quick Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            {element.type}
          </span>
          <span className="text-slate-500 text-[10px] ml-2 font-mono">#{element.id.slice(-5)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onBringForward(element.id)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Bring Forward (Z-Index +1)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSendBackward(element.id)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Send Backward (Z-Index -1)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateElement(element.id)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            className="p-1.5 rounded hover:bg-red-950/60 text-red-400 hover:text-red-200"
            title="Delete Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Inputs based on Element Type */}
      <div className="space-y-3">
        <label className="font-semibold text-slate-300 block">Content & Value</label>

        {element.type === 'text' && (
          <div>
            <textarea
              rows={3}
              value={content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500 font-sans"
              placeholder="Enter text..."
            />
          </div>
        )}

        {(element.type === 'image' || element.type === 'logo') && (
          <ImageSelectField
            label="Image / Asset Source"
            value={content.url || ''}
            onChange={(url) => updateContent('url', url)}
            placeholder="https://..."
            modalTitle={`Select Image for ${element.name}`}
          />
        )}

        {element.type === 'video' && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400">Video Source URL (MP4/WebM):</span>
            <input
              type="text"
              value={content.url || ''}
              onChange={(e) => updateContent('url', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="https://..."
            />
          </div>
        )}

        {element.type === 'qrcode' && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400">QR Target URL or Text:</span>
            <input
              type="text"
              value={content.qrUrl || ''}
              onChange={(e) => updateContent('qrUrl', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="https://..."
            />
            <span className="text-[11px] text-slate-400">Display Label:</span>
            <input
              type="text"
              value={content.qrLabel || ''}
              onChange={(e) => updateContent('qrLabel', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="Scan for details"
            />
          </div>
        )}

        {element.type === 'timer' && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400">Timer Label:</span>
            <input
              type="text"
              value={content.timerLabel || ''}
              onChange={(e) => updateContent('timerLabel', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="COUNTDOWN"
            />
          </div>
        )}
      </div>

      {/* Geometry: Position & Size */}
      <div className="space-y-2">
        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-sky-400" />
          <span>Position & Size (%)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">X Position (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(style.left)}
              onChange={(e) => updateStyle('left', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Y Position (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(style.top)}
              onChange={(e) => updateStyle('top', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Width (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={Math.round(style.width)}
              onChange={(e) => updateStyle('width', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Height (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={Math.round(style.height)}
              onChange={(e) => updateStyle('height', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Typography Controls (for text & timer) */}
      {(element.type === 'text' || element.type === 'timer') && (
        <div className="space-y-2">
          <label className="font-semibold text-slate-300 block">Typography</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">Font Size (vw)</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="12"
                value={style.fontSize ?? 2}
                onChange={(e) => updateStyle('fontSize', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Font Weight</span>
              <select
                value={style.fontWeight || 'normal'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
                <option value="black">Black</option>
              </select>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400">Alignment</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 mt-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle('textAlign', align)}
                  className={`flex-1 py-1 flex items-center justify-center rounded text-xs ${
                    style.textAlign === align
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {align === 'left' ? (
                    <AlignLeft className="w-3.5 h-3.5" />
                  ) : align === 'center' ? (
                    <AlignCenter className="w-3.5 h-3.5" />
                  ) : (
                    <AlignRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400">Text Color</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={style.color || '#ffffff'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={style.color || '#ffffff'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded p-1 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Surface Styling */}
      <div className="space-y-2">
        <label className="font-semibold text-slate-300 block">Surface & Borders</label>

        <div>
          <span className="text-[10px] text-slate-400">Background Color</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={
                style.backgroundColor && style.backgroundColor.startsWith('#')
                  ? style.backgroundColor
                  : '#1e293b'
              }
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={style.backgroundColor || ''}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded p-1 text-white font-mono text-[11px]"
              placeholder="e.g. rgba(15,23,42,0.8)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Border Radius (px)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={style.borderRadius || 0}
              onChange={(e) => updateStyle('borderRadius', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Border Width (px)</span>
            <input
              type="number"
              min={0}
              max={10}
              value={style.borderWidth || 0}
              onChange={(e) => updateStyle('borderWidth', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400">Border Color</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={
                style.borderColor && style.borderColor.startsWith('#')
                  ? style.borderColor
                  : '#3b82f6'
              }
              onChange={(e) => updateStyle('borderColor', e.target.value)}
              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={style.borderColor || ''}
              onChange={(e) => updateStyle('borderColor', e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded p-1 text-white font-mono text-[11px]"
              placeholder="e.g. #3b82f6 or rgba(...)"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Opacity</span>
            <span>{Math.round((style.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={style.opacity ?? 1}
            onChange={(e) => updateStyle('opacity', parseFloat(e.target.value))}
            className="w-full accent-sky-500 mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-400">Backdrop Blur (px)</span>
          <input
            type="number"
            min={0}
            max={40}
            value={style.backdropBlur || 0}
            onChange={(e) => updateStyle('backdropBlur', Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white mt-1"
          />
        </div>
      </div>
    </div>
  );
}
