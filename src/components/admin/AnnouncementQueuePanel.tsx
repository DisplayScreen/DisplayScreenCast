'use client';

import React, { useState, useCallback } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { AnnouncementItem } from '@/types/smartscreen';
import {
  Megaphone,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  XCircle,
  Bell,
  Zap,
  Pin,
  Radio,
} from 'lucide-react';

export function AnnouncementQueuePanel() {
  const {
    announcements,
    eventState,
    updateBannerAnnouncement,
    addAnnouncement,
    deleteAnnouncement,
    reorderAnnouncements,
  } = useSmartScreen();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [quickPingText, setQuickPingText] = useState('');
  const [quickPingDuration, setQuickPingDuration] = useState(8);

  const activeBanner = eventState.bannerAnnouncement;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim() || newTitle.trim(),
      priority: newPriority,
      status: 'queued',
      order: announcements.length + 1,
    });

    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleBroadcastPing = useCallback(async (item: AnnouncementItem, durationSeconds: number = 8) => {
    const timestamp = Date.now();
    await updateBannerAnnouncement({
      id: item.id,
      title: item.title,
      text: item.content || item.title,
      type: item.priority === 'high' ? 'urgent' : item.priority === 'medium' ? 'warning' : 'info',
      active: true,
      mode: 'ping',
      durationSeconds,
      expiresAt: timestamp + durationSeconds * 1000,
    });
  }, [updateBannerAnnouncement]);

  const handleBroadcastPinned = useCallback(async (item: AnnouncementItem) => {
    await updateBannerAnnouncement({
      id: item.id,
      title: item.title,
      text: item.content || item.title,
      type: item.priority === 'high' ? 'urgent' : item.priority === 'medium' ? 'warning' : 'info',
      active: true,
      mode: 'pinned',
    });
  }, [updateBannerAnnouncement]);

  const handleQuickPing = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPingText.trim()) return;

    const timestamp = Date.now();
    await updateBannerAnnouncement({
      id: 'ping-' + timestamp.toString(36),
      title: 'LIVE ANNOUNCEMENT',
      text: quickPingText.trim(),
      type: 'warning',
      active: true,
      mode: 'ping',
      durationSeconds: quickPingDuration,
      expiresAt: timestamp + quickPingDuration * 1000,
    });

    setQuickPingText('');
  }, [quickPingText, quickPingDuration, updateBannerAnnouncement]);

  const handleDismissBanner = async () => {
    await updateBannerAnnouncement(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...announcements];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    reorderAnnouncements(newOrder.map((a) => a.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === announcements.length - 1) return;
    const newOrder = [...announcements];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    reorderAnnouncements(newOrder.map((a) => a.id));
  };

  return (
    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Live Announcement & Ping Engine</h3>
            <p className="text-[11px] text-neutral-400">
              Ping temporary floating notifications or pin persistent banners
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Queue Notice</span>
        </button>
      </div>

      {/* Instant Rapid Ping Bar */}
      <form
        onSubmit={handleQuickPing}
        className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        <div className="flex-1 flex items-center gap-2 bg-neutral-950 border border-white/10 rounded-xl px-3 py-2">
          <Zap className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
          <input
            type="text"
            value={quickPingText}
            onChange={(e) => setQuickPingText(e.target.value)}
            placeholder="Type fast announcement (e.g. Keynote starting in 2 mins!)..."
            className="w-full bg-transparent text-white text-xs placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={quickPingDuration}
            onChange={(e) => setQuickPingDuration(Number(e.target.value))}
            className="bg-neutral-950 border border-white/10 text-white rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
            title="Auto-dismiss duration"
          >
            <option value={5}>5 sec ping</option>
            <option value={8}>8 sec ping</option>
            <option value={15}>15 sec ping</option>
            <option value={30}>30 sec ping</option>
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-blue-950/50"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Ping Screens</span>
          </button>
        </div>
      </form>

      {/* Active Notification / Ticker Status Card */}
      {activeBanner && activeBanner.active ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-500 text-slate-950 font-black animate-pulse">
              <Bell className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 tracking-wider">
                {activeBanner.mode === 'pinned'
                  ? 'Pinned Top Banner Active:'
                  : `Live Ping Notification Active (${activeBanner.durationSeconds || 8}s auto-dismiss):`}
              </span>
              <p className="text-sm font-bold text-white line-clamp-1">{activeBanner.text}</p>
            </div>
          </div>
          <button
            onClick={handleDismissBanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-semibold shrink-0 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Dismiss</span>
          </button>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Display notification channel is clear and ready to ping.
          </span>
          <span className="text-[10px] font-mono text-slate-500">READY</span>
        </div>
      )}

      {/* New Announcement Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in text-xs"
        >
          <div className="flex items-center justify-between font-bold text-white">
            <span>Prepare New Announcement</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Headline Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Round 1 ends in 10 minutes"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Detailed Content (optional)</label>
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. Please commit and push all code before 12:00 PM."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Priority:</span>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
              >
                <option value="low">Low (Info)</option>
                <option value="medium">Medium (Notice)</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
            >
              Add to Queue
            </button>
          </div>
        </form>
      )}

      {/* Queue Items List */}
      <div className="space-y-2">
        {announcements.length === 0 ? (
          <p className="text-center text-slate-500 text-xs py-4 font-mono">
            No queued announcements
          </p>
        ) : (
          announcements.map((item, idx) => {
            const isLive = activeBanner?.active && activeBanner.text === item.content;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 transition-all gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === announcements.length - 1}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.priority === 'high'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                </div>

                {/* Broadcast actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Ping 8s button */}
                  <button
                    onClick={() => handleBroadcastPing(item, 8)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/50"
                    title="Send as floating ping notification (disappears in 8s)"
                  >
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span>Ping (<span className="text-white font-mono">8s</span>)</span>
                  </button>

                  {/* Pin Banner button */}
                  <button
                    onClick={() => handleBroadcastPinned(item)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isLive && activeBanner?.mode === 'pinned'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title="Pin permanently to top of screens until dismissed"
                  >
                    <Pin className="w-3 h-3" />
                    <span>Pin</span>
                  </button>

                  <button
                    onClick={() => deleteAnnouncement(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
