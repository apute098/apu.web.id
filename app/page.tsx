'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, ActiveTab } from '@/components/Navbar';
import { OverviewTab } from '@/components/OverviewTab';
import { ServicesTab } from '@/components/ServicesTab';
import { ProcessesTab } from '@/components/ProcessesTab';
import { DockerTab } from '@/components/DockerTab';
import { NetworkTab } from '@/components/NetworkTab';
import { LogsTab } from '@/components/LogsTab';
import { TerminalTab } from '@/components/TerminalTab';
import { AiWatchdogTab } from '@/components/AiWatchdogTab';
import { AuthModal } from '@/components/AuthModal';
import { CommandPalette } from '@/components/CommandPalette';
import { MASTER_PIN } from '@/lib/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [systemData, setSystemData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(-1); // Default to SSE Stream (-1)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const [logModalUnit, setLogModalUnit] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Auth / Lock state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('apu_admin_token');
      return !token;
    }
    return true;
  });

  const appendHistory = useCallback((json: any) => {
    setHistoryData((prev) => {
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        cpu: json.cpu?.totalUsage ?? 0,
        ram: json.ram?.usagePercent ?? 0,
        rxKbps: json.network?.downloadKbps ?? 0,
        txKbps: json.network?.uploadKbps ?? 0,
      };
      const updated = [...prev, newPoint];
      return updated.slice(-30);
    });
  }, []);

  const fetchSystemData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/v1/system-status');
      if (res.ok) {
        const json = await res.json();
        setSystemData(json);
        appendHistory(json);
      }
    } catch (err) {
      console.error('Failed to fetch system status:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [appendHistory]);

  // Telemetry stream / polling effect
  useEffect(() => {
    // Mode SSE Stream (-1)
    if (refreshInterval === -1) {
      fetchSystemData();
      try {
        const es = new EventSource('/api/v1/stream');
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setSystemData(data);
            appendHistory(data);
          } catch {}
        };

        es.onerror = () => {
          es.close();
        };

        return () => {
          es.close();
          eventSourceRef.current = null;
        };
      } catch {
        fetchSystemData();
      }
    } else if (refreshInterval > 0) {
      fetchSystemData();
      const interval = setInterval(fetchSystemData, refreshInterval);
      return () => clearInterval(interval);
    } else {
      fetchSystemData();
    }
  }, [refreshInterval, fetchSystemData, appendHistory]);

  // URL Hash router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: ActiveTab[] = ['overview', 'services', 'processes', 'docker', 'network', 'logs', 'terminal', 'watchdog'];
      if (validTabs.includes(hash as ActiveTab)) {
        setActiveTab(hash as ActiveTab);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'overview' ? '' : tab;
    }
  };

  // Quick Action execution handler
  const handleTriggerAction = async (action: string) => {
    const token = localStorage.getItem('apu_admin_token') || MASTER_PIN;
    try {
      const res = await fetch('/api/v1/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Sukses: ${data.stdout || 'Perintah berhasil dieksekusi.'}`);
        fetchSystemData();
      } else {
        alert(`Gagal: ${data.error || data.stderr || 'Terjadi kesalahan eksekusi'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950 bg-[#05050d]">
      {/* Ambient Cyberpunk Glows */}
      <div className="fixed top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none z-0" />

      {/* Global Navbar */}
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pt-28 md:pt-32 pb-16">
        {activeTab === 'overview' && (
          <OverviewTab
            systemData={systemData}
            historyData={historyData}
            onTriggerAction={handleTriggerAction}
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateTab={switchTab}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenLogModal={(unit) => {
              setLogModalUnit(unit);
              switchTab('logs');
            }}
          />
        )}

        {activeTab === 'processes' && (
          <ProcessesTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'docker' && (
          <DockerTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'network' && <NetworkTab />}

        {activeTab === 'logs' && <LogsTab initialUnit={logModalUnit || 'all'} />}

        {activeTab === 'terminal' && (
          <TerminalTab
            isLocked={isLocked}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'watchdog' && <AiWatchdogTab />}
      </main>

      {/* Auth / PIN Unlock Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsLocked(false);
          fetchSystemData();
        }}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onNavigateTab={switchTab}
        onTriggerAction={handleTriggerAction}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Footer System Status Bar */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 px-4 sm:px-8 py-4 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">apu.web.id Server Control Station</span>
          <span>•</span>
          <span>Node: archlinux</span>
          <span>•</span>
          <span className="text-emerald-400">SSE Telemetry Active</span>
        </div>
        <div>
          <span>Arch Linux x86_64 • 9Router Gateway • Next.js 16</span>
        </div>
      </footer>
    </div>
  );
}
