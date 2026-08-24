'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, LogOut, Lock, Search } from 'lucide-react';
import Logo3D from '@/components/Logo3D';

export type SubdomainTab = 'ai-hub' | 'admin';

interface NavbarProps {
  activeTab: SubdomainTab;
  setActiveTab: (tab: SubdomainTab) => void;
  serverOnline: boolean;
  onLogout?: () => void;
  isAdmin?: boolean;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverOnline,
  onLogout,
  isAdmin = false,
  onOpenCommandPalette,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const tabs: { id: SubdomainTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'ai-hub',
      label: 'AI Hub & Showcase',
      icon: <Sparkles className="w-4 h-4" />,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as SubdomainTab,
            label: 'Admin Control',
            icon: <ShieldCheck className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ===== Desktop Floating Island Glass Navbar ===== */}
      <header className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <div className="pointer-events-auto p-1.5 rounded-2xl liquid-glass border border-white/10 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-full bg-slate-950 px-6 py-2.5 flex items-center gap-6">
            {/* Brand Logo & Status */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveTab('ai-hub')}
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                <Logo3D size={40} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm text-white tracking-wide">apu.web.id</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full liquid-glass border border-white/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    <span className="font-mono text-[9px] text-slate-300 uppercase tracking-wider">
                      {serverOnline ? 'AI Hub Online' : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2" aria-label="Main Navigation">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-sans text-xs font-bold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10'
                    }`}
                  >
                    <span className={`${isActive ? 'text-slate-950' : 'text-slate-400'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* Command Palette Trigger */}
              {onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-400 hover:text-white transition-all text-xs font-medium focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                  title="Buka Command Palette (Ctrl+K / Cmd+K)"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline text-[11px]">Cari</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-white/10 text-[9px] font-mono text-cyan-300 font-bold">
                    ⌘K
                  </kbd>
                </button>
              )}

              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              {!isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className="group flex items-center gap-3 pl-4 pr-1.5 py-1 rounded-full bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                >
                  <span className="font-sans text-xs font-medium text-slate-300 group-hover:text-white">Admin Login</span>
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </button>
              )}

              {isAdmin && onLogout && (
                <button
                  onClick={onLogout}
                  className="group flex items-center gap-3 pl-4 pr-1.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                >
                  <span className="font-sans text-xs font-medium text-rose-200">Logout</span>
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <LogOut className="w-3.5 h-3.5 text-rose-300" />
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* ===== Mobile Glass Header ===== */}
      <header className="fixed top-4 left-4 right-4 z-[60] md:hidden">
        <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-full bg-slate-950 px-4 py-2 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => {
                setActiveTab('ai-hub');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-8 h-8 rounded-full liquid-glass border border-white/10 flex items-center justify-center overflow-hidden">
                <Logo3D size={32} />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm text-white tracking-wide leading-tight">apu.web.id</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  <span className="font-mono text-[9px] text-slate-300 uppercase tracking-wider">
                    {serverOnline ? 'Online' : 'Connecting'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors duration-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
                <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile Full-Screen Hamburger Menu Overlay ===== */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-950/95 md:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-4 text-xl font-sans tracking-wide transition-all duration-500 ${
                  isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                } ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
                style={{ transitionDelay: isMobileMenuOpen ? `${100 + idx * 100}ms` : '0ms' }}
              >
                <span className={`p-3 rounded-full border ${isActive ? 'bg-cyan-400 text-slate-950 border-cyan-400' : 'bg-slate-900 border-white/10 text-slate-400'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div 
            className="w-16 h-[1px] bg-white/10 my-4"
          />

          {!isAdmin ? (
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className="group flex items-center gap-4 pl-6 pr-2 py-2 rounded-full liquid-glass border border-white/10"
            >
              <span className="font-sans text-base font-medium text-slate-200">Admin Login</span>
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
            </button>
          ) : (
            onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="group flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-rose-500/10 border border-rose-500/20"
              >
                <span className="font-sans text-base font-medium text-rose-200">Logout</span>
                <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-rose-300" />
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== Mobile Floating Glass Bottom Pill Navigation ===== */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden" aria-label="Mobile Bottom Navigation">
        <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 shadow-2xl">
          <div className="flex items-center justify-around bg-slate-950/80 rounded-full px-2 py-2">
            <button
              onClick={() => setActiveTab('ai-hub')}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-300 ${
                activeTab === 'ai-hub' ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${
                activeTab === 'ai-hub' ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-transparent'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-sans font-medium">AI Hub</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-300 ${
                  activeTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-300 ${
                  activeTab === 'admin' ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-transparent'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-sans font-medium">Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-300 ${
                  activeTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-300 ${
                  activeTab === 'admin' ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-transparent'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-sans font-medium">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
