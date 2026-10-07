'use client';

import React, { useState } from 'react';
import { useSmartScreen } from '@/context/SmartScreenContext';
import { AdminHeader } from './AdminHeader';
import { QuickBroadcastBar } from './QuickBroadcastBar';
import { DisplayPreview } from './DisplayPreview';
import { SceneManager } from './SceneManager';
import { SceneEditor } from './SceneEditor/SceneEditor';
import { TimerControlPanel } from './TimerControlPanel';
import { AnnouncementQueuePanel } from './AnnouncementQueuePanel';
import { ScheduleManager } from './ScheduleManager';
import { AssetLibrary } from './AssetLibrary';
import { BrandKitPanel } from './BrandKitPanel';
import { QrCodeTool } from './QrCodeTool';
import { DisplayHealthPanel } from './DisplayHealthPanel';
import { EmergencyModal } from './EmergencyModal';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { QuickPresetCustomizer } from './QuickPresetCustomizer';
import {
  LayoutDashboard,
  Layers,
  Timer,
  Megaphone,
  CalendarClock,
  FolderOpen,
  Palette,
  QrCode,
  Activity,
  Sliders,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    activeScene,
    connectedDisplaysCount,
  } = useSmartScreen();

  const [activeTab, setActiveTab] = useState<
    'console' | 'scenes' | 'timer' | 'announcements' | 'schedule' | 'assets' | 'brand' | 'qr' | 'health'
  >('console');

  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState<string>('welcome');
  const [consoleRightTab, setConsoleRightTab] = useState<'customizer' | 'timer' | 'announcements'>('customizer');

  const navigationTabs = [
    { id: 'console', label: 'Console', icon: LayoutDashboard },
    { id: 'scenes', label: 'Scenes & Studio', icon: Layers },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'assets', label: 'Asset Library', icon: FolderOpen },
    { id: 'brand', label: 'Brand Kit', icon: Palette },
    { id: 'qr', label: 'QR Generator', icon: QrCode },
    { id: 'health', label: 'Display Health', icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Top Header */}
      <AdminHeader
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-neutral-950/90 backdrop-blur-xl border-r border-white/10 p-3 lg:p-4 flex flex-row lg:flex-col justify-between shrink-0 overflow-x-auto lg:overflow-y-auto">
          <nav className="flex flex-row lg:flex-col gap-1 w-full">
            <span className="hidden lg:block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 mb-1">
              Operations Navigation
            </span>

            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setEditingSceneId(null);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Live Screen Mini-Status in Sidebar */}
          <div className="hidden lg:block pt-4 border-t border-white/10 mt-4">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400 font-mono">BROADCAST STATE:</span>
                <span className="flex items-center gap-1.5 text-blue-400 font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {activeScene?.name || 'Loading...'}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                <span className="text-white font-mono font-bold">{connectedDisplaysCount}</span> active physical display(s)
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {editingSceneId ? (
            <div className="h-[800px] w-full">
              <SceneEditor
                sceneId={editingSceneId}
                onClose={() => setEditingSceneId(null)}
              />
            </div>
          ) : (
            <>
              {/* Tab: CONSOLE (Main Central Operations Console) */}
              {activeTab === 'console' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* Quick Broadcast & Presentation Director Bar */}
                  <QuickBroadcastBar
                    onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                    onSelectPreset={(type) => {
                      setSelectedPresetType(type);
                      setConsoleRightTab('customizer');
                    }}
                  />

                  {/* Live Simulator & Side Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Live Physical Simulator */}
                    <div className="lg:col-span-7 space-y-6">
                      <DisplayPreview />
                      <DisplayHealthPanel />
                    </div>

                    {/* Operational Mini Controls & Preset Customizer */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Sub-panel selector tabs */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/90 backdrop-blur-xl rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setConsoleRightTab('customizer')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            consoleRightTab === 'customizer'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Customizer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleRightTab('timer')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            consoleRightTab === 'timer'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>Timer Deck</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleRightTab('announcements')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            consoleRightTab === 'announcements'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>Ping Queue</span>
                        </button>
                      </div>

                      {/* Active Sub-panel */}
                      {consoleRightTab === 'customizer' && (
                        <QuickPresetCustomizer
                          selectedPresetType={selectedPresetType}
                          onSelectPresetType={setSelectedPresetType}
                        />
                      )}
                      {consoleRightTab === 'timer' && <TimerControlPanel />}
                      {consoleRightTab === 'announcements' && <AnnouncementQueuePanel />}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SCENES & STUDIO */}
              {activeTab === 'scenes' && (
                <div className="max-w-7xl mx-auto">
                  <SceneManager
                    onEditScene={(sceneId) => setEditingSceneId(sceneId)}
                  />
                </div>
              )}

              {/* Tab: TIMER STUDIO */}
              {activeTab === 'timer' && (
                <div className="max-w-4xl mx-auto">
                  <TimerControlPanel />
                </div>
              )}

              {/* Tab: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="max-w-4xl mx-auto">
                  <AnnouncementQueuePanel />
                </div>
              )}

              {/* Tab: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="max-w-4xl mx-auto">
                  <ScheduleManager />
                </div>
              )}

              {/* Tab: ASSETS */}
              {activeTab === 'assets' && (
                <div className="max-w-7xl mx-auto">
                  <AssetLibrary />
                </div>
              )}

              {/* Tab: BRAND KIT */}
              {activeTab === 'brand' && (
                <div className="max-w-4xl mx-auto">
                  <BrandKitPanel />
                </div>
              )}

              {/* Tab: QR GENERATOR */}
              {activeTab === 'qr' && (
                <div className="max-w-4xl mx-auto">
                  <QrCodeTool />
                </div>
              )}

              {/* Tab: HEALTH & TELEMETRY */}
              {activeTab === 'health' && (
                <div className="max-w-5xl mx-auto">
                  <DisplayHealthPanel />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Firebase Setup Modal */}
      <FirebaseConfigModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
