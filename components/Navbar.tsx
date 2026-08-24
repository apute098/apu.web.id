'use client';

import React from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Network,
  Terminal,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  Boxes,
  Bot,
  Radio,
  Command,
  ChevronRight,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'services'
  | 'processes'
  | 'docker'
  | 'network'
  | 'logs'
  | 'terminal'
  | 'watchdog';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemData: any;
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  onOpenAuthModal: () => void;
  onOpenCmdPalette: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export function Navbar({
  activeTab,
  setActiveTab,
  systemData,
  refreshInterval,
  setRefreshInterval,
  isLocked,
  setIsLocked,
  onOpenAuthModal,
  onOpenCmdPalette,
  onManualRefresh,
  isRefreshing,
}: NavbarProps) {
  const tabs = [
    { id: 'overview', label: 'Vitals', icon: Activity },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'processes', label: 'Processes', icon: Cpu },
    { id: 'docker', label: 'Docker', icon: Boxes },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'watchdog', label: 'Watchdog', icon: Bot },
  ];

  const uptime = systemData?.system?.uptime || '-';
  const cpuPercent = systemData?.cpu?.totalUsage ?? 0;
  const ramPercent = systemData?.ram?.usagePercent ?? 0;
  const healthScore = systemData?.healthScore ?? 100;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 select-none pointer-events-none">
      {/* Floating Island Navigation Container */}
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div className="floating-island rounded-full px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          {/* Brand & Live Telemetry Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2fe]"></span>
              </span>
              <span className="font-extrabold text-[13px] tracking-tight text-white font-sans">
                apu<span className="text-[#00f2fe]">.web.id</span>
              </span>
            </div>

            {/* Quick Metrics Ticker */}
            <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">CPU</span>
                <strong className={cpuPercent > 80 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {cpuPercent}%
                </strong>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">RAM</span>
                <strong className={ramPercent > 85 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {ramPercent}%
                </strong>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">UP</span>
                <span className="text-slate-300">{uptime}</span>
              </span>
            </div>
          </div>

          {/* Central Module Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00f2fe]/20 to-[#8b5cf6]/20 text-[#00f2fe] border border-[#00f2fe]/35 shadow-sm shadow-[#00f2fe]/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00f2fe]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh / SSE Mode Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1 text-[11px] font-mono text-slate-300">
              {refreshInterval === -1 && <Radio className="w-3 h-3 text-[#10b981] animate-pulse" />}
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-[#00f2fe] text-[11px] font-mono outline-none cursor-pointer"
              >
                <option value={-1} className="bg-[#080914] text-[#10b981]">SSE Live</option>
                <option value={1000} className="bg-[#080914] text-white">1s Poll</option>
                <option value={3000} className="bg-[#080914] text-white">3s Poll</option>
                <option value={0} className="bg-[#080914] text-white">Pause</option>
              </select>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={onManualRefresh}
              title="Manual Telemetry Pull"
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-[#00f2fe] transition-all duration-300 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00f2fe]' : ''}`} />
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCmdPalette}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-mono transition-all"
            >
              <Command className="w-3 h-3 text-[#00f2fe]" />
              <kbd className="text-[10px] text-slate-400">⌘K</kbd>
            </button>

            {/* Lock / Unlock State Pill */}
            {isLocked ? (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f43f5e]/15 hover:bg-[#f43f5e]/25 border border-[#f43f5e]/30 text-[#f43f5e] text-xs font-semibold transition-all duration-300 active:scale-95"
              >
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLocked(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold transition-all duration-300 active:scale-95"
              >
                <Unlock className="w-3 h-3" />
                <span>Root Unlocked</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
