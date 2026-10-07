'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
} from 'lucide-react';

interface GoogleSheetsImporterProps {
  onSuccess?: (count: number) => void;
  className?: string;
  isCompact?: boolean;
}

export function GoogleSheetsImporter({
  onSuccess,
  className = '',
  isCompact = false,
}: GoogleSheetsImporterProps) {
  const { scenes, updateScene, broadcastScene, eventState } = useSmartScreen();

  const [sheetUrl, setSheetUrl] = useState('');
  const [topCount, setTopCount] = useState<number>(5);
  const [sortByScore, setSortByScore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  // Auto-sync timer state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncIntervalSec, setAutoSyncIntervalSec] = useState<number>(60);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preview data before applying
  const [previewData, setPreviewData] = useState<
    { rank: number; name: string; score: string; badge?: string }[] | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to apply leaderboard data directly to scene-results
  const applyDataToLeaderboard = useCallback((
    leaderboardItems: { rank: number; name: string; score: string; badge?: string }[]
  ) => {
    const resultsScene = scenes.find((s) => s.type === 'results') || scenes.find((s) => s.id === 'scene-results');
    if (!resultsScene) {
      setErrorMsg('Results scene not found in active scenes.');
      return;
    }

    const tableEl = resultsScene.elements.find(
      (el) => el.id === 'el-res-table' || el.type === 'leaderboard'
    );

    if (!tableEl) {
      setErrorMsg('Leaderboard element not found in Results scene.');
      return;
    }

    const updatedElements = resultsScene.elements.map((el) => {
      if (el.id === tableEl.id) {
        return {
          ...el,
          content: {
            ...el.content,
            leaderboardData: leaderboardItems,
          },
        };
      }
      return el;
    });

    updateScene(resultsScene.id, { elements: updatedElements });
    setLastSyncTime(Date.now());
  }, [scenes, updateScene]);

  // Main fetch function for Google Sheets URL or raw CSV
  const handleFetch = useCallback(async (overrideCsvText?: string, silent = false) => {
    if (!overrideCsvText && !sheetUrl.trim()) {
      setErrorMsg('Please enter a Google Sheet URL or upload a CSV file.');
      return;
    }

    if (!silent) {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
    }

    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sheetUrl.trim(),
          csvText: overrideCsvText,
          topCount,
          sortByScore,
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Failed to process spreadsheet.');
      }

      if (resData.leaderboardData && Array.isArray(resData.leaderboardData)) {
        setPreviewData(resData.leaderboardData);
        applyDataToLeaderboard(resData.leaderboardData);

        const count = resData.leaderboardData.length;
        if (!silent) {
          setSuccessMsg(`✓ Successfully imported Top ${count} teams from Google Sheets!`);
          if (onSuccess) onSuccess(count);
        }
      } else {
        throw new Error('No leaderboard records were parsed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching Google Sheet';
      if (!silent) {
        setErrorMsg(msg);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [sheetUrl, topCount, sortByScore, applyDataToLeaderboard, onSuccess]);

  // Handle local CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleFetch(text);
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-upload same file if desired
    e.target.value = '';
  };

  // Background Auto-sync effect
  useEffect(() => {
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }

    if (autoSyncEnabled && sheetUrl.trim()) {
      autoSyncTimerRef.current = setInterval(() => {
        handleFetch(undefined, true);
      }, autoSyncIntervalSec * 1000);
    }

    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [autoSyncEnabled, sheetUrl, autoSyncIntervalSec, handleFetch]);

  return (
    <div
      className={`rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-xs">
                Google Sheets Leaderboard Sync
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                Auto Top N
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Paste Google Sheets URL or upload CSV to auto-fetch top teams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoSyncEnabled && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Syncing every {autoSyncIntervalSec}s
            </span>
          )}
          <button
            type="button"
            className="p-1 rounded-lg text-neutral-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Top Options: Google Sheets URL + File Upload */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-300 flex items-center justify-between">
              <span>Google Sheet URL / Share Link:</span>
              <span className="text-[10px] text-neutral-500 font-mono">
                Must be set to &quot;Anyone with link can view&quot;
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1Bxi.../edit"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Upload CSV Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-all border border-white/10 shrink-0"
                title="Upload local CSV / Excel export file"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            </div>
          </div>

          {/* Top N Count & Sorting Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-950/70 border border-white/10 text-xs">
            {/* Top N Selection */}
            <div>
              <span className="text-neutral-400 font-mono text-[10px] uppercase block mb-1.5">
                Number of Top Teams to Fetch:
              </span>
              <div className="flex items-center gap-1.5">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTopCount(num)}
                    className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs transition-all ${
                      topCount === num
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/5'
                    }`}
                  >
                    Top {num}
                  </button>
                ))}
                <div className="w-16">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={topCount}
                    onChange={(e) => setTopCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-1.5 px-2 text-center text-white font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                    title="Custom Top N"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Sort and Live Refresh Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sortByScore}
                  onChange={(e) => setSortByScore(e.target.checked)}
                  className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px] text-neutral-300 font-medium">
                  Auto-sort by highest score descending
                </span>
              </label>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Live Auto-Sync:</span>
                  </span>
                </label>

                {autoSyncEnabled && (
                  <select
                    value={autoSyncIntervalSec}
                    onChange={(e) => setAutoSyncIntervalSec(Number(e.target.value))}
                    className="bg-neutral-900 border border-white/10 text-white text-[10px] font-mono rounded px-2 py-0.5 focus:outline-none"
                  >
                    <option value={15}>Every 15s</option>
                    <option value={30}>Every 30s</option>
                    <option value={60}>Every 1m</option>
                    <option value={120}>Every 2m</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Fetch & Sync */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleFetch()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-950/50 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Fetching Spreadsheet...' : `Fetch & Apply Top ${topCount}`}</span>
              </button>

              {eventState.activeSceneId !== 'scene-results' && (
                <button
                  type="button"
                  onClick={() => {
                    const resultsScene = scenes.find((s) => s.type === 'results') || scenes.find((s) => s.id === 'scene-results');
                    if (resultsScene) broadcastScene(resultsScene.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Show Results on Displays</span>
                </button>
              )}
            </div>

            {lastSyncTime && (
              <span className="text-[10px] font-mono text-neutral-500">
                Last Synced: <span className="text-neutral-400 font-bold">{new Date(lastSyncTime).toLocaleTimeString()}</span>
              </span>
            )}
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">LIVE UPDATED</span>
            </div>
          )}

          {/* Preview of Parsed Leaderboard */}
          {previewData && previewData.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="uppercase font-bold text-neutral-300">
                  Imported Top {previewData.length} Roster Preview:
                </span>
                <span>Active on Display Screen</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {previewData.map((row) => (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-950/80 border border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-black text-white">
                        #{row.rank}
                      </span>
                      <span className="font-sans font-bold text-white truncate max-w-[180px]">
                        {row.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{row.score}</span>
                      {row.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-sans">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
