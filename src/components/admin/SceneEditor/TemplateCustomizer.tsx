'use client';

import React from 'react';
import { Scene, SceneElement } from '@/types/smartscreen';
import { ImageSelectField } from '../AssetPickerModal';
import {
  QrCode,
  Plus,
  Trash2,
} from 'lucide-react';

interface TemplateCustomizerProps {
  scene: Scene;
  onUpdateScene: (updated: Scene) => void;
  onSetTimerDuration?: (minutes: number) => void;
}

export function TemplateCustomizer({
  scene,
  onUpdateScene,
  onSetTimerDuration,
}: TemplateCustomizerProps) {
  // Ultra-resilient element finder by ID, ID prefix, name keywords, or element type
  const findEl = (targetId: string, fallbackKeywords?: string[], fallbackType?: string): SceneElement | undefined => {
    // 1. Exact or prefix match on ID
    let found = scene.elements.find(
      (el) => el.id === targetId || el.id.startsWith(targetId) || targetId.startsWith(el.id)
    );
    if (found) return found;

    // 2. Keyword match on element name
    if (fallbackKeywords && fallbackKeywords.length > 0) {
      found = scene.elements.find((el) =>
        fallbackKeywords.some((kw) => el.name.toLowerCase().includes(kw.toLowerCase()))
      );
      if (found) return found;
    }

    // 3. Fallback by element type
    if (fallbackType) {
      found = scene.elements.find((el) => el.type === fallbackType);
      if (found) return found;
    }

    return undefined;
  };

  const updateElementContent = (
    targetId: string,
    contentUpdates: Partial<SceneElement['content']>,
    fallbackKeywords?: string[],
    fallbackType?: string
  ) => {
    const target = findEl(targetId, fallbackKeywords, fallbackType);
    if (!target) return;

    onUpdateScene({
      ...scene,
      elements: scene.elements.map((el) =>
        el.id === target.id
          ? {
              ...el,
              content: { ...el.content, ...contentUpdates },
            }
          : el
      ),
    });
  };

  const updateElementText = (
    targetId: string,
    newText: string,
    fallbackKeywords?: string[]
  ) => {
    updateElementContent(targetId, { text: newText }, fallbackKeywords, 'text');
  };

  const updateSceneBackground = (url: string) => {
    onUpdateScene({
      ...scene,
      background: {
        type: 'image',
        value: url,
      },
    });
  };

  return (
    <div className="p-4 space-y-5 text-xs text-neutral-200 overflow-y-auto max-h-[700px]">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            {scene.type} Template Content
          </span>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Admin customized template fields
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase">
          {scene.type}
        </span>
      </div>

      {/* ==================== WELCOME TEMPLATE ==================== */}
      {scene.type === 'welcome' && (
        <div className="space-y-4">
          {/* Main Title */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Event Main Title</label>
            <input
              type="text"
              value={findEl('el-welcome-title', ['Main Title', 'Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-welcome-title', e.target.value, ['Main Title', 'Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
              placeholder="e.g. WELCOME TO GLOBAL TECH SUMMIT"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Subtitle / Session Info</label>
            <input
              type="text"
              value={findEl('el-welcome-sub', ['Subtitle', 'Sub'])?.content.text || ''}
              onChange={(e) => updateElementText('el-welcome-sub', e.target.value, ['Subtitle', 'Sub'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Keynote Session Begins at 10:00 AM"
            />
          </div>

          {/* Top Pill Badge */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Top Pill Badge Text</label>
            <input
              type="text"
              value={findEl('el-welcome-badge', ['Badge', 'Pill'])?.content.text || ''}
              onChange={(e) => updateElementText('el-welcome-badge', e.target.value, ['Badge', 'Pill'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
              placeholder="✦ GLOBAL TECH SUMMIT • MAIN AUDITORIUM"
            />
          </div>

          {/* Event Emblem / Logo Picker */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10">
            <ImageSelectField
              label="Event Emblem / Logo"
              value={findEl('el-welcome-logo', ['Logo', 'Emblem'], 'logo')?.content.url || ''}
              onChange={(url) =>
                updateElementContent('el-welcome-logo', { url }, ['Logo', 'Emblem'], 'logo')
              }
              placeholder="https://..."
              modalTitle="Select Welcome Event Logo"
            />
          </div>

          {/* Scene Backdrop Image Picker */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10">
            <ImageSelectField
              label="Welcome Background Photo"
              value={scene.background.type === 'image' ? scene.background.value : ''}
              onChange={updateSceneBackground}
              placeholder="https://..."
              modalTitle="Select Welcome Background Photo"
            />
          </div>

          {/* QR Code link & label */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2.5">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Event QR Code</span>
            </span>
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Target URL:</span>
              <input
                type="text"
                value={findEl('el-welcome-qr', ['QR Code', 'QR'], 'qrcode')?.content.qrUrl || ''}
                onChange={(e) =>
                  updateElementContent('el-welcome-qr', { qrUrl: e.target.value }, ['QR Code', 'QR'], 'qrcode')
                }
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">QR Caption:</span>
              <input
                type="text"
                value={findEl('el-welcome-qr', ['QR Code', 'QR'], 'qrcode')?.content.qrLabel || ''}
                onChange={(e) =>
                  updateElementContent('el-welcome-qr', { qrLabel: e.target.value }, ['QR Code', 'QR'], 'qrcode')
                }
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Wi-Fi & Footer */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Wi-Fi & Venue Notice</label>
            <input
              type="text"
              value={findEl('el-welcome-footer', ['Footer', 'Wifi'])?.content.text || ''}
              onChange={(e) => updateElementText('el-welcome-footer', e.target.value, ['Footer', 'Wifi'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
              placeholder="Guest Wi-Fi: Network • Password: password"
            />
          </div>
        </div>
      )}

      {/* ==================== RULES TEMPLATE ==================== */}
      {scene.type === 'rules' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Regulations Heading</label>
            <input
              type="text"
              value={findEl('el-rules-heading', ['Heading', 'Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-rules-heading', e.target.value, ['Heading', 'Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Subtitle / Timeline</label>
            <input
              type="text"
              value={findEl('el-rules-sub', ['Subtitle', 'Sub'])?.content.text || ''}
              onChange={(e) => updateElementText('el-rules-sub', e.target.value, ['Subtitle', 'Sub'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Rule Cards Editor (Numbers White) */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <span className="font-semibold text-neutral-300 block">Rule Cards Roster</span>
            {(findEl('el-rules-cards', ['Rule Cards', 'Rules'], 'rule_cards')?.content.ruleCardsData || []).map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-xs">Rule #{rule.number}</span>
                  <input
                    type="text"
                    value={rule.tag || ''}
                    placeholder="Tag"
                    onChange={(e) => {
                      const current = findEl('el-rules-cards', ['Rule Cards', 'Rules'], 'rule_cards');
                      const updated = [...(current?.content.ruleCardsData || [])];
                      updated[idx].tag = e.target.value;
                      updateElementContent('el-rules-cards', { ruleCardsData: updated }, ['Rule Cards', 'Rules'], 'rule_cards');
                    }}
                    className="w-24 bg-neutral-950 border border-white/10 rounded px-2 py-1 text-[10px] text-right text-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  value={rule.title}
                  placeholder="Rule Title"
                  onChange={(e) => {
                    const current = findEl('el-rules-cards', ['Rule Cards', 'Rules'], 'rule_cards');
                    const updated = [...(current?.content.ruleCardsData || [])];
                    updated[idx].title = e.target.value;
                    updateElementContent('el-rules-cards', { ruleCardsData: updated }, ['Rule Cards', 'Rules'], 'rule_cards');
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-bold text-xs"
                />
                <textarea
                  rows={2}
                  value={rule.description}
                  placeholder="Rule Details"
                  onChange={(e) => {
                    const current = findEl('el-rules-cards', ['Rule Cards', 'Rules'], 'rule_cards');
                    const updated = [...(current?.content.ruleCardsData || [])];
                    updated[idx].description = e.target.value;
                    updateElementContent('el-rules-cards', { ruleCardsData: updated }, ['Rule Cards', 'Rules'], 'rule_cards');
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-neutral-300 text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Notice / Helpline Footer</label>
            <input
              type="text"
              value={findEl('el-rules-footer', ['Footer'])?.content.text || ''}
              onChange={(e) => updateElementText('el-rules-footer', e.target.value, ['Footer'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ==================== TIMER TEMPLATE ==================== */}
      {scene.type === 'timer' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Round / Timer Title</label>
            <input
              type="text"
              value={findEl('el-timer-title', ['Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-timer-title', e.target.value, ['Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick presets (Buttons blue-toned, numbers white) */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2">
            <span className="font-semibold text-neutral-300 block">Quick Set Authoritative Countdown:</span>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onSetTimerDuration && onSetTimerDuration(mins)}
                  className="py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-white font-mono font-bold text-xs transition-colors"
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Instructions Subtitle</label>
            <input
              type="text"
              value={findEl('el-timer-sub', ['Instructions', 'Sub'])?.content.text || ''}
              onChange={(e) => updateElementText('el-timer-sub', e.target.value, ['Instructions', 'Sub'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Next Phase Notice</label>
            <input
              type="text"
              value={findEl('el-timer-next', ['Next Phase', 'Next'])?.content.text || ''}
              onChange={(e) => updateElementText('el-timer-next', e.target.value, ['Next Phase', 'Next'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ==================== ANNOUNCEMENT TEMPLATE ==================== */}
      {scene.type === 'announcement' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Notice Tag</label>
            <input
              type="text"
              value={findEl('el-ann-tag', ['Notice Tag', 'Tag'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ann-tag', e.target.value, ['Notice Tag', 'Tag'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
              placeholder="📢 EVENT ANNOUNCEMENT"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Announcement Headline</label>
            <input
              type="text"
              value={findEl('el-ann-headline', ['Headline', 'Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ann-headline', e.target.value, ['Headline', 'Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-black text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Message Body Details</label>
            <textarea
              rows={3}
              value={findEl('el-ann-body', ['Message Body', 'Body'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ann-body', e.target.value, ['Message Body', 'Body'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-xs leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Action Callout</label>
            <input
              type="text"
              value={findEl('el-ann-action', ['Action', 'Reminder'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ann-action', e.target.value, ['Action', 'Reminder'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-blue-400 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ==================== BREAK TEMPLATE ==================== */}
      {scene.type === 'break' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Intermission Title</label>
            <input
              type="text"
              value={findEl('el-break-title', ['Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-break-title', e.target.value, ['Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Resumption Time Badge</label>
            <input
              type="text"
              value={findEl('el-break-resume', ['Resumes', 'Resume'])?.content.text || ''}
              onChange={(e) => updateElementText('el-break-resume', e.target.value, ['Resumes', 'Resume'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              placeholder="PROGRAM RESUMES AT 02:00 PM"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Guest Guidance Note</label>
            <input
              type="text"
              value={findEl('el-break-note', ['Guidance', 'Note'])?.content.text || ''}
              onChange={(e) => updateElementText('el-break-note', e.target.value, ['Guidance', 'Note'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-neutral-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ==================== RESULTS TEMPLATE ==================== */}
      {scene.type === 'results' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Results Heading</label>
            <input
              type="text"
              value={findEl('el-res-title', ['Results Title', 'Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-res-title', e.target.value, ['Results Title', 'Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Subtitle</label>
            <input
              type="text"
              value={findEl('el-res-subtitle', ['Subtitle', 'Sub'])?.content.text || ''}
              onChange={(e) => updateElementText('el-res-subtitle', e.target.value, ['Subtitle', 'Sub'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Standings Table Rows (Numbers White, Buttons Blue) */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-300">Leaderboard Standings</span>
              <button
                type="button"
                onClick={() => {
                  const current = findEl('el-res-table', ['Leaderboard', 'Table'], 'leaderboard');
                  const rows = current?.content.leaderboardData || [];
                  const newRow = {
                    rank: rows.length + 1,
                    name: `Team ${rows.length + 1}`,
                    score: '85.0 pts',
                    badge: 'Finalist',
                  };
                  updateElementContent('el-res-table', { leaderboardData: [...rows, newRow] }, ['Leaderboard', 'Table'], 'leaderboard');
                }}
                className="flex items-center gap-1 text-[11px] text-blue-400 font-bold hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team</span>
              </button>
            </div>

            {(findEl('el-res-table', ['Leaderboard', 'Table'], 'leaderboard')?.content.leaderboardData || []).map((row, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900/80 border border-white/10"
              >
                {/* Number pure white */}
                <span className="font-mono font-bold text-white w-6 text-center text-xs">
                  #{row.rank}
                </span>
                <input
                  type="text"
                  value={row.name}
                  placeholder="Team Name"
                  onChange={(e) => {
                    const current = findEl('el-res-table', ['Leaderboard', 'Table'], 'leaderboard');
                    const updated = [...(current?.content.leaderboardData || [])];
                    updated[idx].name = e.target.value;
                    updateElementContent('el-res-table', { leaderboardData: updated }, ['Leaderboard', 'Table'], 'leaderboard');
                  }}
                  className="flex-1 bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                />
                {/* Score numbers pure white */}
                <input
                  type="text"
                  value={row.score}
                  placeholder="Score"
                  onChange={(e) => {
                    const current = findEl('el-res-table', ['Leaderboard', 'Table'], 'leaderboard');
                    const updated = [...(current?.content.leaderboardData || [])];
                    updated[idx].score = e.target.value;
                    updateElementContent('el-res-table', { leaderboardData: updated }, ['Leaderboard', 'Table'], 'leaderboard');
                  }}
                  className="w-24 bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono font-bold text-xs text-right focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = findEl('el-res-table', ['Leaderboard', 'Table'], 'leaderboard');
                    const rows = current?.content.leaderboardData || [];
                    const filtered = rows.filter((_, i) => i !== idx);
                    updateElementContent('el-res-table', { leaderboardData: filtered }, ['Leaderboard', 'Table'], 'leaderboard');
                  }}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Footer Ceremony Info</label>
            <input
              type="text"
              value={findEl('el-res-footer', ['Footer'])?.content.text || ''}
              onChange={(e) => updateElementText('el-res-footer', e.target.value, ['Footer'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ==================== THANK YOU TEMPLATE ==================== */}
      {scene.type === 'thank_you' && (
        <div className="space-y-4">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Closing Title</label>
            <input
              type="text"
              value={findEl('el-ty-title', ['Thank You', 'Title'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ty-title', e.target.value, ['Thank You', 'Title'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-black text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Host Sign-off Message</label>
            <textarea
              rows={2}
              value={findEl('el-ty-sub', ['Farewell', 'Sub'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ty-sub', e.target.value, ['Farewell', 'Sub'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Farewell Photo Picker */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10">
            <ImageSelectField
              label="Farewell Photo or Backdrop"
              value={scene.background.type === 'image' ? scene.background.value : ''}
              onChange={updateSceneBackground}
              placeholder="https://..."
              modalTitle="Select Thank You Photo"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Social Media & Next Event Teaser</label>
            <input
              type="text"
              value={findEl('el-ty-social', ['Social', 'Next'])?.content.text || ''}
              onChange={(e) => updateElementText('el-ty-social', e.target.value, ['Social', 'Next'])}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
