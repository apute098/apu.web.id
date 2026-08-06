'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, SubdomainTab } from '@/components/Navbar';
import { HardwareTab } from '@/components/HardwareTab';
import { FinanceTab } from '@/components/finance/FinanceTab';
import { Server, Wallet, Terminal } from 'lucide-react';

export default function Home() {
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

    const interval = setInterval(() => {
      loadInitialData();
    }, 3000);

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

  const switchTab = (tab: SubdomainTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const hash = tab === 'hardware' ? '#home' : tab === 'keuangan' ? '#keuangan' : '#router';
      if (window.location.hash !== hash) window.location.hash = hash;
    }
  };

  const isHome = activeTab === 'hardware';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#22d3ee] selection:text-[#030309]">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={switchTab}
        serverOnline={systemData?.status === 'online'}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {isHome && (
          <>
            {/* ===== Minimal Hero Header ===== */}
            <header className="mb-6 md:mb-8 px-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    apu.web.id
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span className="relative flex w-2 h-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${systemData?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className={`relative inline-flex rounded-full w-2 h-2 ${systemData?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </span>
                    {systemData?.status === 'online' ? 'Server Online' : 'Menghubungkan...'}
                    <span className="text-slate-600">·</span>
                    Arch Linux x86_64
                    <span className="text-slate-600">·</span>
                    Cloudflare Tunnel
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => switchTab('hardware')}
                    className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    <Server className="w-3.5 h-3.5 inline mr-1.5" />
                    Telemetri
                  </button>
                  <button
                    onClick={() => switchTab('keuangan')}
                    className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    <Wallet className="w-3.5 h-3.5 inline mr-1.5" />
                    Keuangan
                  </button>
                  <button
                    onClick={() => switchTab('router')}
                    className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
                    Router
                  </button>
                </div>
              </div>
            </header>
          </>
        )}

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
          <div className="rounded-2xl border border-white/10 bg-[#05050d] p-2 md:p-3">
            <div className="flex items-center justify-between px-2 py-2.5 gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
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
                className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Buka di tab baru ↗
              </a>
            </div>
            <iframe
              src="https://router.apu.web.id"
              title="9Router Gateway"
              className="w-full h-[72vh] min-h-[480px] rounded-xl border border-white/5 bg-[#030309]"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </main>

      {/* ===== Footer Sederhana ===== */}
      <footer className="relative z-10 border-t border-white/10 bg-[#05050d]/80 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">apu.web.id</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Master Server Portal — telemetri hardware, keuangan AI, dan 9Router Gateway.
            </p>
            <div className="mt-3 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
              <span className="relative flex w-2 h-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                    systemData?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full w-2 h-2 ${
                    systemData?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {systemData?.status === 'online' ? 'Server Online' : 'Menghubungkan...'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                uptime {systemData?.uptime ?? '—'}
              </span>
            </div>
          </div>

          {/* Media Sosial */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Media Sosial</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://wa.me/62877511509544"
                  className="inline-flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/apute098"
                  className="inline-flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end items-start lg:items-end">
            <p className="text-[11px] text-slate-600 font-mono">
              &copy; {new Date().getFullYear()} apu.web.id
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
