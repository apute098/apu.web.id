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
import { triggerHaptic } from '@/lib/haptics';
import { RefreshCw } from 'lucide-react';

const ORDERED_TABS: ActiveTab[] = [
  'overview',
  'services',
  'processes',
  'docker',
  'network',
  'logs',
  'terminal',
  'watchdog',
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [systemData, setSystemData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(-1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const [logModalUnit, setLogModalUnit] = useState<string | null>(null);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
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
      if (ORDERED_TABS.includes(hash as ActiveTab)) {
        setActiveTab(hash as ActiveTab);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchTab = (tab: ActiveTab) => {
    triggerHaptic('light');
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'overview' ? '' : tab;
    }
  };

  // Mobile Touch Gestures: Pull-to-Refresh & Horizontal Swipe
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const dy = currentY - touchStartY.current;

      // Only allow pull-to-refresh at the top of the page
      if (window.scrollY === 0 && dy > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(dy * 0.45, 100)); // Elastic resistance
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const dy = touchEndY - touchStartY.current;
      const dx = touchEndX - touchStartX.current;

      // 1. Pull to refresh trigger
      if (isPulling) {
        if (pullDistance > 65) {
          triggerHaptic('success');
          await fetchSystemData();
        }
        setIsPulling(false);
        setPullDistance(0);
      }

      // 2. Horizontal Swipe between tabs (ignore if target is inside an input or scrollable element)
      if (Math.abs(dx) > 90 && Math.abs(dy) < 45 && !isPulling) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.overflow-x-auto'))) {
          return;
        }

        const currentIndex = ORDERED_TABS.indexOf(activeTab);
        if (dx < 0 && currentIndex < ORDERED_TABS.length - 1) {
          // Swipe Left -> Next Tab
          switchTab(ORDERED_TABS[currentIndex + 1]);
        } else if (dx > 0 && currentIndex > 0) {
          // Swipe Right -> Previous Tab
          switchTab(ORDERED_TABS[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, isPulling, pullDistance, fetchSystemData]);

  // Quick Action execution handler
  const handleTriggerAction = async (action: string) => {
    const token = localStorage.getItem('apu_admin_token') || MASTER_PIN;
    triggerHaptic('medium');
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
        triggerHaptic('success');
        alert(`Sukses: ${data.stdout || 'Perintah berhasil dieksekusi.'}`);
        fetchSystemData();
      } else {
        triggerHaptic('error');
        alert(`Gagal: ${data.error || data.stderr || 'Terjadi kesalahan eksekusi'}`);
      }
    } catch (err: any) {
      triggerHaptic('error');
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-[100dvh] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950 bg-[#030308]">
      {/* Pull-To-Refresh Indicator for Mobile */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-150"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
        >
          <div className="bg-[#080914]/90 border border-[#00f2fe]/40 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl backdrop-blur-xl">
            <RefreshCw
              className={`w-4 h-4 text-[#00f2fe] ${pullDistance > 65 ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${pullDistance * 4}deg)` }}
            />
            <span className="text-xs font-mono font-bold text-slate-200">
              {pullDistance > 65 ? 'Lepaskan untuk Refresh' : 'Tarik untuk Refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Ambient Cyberpunk Lighting */}
      <div className="ambient-glow-cyan top-1/4 -left-1/4" />
      <div className="ambient-glow-violet bottom-1/4 -right-1/4" />

      {/* Global Navbar with Mobile Bottom Thumb Dock */}
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
            triggerHaptic('medium');
          } else {
            setIsAuthModalOpen(true);
            triggerHaptic('light');
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        onManualRefresh={fetchSystemData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area: Responsive Mobile Spacing */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pt-20 sm:pt-28 pb-28 sm:pb-16 transition-opacity duration-300">
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
      <footer className="hidden sm:flex relative z-10 border-t border-white/[0.08] bg-[#05060f]/80 px-4 sm:px-8 py-4 text-[11px] font-mono text-slate-500 flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">apu.web.id Server Control Station</span>
          <span>•</span>
          <span>Node: archlinux</span>
          <span>•</span>
          <span className="text-[#10b981]">SSE Telemetry Active</span>
        </div>
        <div>
          <span>Arch Linux x86_64 • 9Router Gateway • Next.js 16</span>
        </div>
      </footer>
    </div>
  );
}
