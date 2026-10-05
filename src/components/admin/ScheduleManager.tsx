'use client';

import React, { useState, useEffect } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import {
  CalendarClock,
  Plus,
  Trash2,
  Radio,
  Clock,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';

export function ScheduleManager() {
  const {
    schedule,
    scenes,
    eventState,
    broadcastScene,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
  } = useSmartScreen();

  const [currentTime, setCurrentTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0]?.id || '');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [itemTitle, setItemTitle] = useState('');
  const [autoTrigger, setAutoTrigger] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const scene = scenes.find((s) => s.id === selectedSceneId);
    if (!scene) return;

    await addScheduleItem({
      sceneId: scene.id,
      sceneName: scene.name,
      scheduledTime,
      title: itemTitle.trim() || scene.name,
      enabled: true,
      autoTrigger,
    });

    setItemTitle('');
    setIsAdding(false);
  };

  // Sort schedule chronologically
  const sortedSchedule = [...schedule].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Event Schedule Timeline</h3>
            <p className="text-[11px] text-slate-400">
              Automated scene transitions based on event clock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-sky-400">
            <Clock className="w-3.5 h-3.5" />
            <span>LOCAL: {currentTime}</span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Add Slot Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSchedule}
          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in text-xs"
        >
          <div className="flex items-center justify-between font-bold text-white">
            <span>Schedule Automated Scene Transition</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Time (24-Hour HH:MM)</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Scene</label>
              <select
                value={selectedSceneId}
                onChange={(e) => setSelectedSceneId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
              >
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Slot Agenda Title</label>
            <input
              type="text"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g. Opening Remarks & Rules Briefing"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTrigger}
                onChange={(e) => setAutoTrigger(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span>Automatically broadcast when clock reaches time</span>
            </label>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
            >
              Save Slot
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="space-y-2">
        {sortedSchedule.map((slot) => {
          const isCurrentlyActive = eventState.activeSceneId === slot.sceneId;

          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                isCurrentlyActive
                  ? 'bg-sky-950/30 border-sky-500/50 shadow-md'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono font-black text-sm text-sky-400 shrink-0">
                  {slot.scheduledTime}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{slot.title}</span>
                    {slot.autoTrigger && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Zap className="w-3 h-3" />
                        Auto
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Target Scene: <span className="text-slate-300">{slot.sceneName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Manual Trigger Now */}
                <button
                  onClick={() => broadcastScene(slot.sceneId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCurrentlyActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isCurrentlyActive ? 'Broadcasting' : 'Trigger Now'}</span>
                </button>

                {/* Toggle Auto */}
                <button
                  onClick={() =>
                    updateScheduleItem(slot.id, { autoTrigger: !slot.autoTrigger })
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title={slot.autoTrigger ? 'Disable Auto Trigger' : 'Enable Auto Trigger'}
                >
                  {slot.autoTrigger ? (
                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteScheduleItem(slot.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400"
                  title="Delete Schedule Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
