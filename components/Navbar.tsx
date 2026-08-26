'use client';

import React, { useState, useEffect } from 'react';
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
  Command,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export type ActiveTab =
  | 'overview'
  | 'services'
  | 'agents'
  | 'terminal';

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
  isLocked,
  setIsLocked,
  onOpenAuthModal,
  onOpenCmdPalette,
  onManualRefresh,
  isRefreshing,
}: NavbarProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vitals', icon: Activity },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'agents', label: 'AI Hub', icon: Sparkles },
    { id: 'terminal', label: 'Diagnostics & Shell', icon: Terminal },
  ];

  const isLoaded = Boolean(systemData && systemData.cpu);
  const cpuPercent = isLoaded ? systemData?.cpu?.totalUsage ?? 0 : null;
  const ramPercent = isLoaded ? systemData?.ram?.usagePercent ?? 0 : null;

  const handleTabClick = (tabId: ActiveTab) => {
    triggerHaptic('light');
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 backdrop-blur-2xl bg-[#050609]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between">
          {/* Logo & Node Identifier */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-mono text-xs font-bold tracking-tight text-white">APU.WEB.ID</span>
              <span className="text-white/20 font-mono text-xs">/</span>
              <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">DECK // ARCH-01</span>
            </div>

            {timeStr && (
              <span className="hud-chip text-slate-400 hidden md:inline-flex">
                🕒 {timeStr}
              </span>
            )}
          </div>

          {/* Quick Hardware Badges & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoaded && (
              <div className="hidden lg:flex items-center gap-2">
                <div className="hud-chip flex items-center gap-1.5 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CPU <strong className="text-white">{cpuPercent}%</strong></span>
                </div>
                <div className="hud-chip flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>RAM <strong className="text-white">{ramPercent}%</strong></span>
                </div>
              </div>
            )}

            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenCmdPalette();
              }}
              className="tactile-btn px-2.5 py-1.5 text-xs text-slate-300 flex items-center gap-1.5 hover:text-white"
              title="Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-mono">⌘K</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onManualRefresh();
              }}
              disabled={isRefreshing}
              className="tactile-btn p-1.5 text-slate-300 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Auth Lock Toggle */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                if (isLocked) {
                  onOpenAuthModal();
                } else {
                  localStorage.removeItem('apu_admin_token');
                  setIsLocked(true);
                }
              }}
              className={`tactile-btn px-2.5 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isLocked
                  ? 'text-amber-400 hover:text-amber-300 border-amber-500/30'
                  : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isLocked ? 'LOCKED' : 'ADMIN'}</span>
            </button>
          </div>
        </div>

        {/* BOTTOM NAVIGATION TABS (SLIDER) */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
