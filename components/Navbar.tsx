'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, LogOut, Lock } from 'lucide-react';
import Logo3D from '@/components/Logo3D';

export type SubdomainTab = 'ai-hub' | 'admin';

interface NavbarProps {
  activeTab: SubdomainTab;
  setActiveTab: (tab: SubdomainTab) => void;
  serverOnline: boolean;
  onLogout?: () => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverOnline,
  onLogout,
  isAdmin = false,
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
        <div className="pointer-events-auto p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10  shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-full bg-slate-950 px-6 py-2.5 flex items-center gap-8">
            {/* Brand Logo & Status */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveTab('ai-hub')}
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                <Logo3D size={40} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="font-sans font-medium text-sm text-white/90 tracking-wide">apu.web.id</h1>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 border border-white/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span className="font-mono text-[9px] text-white/70 uppercase tracking-wider">
                      {serverOnline ? 'AI Hub Online' : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-sans text-sm tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isActive
                        ? 'bg-blue-600 text-white text-white'
                        : 'text-white/50 hover:text-white/90 hover:bg-slate-900 border border-slate-700'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-white/50'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="w-[1px] h-6 bg-blue-600 text-white mx-2" />

              {!isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className="group flex items-center gap-3 pl-5 pr-1 py-1 rounded-full bg-slate-900 border border-slate-700 border border-white/10 hover:bg-blue-600 text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <span className="font-sans text-sm text-white/90">Admin Login</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-95 group-hover:bg-white/20">
                    <Lock className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              )}

              {isAdmin && onLogout && (
                <button
                  onClick={onLogout}
                  className="group flex items-center gap-3 pl-5 pr-1 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <span className="font-sans text-sm text-rose-200">Logout</span>
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-95">
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
        <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10  transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-full bg-slate-950 px-4 py-2 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => {
                setActiveTab('ai-hub');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 border border-white/10 flex items-center justify-center overflow-hidden">
                <Logo3D size={32} />
              </div>
              <div className="flex flex-col">
                <h1 className="font-sans font-medium text-sm text-white/90 tracking-wide leading-tight">apu.web.id</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-[9px] text-white/70 uppercase tracking-wider">
                    {serverOnline ? 'Online' : 'Connecting'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 border border-white/10 flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-600 text-white"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-0.5 bg-white/90 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white/90 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
                <span className={`absolute left-0 w-5 h-0.5 bg-white/90 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile Full-Screen Hamburger Menu Overlay ===== */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-950/95  md:hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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
                className={`flex items-center gap-4 text-2xl font-sans tracking-wide transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                } ${isActive ? 'text-white' : 'text-white/50'}`}
                style={{ transitionDelay: isMobileMenuOpen ? `${100 + idx * 100}ms` : '0ms' }}
              >
                <span className={`p-3 rounded-full border ${isActive ? 'bg-blue-600 text-white border-white/20 text-white' : 'bg-transparent border-white/10 text-white/50'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div 
            className={`w-16 h-[1px] bg-blue-600 text-white my-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
            style={{ transitionDelay: isMobileMenuOpen ? `${100 + tabs.length * 100}ms` : '0ms' }}
          />

          {!isAdmin ? (
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`group flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-slate-900 border border-slate-700 border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${200 + tabs.length * 100}ms` : '0ms' }}
            >
              <span className="font-sans text-lg text-white/90">Admin Login</span>
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </button>
          ) : (
            onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className={`group flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${200 + tabs.length * 100}ms` : '0ms' }}
              >
                <span className="font-sans text-lg text-rose-200">Logout</span>
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-rose-300" />
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== Mobile Floating Glass Bottom Pill Navigation ===== */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10  shadow-2xl">
          <div className="flex items-center justify-around bg-slate-950/80 rounded-full px-2 py-2">
            <button
              onClick={() => setActiveTab('ai-hub')}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeTab === 'ai-hub' ? 'text-white' : 'text-white/50'
              }`}
            >
              <div className={`p-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeTab === 'ai-hub' ? 'bg-blue-600 text-white' : 'bg-transparent'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-sans font-medium">AI Hub</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  activeTab === 'admin' ? 'text-white' : 'text-white/50'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  activeTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-transparent'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-sans font-medium">Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-1.5 min-w-[64px] min-h-[48px] justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  activeTab === 'admin' ? 'text-white' : 'text-white/50'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  activeTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-transparent'
                }`}>
                  <Lock className="w-5 h-5" />
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
