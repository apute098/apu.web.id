'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, SubdomainTab } from '@/components/Navbar';
import { HardwareTab } from '@/components/HardwareTab';
import { FinanceTab } from '@/components/finance/FinanceTab';
import ParticleField from '@/components/ParticleField';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Cloud,
  Server,
  Terminal,
  Wallet,
  Bot,
  Webhook,
  Cpu,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Github,
  Heart,
} from 'lucide-react';

const BENTO_MODULES: {
  id: SubdomainTab;
  title: string;
  desc: string;
  icon: React.ReactElement<{ className?: string }>;
  glow: string;
}[] = [
  {
    id: 'hardware',
    title: 'Telemetri Hardware',
    desc: 'CPU, RAM, temperatur, HDD I/O & jaringan Arch Linux secara real-time setiap 3 detik.',
    icon: <Cpu />,
    glow: 'text-cyan-300',
  },
  {
    id: 'keuangan',
    title: 'Keuangan AI',
    desc: 'Dashboard finansial SQLite WAL + analisa mandiri AI dari chat WhatsApp/Telegram.',
    icon: <Wallet />,
    glow: 'text-violet-300',
  },
  {
    id: 'router',
    title: '9Router Gateway',
    desc: 'Kontrol gateway router ter-embed langsung di portal — tanpa tab baru.',
    icon: <Terminal />,
    glow: 'text-cyan-300',
  },
  {
    id: 'keuangan',
    title: 'Hermes Orchestrator',
    desc: 'Webhook receiver + ekstraksi AI Gemini 3.6 Flash untuk pencatatan transaksi otomatis.',
    icon: <Bot />,
    glow: 'text-violet-300',
  },
  {
    id: 'keuangan',
    title: 'Webhook Layer',
    desc: 'Simulasi & audit trail webhook WhatsApp / Telegram real-time.',
    icon: <Webhook />,
    glow: 'text-cyan-300',
  },
  {
    id: 'keuangan',
    title: 'Security & OAuth',
    desc: 'Autentikasi endpoint, proteksi webhook token, dan kendali akses portal.',
    icon: <ShieldCheck />,
    glow: 'text-emerald-300',
  },
];

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

  // Pindah tab dari bento card — sinkronkan hash agar URL tetap konsisten
  const switchTab = (tab: SubdomainTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const hash = tab === 'hardware' ? '#home' : tab === 'keuangan' ? '#keuangan' : '#router';
      if (window.location.hash !== hash) window.location.hash = hash;
    }
  };

  const isHome = activeTab === 'hardware';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#22d3ee] selection:text-[#030309] relative">
      {/* Deep space ambient background */}
      <div className="space-bg" />
      <div className="space-vignette" />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={switchTab}
        serverOnline={systemData?.status === 'online'}
      />

      {/* Main Content Area — pb extra di mobile biar gak ketutup bottom nav */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {isHome && (
          <>
            {/* ===== Hero Section ===== */}
            <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#07071a]/90 via-[#05050d]/70 to-transparent mb-6 md:mb-8">
              {/* Canvas partikel: maks 260px di HP, penuh di desktop */}
              <ParticleField className="apu-hero-canvas absolute inset-x-0 top-0 h-[260px] md:h-full w-full" />
              <div className="relative z-10 px-4 py-10 sm:px-10 sm:py-16 lg:py-24 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-white/5 border border-cyan-400/25 text-cyan-300 backdrop-blur-md mb-6">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-cyan-400" />
                    </span>
                    Live System &middot; Arch Linux x86_64 &middot; Cloudflare Tunnel
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="apu-hero text-[1.7rem] leading-[1.12] sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white"
                >
                  apu<span className="aurora-text">.web.id</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
                >
                  Master Server Portal &mdash; pusat komando telemetri hardware, keuangan AI,
                  dan 9Router Gateway dalam satu antarmuka orbital.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto"
                >
                  <button
                    onClick={() => switchTab('hardware')}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] w-full sm:w-auto rounded-2xl text-sm font-bold text-[#030309] bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-400/50 hover:-translate-y-0.5"
                  >
                    <Server className="w-4 h-4 flex-shrink-0" />
                    Lihat Telemetri
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => switchTab('keuangan')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] w-full sm:w-auto rounded-2xl text-sm font-bold text-violet-200 bg-violet-500/10 border border-violet-400/30 hover:bg-violet-500/20 hover:border-violet-400/50 backdrop-blur-md transition-all hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    Keuangan AI
                  </button>
                </motion.div>
              </div>
            </section>

            {/* ===== Bento Grid — Modul Portal ===== */}
            <section className="apu-bento mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-xl font-bold text-white mb-5 flex items-center gap-2.5"
              >
                <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                Modul Portal
                <span className="text-xs font-mono text-slate-500 font-normal">{'// 6 modul aktif'}</span>
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4">
                {BENTO_MODULES.map((mod, i) => (
                  <motion.button
                    key={mod.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => switchTab(mod.id)}
                    className="bento-card text-left floaty group"
                    style={{ animationDelay: `${i * 0.5}s` }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                      e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
                    }}
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${mod.glow} transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)] group-hover:-translate-y-0.5`}>
                      {React.cloneElement(mod.icon, { className: 'w-5 h-5' })}
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{mod.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 group-hover:text-cyan-300 transition-colors">
                      BUKA MODUL <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                ))}
              </div>
            </section>

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
          <div className="floating-card p-2 md:p-3">
            <div className="flex items-center justify-between px-2 py-2.5 gap-2 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
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
                              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-lg text-[11px] font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all"
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

      {/* ===== Footer Lengkap ===== */}
      <footer className="apu-footer relative z-10 border-t border-white/10 bg-[#05050d]/80 backdrop-blur-xl mt-8">
        {/* Garis neon atas footer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand + Status Server Live (data REAL dari systemData) */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 flex items-center justify-center text-[#030309] shadow-lg shadow-cyan-500/30">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white">
                apu<span className="aurora-text">.web.id</span>
              </h3>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Master Server Portal &mdash; telemetri hardware, keuangan AI, dan 9Router Gateway
              dalam satu antarmuka orbital.
            </p>
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
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
                uptime {systemData?.uptime ?? '—'} &middot; {systemData?.os?.split(' (')[0] ?? 'Arch Linux'}
              </span>
            </div>
          </div>

          {/* Navigasi Modul */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Modul</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => switchTab('hardware')}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-300" /> Telemetri Hardware
                </button>
              </li>
              <li>
                <button
                  onClick={() => switchTab('keuangan')}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <Wallet className="w-3.5 h-3.5 text-violet-300" /> Keuangan AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => switchTab('router')}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-300" /> 9Router Gateway
                </button>
              </li>
            </ul>
          </div>

          {/* Teknologi — status layanan REAL dari API system-status */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Teknologi</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Cloudflare Tunnel', key: 'cloudflared', icon: <Cloud className="w-3.5 h-3.5 text-cyan-300" /> },
                { name: '9Router', key: '9router', icon: <Terminal className="w-3.5 h-3.5 text-violet-300" /> },
                { name: 'Hermes AI', key: 'hermes-gateway', icon: <Bot className="w-3.5 h-3.5 text-emerald-300" /> },
              ].map((svc) => {
                const raw = systemData?.services?.[svc.key];
                const active = typeof raw === 'string' && raw.includes('active');
                return (
                  <li key={svc.key} className="flex items-center gap-2 text-xs text-slate-400">
                    {svc.icon}
                    <span>{svc.name}</span>
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]' : 'bg-slate-600'}`} />
                    <span className="font-mono text-[10px] text-slate-500">{active ? 'active' : '—'}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Media Sosial */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Media Sosial</h4>
            <ul className="space-y-2.5">
              {[
                {
                  name: 'WhatsApp', href: 'https://wa.me/62877511509544', icon: <MessageCircle className="w-4 h-4" />, hover: 'hover:border-emerald-400/40 hover:text-emerald-300',
                },
                {
                  name: 'GitHub', href: 'https://github.com/apute098', icon: <Github className="w-4 h-4" />, hover: 'hover:border-white/30 hover:text-white',
                },
              ].map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    className={`inline-flex items-center justify-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 transition-all ${s.hover}`}
                  >
                    {s.icon} {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 font-mono">
              &copy; {new Date().getFullYear()} apu.web.id &mdash; Master Server Portal. Arch Linux x86_64 (HDD WAL Mode).
            </p>
            <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
              Dibangun dengan <Heart className="w-3 h-3 text-cyan-400" /> di atas Cloudflare Tunnel &amp; 9Router
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
