import React from 'react';
import { Activity, Server, Wallet, Terminal } from 'lucide-react';

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
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: 'keuangan',
      label: 'Keuangan',
      subdomain: 'keuangan.apu.web.id',
      url: 'https://keuangan.apu.web.id',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'router',
      label: 'Router',
      subdomain: 'router.apu.web.id',
      url: 'https://router.apu.web.id',
      icon: <Terminal className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* ===== Desktop / Tablet Header ===== */}
      <header className="sticky top-0 z-50 bg-[#05050d]/90 border-b border-white/10 px-4 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-white tracking-tight">apu.web.id</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {serverOnline ? 'Arch Server Online' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                Cloudflare Tunnel Active <span className="text-slate-500/60">·</span> Arch Linux x86_64
              </p>
            </div>
          </div>

          {/* Desktop Pill Nav */}
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const classes = `flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700'
              }`;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classes}
                  title={`Buka ${tab.subdomain}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ===== Mobile Header ===== */}
      <header className="sticky top-0 z-50 bg-[#05050d]/90 border-b border-white/10 px-4 py-2.5 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight leading-none">apu.web.id</h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {serverOnline ? 'Online' : 'Connecting...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Mobile Bottom Nav ===== */}
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
