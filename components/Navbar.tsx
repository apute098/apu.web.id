'use client';

import React from 'react';
import {
  Activity,
  Server,
  Cpu,
  Layers,
  Network,
  Terminal,
  FileText,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Boxes,
  Bot,
  Zap,
  Command,
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
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'processes', label: 'Processes', icon: Cpu },
    { id: 'docker', label: 'Docker', icon: Boxes },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'watchdog', label: 'AI Watchdog', icon: Bot },
  ];

  const uptime = systemData?.system?.uptime || '-';
  const cpuPercent = systemData?.cpu?.totalUsage ?? 0;
  const ramPercent = systemData?.ram?.usagePercent ?? 0;
  const healthScore = systemData?.healthScore ?? 100;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 select-none">
      {/* Top Telemetry Ticker Bar */}
      <div className="border-b border-white/5 bg-slate-950/90 px-3 sm:px-6 py-1.5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none">
          {/* Host status */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white tracking-wide">apu.web.id</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-cyan-400 hidden sm:inline font-sans">archlinux</span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <span>
              UP: <strong className="text-slate-200">{uptime}</strong>
            </span>
            <span>
              CPU:{' '}
              <strong className={cpuPercent > 80 ? 'text-rose-400' : cpuPercent > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                {cpuPercent}%
              </strong>
            </span>
            <span>
              RAM:{' '}
              <strong className={ramPercent > 85 ? 'text-rose-400' : 'text-slate-200'}>
                {ramPercent}%
              </strong>
            </span>
            <span className="hidden md:inline">
              HEALTH:{' '}
              <strong className={healthScore > 85 ? 'text-emerald-400' : 'text-amber-400'}>
                {healthScore}%
              </strong>
            </span>
          </div>
        </div>

        {/* Right controls: Refresh selector, lock/unlock */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Refresh interval dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-md px-2 py-0.5 text-xs text-slate-300">
            <span className="text-slate-400 text-[10px]">POLL:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-cyan-400 text-[11px] font-mono outline-none cursor-pointer"
            >
              <option value={1000} className="bg-slate-900 text-white">1s</option>
              <option value={2000} className="bg-slate-900 text-white">2s</option>
              <option value={5000} className="bg-slate-900 text-white">5s</option>
              <option value={10000} className="bg-slate-900 text-white">10s</option>
              <option value={0} className="bg-slate-900 text-white">Pause</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            title="Refresh Data"
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCmdPalette}
            className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[11px] transition-colors"
          >
            <Command className="w-3 h-3 text-cyan-400" />
            <span>Cmd</span>
            <kbd className="bg-slate-800 px-1 rounded text-[9px] text-slate-400">⌘K</kbd>
          </button>

          {/* Lock / Unlock Toggle */}
          {isLocked ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-sans font-medium transition-all"
            >
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLocked(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-sans font-medium transition-all"
            >
              <Unlock className="w-3 h-3" />
              <span>Admin Ready</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tab Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
