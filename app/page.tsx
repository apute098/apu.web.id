'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from '@/components/Navbar';
import { OverviewTab } from '@/components/OverviewTab';
import { ServicesTab } from '@/components/ServicesTab';
import { AgentHubTab } from '@/components/AgentHubTab';
import { TerminalTab } from '@/components/TerminalTab';
import { AuthModal } from '@/components/AuthModal';
import { CommandPalette } from '@/components/CommandPalette';

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [systemData, setSystemData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('apu_admin_token');
    }
    return true;
  });

  const fetchSystemData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') : null;
      const res = await fetch('/api/v1/system-status', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        setSystemData(json);
        setHistoryData((prev) => {
          const point = {
            time: new Date().toLocaleTimeString(),
            cpu: json.cpu?.totalUsage ?? 0,
            ram: json.ram?.usagePercent ?? 0,
            rxKbps: json.network?.downloadKbps ?? 0,
            txKbps: json.network?.uploadKbps ?? 0,
          };
          return [...prev, point].slice(-30);
        });
      }
    } catch {
      // diamkan: dashboard tetap render, status ditandai lewat badge
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchSystemData();
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => void fetchSystemData(), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSystemData, refreshInterval]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: ActiveTab[] = ['overview', 'services', 'agents', 'terminal'];
      if (validTabs.includes(hash as ActiveTab)) setActiveTab(hash as ActiveTab);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') window.location.hash = tab === 'overview' ? '' : tab;
  };

  const handleTriggerAction = async (action: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') : null;
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/v1/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        void fetchSystemData();
      } else {
        alert(`Gagal: ${data.error || data.stderr || 'Terjadi kesalahan eksekusi'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950 bg-[#05050d]">
      <div className="fixed top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none z-0" />

      <Navbar
        activeTab={activeTab}
        setActiveTab={switchTab}
        systemData={systemData}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        isLocked={isLocked}
        setIsLocked={(locked) => {
          if (locked) {
            localStorage.removeItem('apu_admin_token');
            setIsLocked(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        onManualRefresh={fetchSystemData}
        isRefreshing={isRefreshing}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pt-28 md:pt-32 pb-16">
        {!isLocked && activeTab === 'overview' && (
          <OverviewTab
            systemData={systemData}
            historyData={historyData}
            onTriggerAction={handleTriggerAction}
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateTab={switchTab}
          />
        )}

        {!isLocked && activeTab === 'services' && (
          <ServicesTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenLogModal={() => switchTab('terminal')}
          />
        )}

        {activeTab === 'agents' && <AgentHubTab onNavigateTab={switchTab} />}

        {activeTab === 'terminal' && (
          <TerminalTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {isLocked && activeTab !== 'agents' && (
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center backdrop-blur-md">
            <p className="hud-chip inline-block text-cyan-300">TAILNET ONLY</p>
            <h1 className="mt-4 text-2xl font-bold text-white">Mission Control terkunci</h1>
            <p className="mt-2 text-sm text-slate-400">
              Masukkan PIN admin untuk membuka telemetri, kontrol service, dan shell diagnostik.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-cyan-400 active:scale-[0.98]"
            >
              Unlock
            </button>
            <a href="/etalase" className="mt-4 block text-xs text-slate-500 transition hover:text-slate-300">
              Lihat etalase karya →
            </a>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsLocked(false);
          void fetchSystemData();
        }}
      />

      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onNavigateTab={switchTab}
        onTriggerAction={handleTriggerAction}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 px-4 sm:px-8 py-4 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">apu.web.id Mission Control</span>
          <span>•</span>
          <span>Node: archlinux</span>
          <span>•</span>
          <span className="text-emerald-400">Tailnet only</span>
        </div>
        <div>
          <span>Arch Linux x86_64 • 9Router Gateway • Next.js 16</span>
        </div>
      </footer>
    </div>
  );
}
