'use client';

import React from 'react';
import {
  Server,
  Wallet,
  Terminal,
  Activity,
  Cloud,
} from 'lucide-react';

export type SubdomainTab =
  | 'hardware'
  | 'router'
  | 'keuangan'
  | 'admin';

interface NavbarProps {
  activeTab: SubdomainTab;
  setActiveTab: (tab: SubdomainTab) => void;
  serverOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverOnline,
}) => {
  const tabs: { id: SubdomainTab; label: string; subdomain: string; url: string; icon: React.ReactNode }[] = [
    {
      id: 'hardware',
      label: 'Home',
      subdomain: 'apu.web.id',
      url: 'https://apu.web.id',
      icon: <Server />,
    },
    {
      id: 'keuangan',
      label: 'Keuangan',
      subdomain: 'keuangan.apu.web.id',
      url: 'https://keuangan.apu.web.id',
      icon: <Wallet />,
    },
    {
      id: 'router',
      label: 'Router',
      subdomain: 'router.apu.web.id',
      url: 'https://router.apu.web.id',
      icon: <Terminal />,
    },
  ];

  // Semua tab internal — klik pindah konten di tab yang sama (bukan buka tab baru)
  return (
    <>
      {/* ===== Desktop / Tablet Header ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0B0F0D]/70 border-b border-white/5 px-4 py-3 shadow-lg shadow-black/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-[#FF6B2C]/40 blur-lg" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B2C] to-[#FF8A4C] border border-orange-400/50 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">
                  apu<span className="text-[#FF6B2C]">.web.id</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="hume-dot" />
                  {serverOnline ? 'Arch Server Online' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Cloud className="w-3 h-3 text-[#FF6B2C]" />
                Cloudflare Tunnel Active &bull; Arch Linux x86_64
              </p>
            </div>
          </div>

          {/* Desktop Pill Nav */}
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const classes = `flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FF6B2C] text-white shadow-lg shadow-orange-500/40 border border-orange-400/60'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classes}
                  title={`Buka ${tab.subdomain}`}
                >
                  {tab.icon}
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className={`text-[10px] font-mono font-normal opacity-80 ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                      {tab.subdomain}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ===== Mobile Top Bar (ringkas) ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0B0F0D]/80 border-b border-white/5 px-4 py-2.5 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B2C] to-[#FF8A4C] flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight leading-none">
                apu<span className="text-[#FF6B2C]">.web.id</span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="hume-dot" />
                {serverOnline ? 'Server Online' : 'Connecting...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Mobile Bottom Nav (ala app Hume) ===== */}
      <nav className="hume-bottombar md:hidden pb-safe">
        <div className="flex items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const cls = `hume-bottom-item ${isActive ? 'active' : ''}`;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cls} title={`Buka ${tab.subdomain}`}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
