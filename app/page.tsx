'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, SubdomainTab } from '@/components/Navbar';
import { HardwareTab } from '@/components/HardwareTab';
import { FinanceTab } from '@/components/FinanceTab';
import { ShieldCheck, Cloud, Server, Terminal } from 'lucide-react';

export default function Home() {
  // detect route awal: keuangan subdomain atau hash #keuangan → langsung tab keuangan
  const getInitialTab = (): SubdomainTab => {
    if (typeof window !== 'undefined') {
      if (
        window.location.hostname === 'keuangan.apu.web.id' ||
        window.location.hash === '#keuangan'
      ) {
        return 'keuangan';
      }
      if (window.location.hash === '#router') return 'router';
    }
    return 'hardware';
  };
  const [activeTab, setActiveTab] = useState<SubdomainTab>(getInitialTab);
  const [systemData, setSystemData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  const fetchSystemData = async () => {
    try {
      setRefreshing(true);
      setSystemError(null);
      const res = await fetch('/api/v1/system-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSystemData(json);
    } catch (err) {
      console.error('Failed to fetch system metrics', err);
      setSystemError('Gagal memuat data sistem. Periksa koneksi server lalu coba lagi.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setRefreshing(true);
        setSystemError(null);
        const res = await fetch('/api/v1/system-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (isMounted) setSystemData(json);
      } catch (err) {
        console.error('Failed to fetch system metrics', err);
        if (isMounted) setSystemError('Gagal memuat data sistem. Periksa koneksi server lalu coba lagi.');
      } finally {
        if (isMounted) setRefreshing(false);
      }
    };

    loadInitialData();

    // Real-time telemetry pulse every 3 seconds
    const interval = setInterval(() => {
      loadInitialData();
    }, 3000);

    // Auto-buka tab Keuangan kalau diakses via keuangan.apu.web.id (fallback safety)
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'keuangan.apu.web.id'
    ) {
      setActiveTab('keuangan');
    }

    // Sync hash → tab saat navigasi hash berubah (#keuangan / #router)
    const onHashChange = () => {
      const h = window.location.hash;
      if (h === '#keuangan') setActiveTab('keuangan');
      else if (h === '#router') setActiveTab('router');
      else if (h === '#home' || h === '') setActiveTab('hardware');
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#FF6B2C] selection:text-white relative">
      {/* Ambient background grid + glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
        }}
      />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverOnline={systemData?.status === 'online'}
      />

      {/* Main Content Area — pb extra di mobile biar gak ketutup bottom nav */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'hardware' && (
          <HardwareTab
            systemData={systemData}
            refreshing={refreshing}
            onManualRefresh={fetchSystemData}
            error={systemError}
            onRetry={fetchSystemData}
          />
        )}

        {activeTab === 'keuangan' && <FinanceTab />}

        {/* Router — embedded 9router gateway (iframe, bukan tab baru) */}
        {activeTab === 'router' && (
          <div className="floating-card p-2 md:p-3">
            <div className="flex items-center justify-between px-2 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 border border-[#FF6B2C]/30 flex items-center justify-center text-[#FF6B2C]">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">9Router Gateway</h2>
                  <p className="text-xs text-slate-400">router.apu.web.id — embedded</p>
                </div>
              </div>
              <a
                href="https://router.apu.web.id"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all"
              >
                Buka di tab baru ↗
              </a>
            </div>
            <iframe
              src="https://router.apu.web.id"
              title="9Router Gateway"
              className="w-full h-[72vh] min-h-[480px] rounded-xl border border-white/5 bg-[#0B0F0D]"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-[#0B0F0D]/80 backdrop-blur-xl py-4 px-6 text-xs text-slate-400 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
            </span>
            <span className="font-bold text-white">apu.web.id Master Server Portal</span>
            <span>&bull;</span>
            <span className="font-mono text-slate-400">
              Arch Linux x86_64 (HDD WAL Mode)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-[#FF6B2C]" /> Cloudflare Tunnel
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 9Router &amp; Hermes AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
