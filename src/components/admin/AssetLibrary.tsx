'use client';

import React, { useState, useRef } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { AssetItem } from '@/types/smartscreen';
import { initializeFirebaseServices } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  FolderOpen,
  Upload,
  Search,
  Video,
  Trash2,
  Copy,
  Check,
  Eye,
} from 'lucide-react';

export function AssetLibrary() {
  const { assets, addAsset, deleteAsset, isFirebaseConnected } = useSmartScreen();

  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'video' | 'logo' | 'background'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video');
      const detectedType: AssetItem['type'] = isVideo
        ? 'video'
        : file.name.toLowerCase().includes('logo')
        ? 'logo'
        : file.name.toLowerCase().includes('bg') || file.name.toLowerCase().includes('background')
        ? 'background'
        : 'image';

      try {
        const { storage } = initializeFirebaseServices();

        if (storage && isFirebaseConnected) {
          const storagePath = `events/current/assets/${Date.now()}_${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);

          await addAsset({
            id: 'asset-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            name: file.name,
            type: detectedType,
            url: downloadUrl,
            storagePath,
            size: file.size,
            uploadedAt: Date.now(),
          });
        } else {
          // Local fallback: read as Object URL or Data URL
          const localUrl = URL.createObjectURL(file);
          await addAsset({
            id: 'asset-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            name: file.name,
            type: detectedType,
            url: localUrl,
            size: file.size,
            uploadedAt: Date.now(),
          });
        }
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyUrl = (asset: AssetItem) => {
    navigator.clipboard.writeText(asset.url).catch(() => {});
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'all' || asset.type === activeCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 text-white">
      {/* Header with Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Event Asset Library</h3>
            <p className="text-[11px] text-neutral-400">
              {isFirebaseConnected
                ? 'Synced with Firebase Storage event bucket'
                : 'Local & Cloud Storage Asset Manager'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Category Tabs */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
          {(['all', 'image', 'video', 'logo', 'background'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors shrink-0 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[600px] overflow-y-auto p-1">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group flex flex-col justify-between rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 overflow-hidden transition-all shadow-md"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {asset.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 text-sky-400">
                  <Video className="w-8 h-8 mb-1 opacity-80" />
                  <span className="text-[10px] font-mono text-slate-400">Video Media</span>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              )}

              {/* Type Badge */}
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-slate-300 uppercase">
                {asset.type}
              </span>

              {/* Quick Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCopyUrl(asset)}
                  className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                  title="Copy URL"
                >
                  {copiedId === asset.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => deleteAsset(asset.id)}
                  className="p-1.5 rounded-lg bg-red-950 text-red-300 hover:bg-red-900"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Asset Metadata */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 text-[11px]">
              <p className="font-bold text-slate-200 truncate" title={asset.name}>
                {asset.name}
              </p>
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] mt-1">
                <span>{formatFileSize(asset.size)}</span>
                <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{previewAsset.name}</h4>
                <span className="text-xs text-slate-400 font-mono">
                  {formatFileSize(previewAsset.size)} • {previewAsset.type}
                </span>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[400px]">
              {previewAsset.type === 'video' ? (
                <video src={previewAsset.url} controls autoPlay className="max-h-[400px] w-auto" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-[400px] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleCopyUrl(previewAsset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Asset URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
