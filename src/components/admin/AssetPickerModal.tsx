'use client';

import React, { useState, useRef } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  X,
  Check,
  Search,
  FolderOpen,
} from 'lucide-react';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, assetName?: string) => void;
  currentValue?: string;
  title?: string;
}

const PRESET_EVENT_PHOTOS = [
  {
    name: 'Auditorium Stage Lights',
    category: 'Stage',
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cyber Grid Dark Backdrop',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Global Tech Keynote Arena',
    category: 'Conference',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimal Dark Obsidian Fluid',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Championship Golden Trophy',
    category: 'Awards',
    url: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Neon Laser Wave Flow',
    category: 'Stage',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Midnight Black Event Arena',
    category: 'Auditorium',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ambient Concert Smoke & Light',
    category: 'Stage',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Geometric Studio',
    category: 'Studio',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=80',
  },
];

export function AssetPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentValue = '',
  title = 'Select Image or Background',
}: AssetPickerModalProps) {
  const { assets, addAsset } = useSmartScreen();
  const [activeTab, setActiveTab] = useState<'library' | 'presets' | 'upload' | 'url'>('library');
  const [customUrl, setCustomUrl] = useState(currentValue);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const filteredLibrary = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (url: string, name?: string) => {
    onSelectImage(url, name);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert to data URL and register in event asset library
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          await addAsset({
            id: 'asset-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            name: file.name,
            type: 'image',
            url: dataUrl,
            size: file.size,
            uploadedAt: Date.now(),
          });
        } catch {
          // Fallback handled
        }
        handleSelect(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    } catch {
      // Ignored
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
              <p className="text-xs text-neutral-400">
                Choose an asset, browse curated event photos, or upload a custom image
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/50'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Asset Library ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/50'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Presets ({PRESET_EVENT_PHOTOS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/50'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'url'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/50'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Direct URL</span>
          </button>
        </div>

        {/* Tab 1: Asset Library */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search uploaded event assets..."
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>

            {filteredLibrary.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                <p>No uploaded assets match your search.</p>
                <button
                  onClick={() => setActiveTab('presets')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Browse Event Presets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredLibrary.map((asset) => {
                  const isSelected = currentValue === asset.url;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleSelect(asset.url, asset.name)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video bg-neutral-900 flex flex-col justify-end p-2.5 ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-950/50'
                          : 'border-white/10 hover:border-blue-500/50 hover:scale-[1.02]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="relative z-10 flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-[140px] drop-shadow">
                          {asset.name}
                        </span>
                        {isSelected && (
                          <span className="p-1 rounded-full bg-blue-600 text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Curated Presets */}
        {activeTab === 'presets' && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_EVENT_PHOTOS.map((preset, idx) => {
                const isSelected = currentValue === preset.url;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(preset.url, preset.name)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video bg-neutral-900 flex flex-col justify-end p-2.5 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-950/50'
                        : 'border-white/10 hover:border-blue-500/50 hover:scale-[1.02]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-blue-400 font-bold block uppercase tracking-wider">
                          {preset.category}
                        </span>
                        <span className="font-bold text-white truncate max-w-[140px] block drop-shadow">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-blue-600 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Upload Local File */}
        {activeTab === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md p-8 border-2 border-dashed border-white/20 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-neutral-900/50 group text-center"
            >
              <div className="p-4 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {isUploading ? 'Processing File...' : 'Click or Drag to Upload Image'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Supports PNG, JPG, WebP, SVG (Recommended 1920x1080 for displays)
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/50"
              >
                Choose Local File
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Direct URL */}
        {activeTab === 'url' && (
          <div className="flex-1 flex flex-col justify-center p-4 space-y-4 max-w-xl mx-auto w-full">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Image Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleSelect(customUrl)}
                  disabled={!customUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/50"
                >
                  Apply URL
                </button>
              </div>
            </div>

            {/* Instant Preview */}
            {customUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-neutral-900 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-white font-mono">
                  Live Preview
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-neutral-500">
            Selected images automatically save to scene configuration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Convenient inline field with Image Picker button
export function ImageSelectField({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  modalTitle,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  modalTitle?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-neutral-300 font-semibold text-xs block">{label}</label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-sm shadow-blue-950/50"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Select / Upload Image</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {value ? (
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 bg-neutral-900 shrink-0 cursor-pointer relative group"
            title="Click to change image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ImageIcon className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-lg border border-dashed border-white/20 hover:border-blue-500 bg-neutral-900/60 flex items-center justify-center shrink-0 text-neutral-400 hover:text-white transition-colors"
            title="Choose Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-neutral-950 border border-white/10 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
        />
      </div>

      <AssetPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={onChange}
        currentValue={value}
        title={modalTitle || `Select Image for ${label}`}
      />
    </div>
  );
}
