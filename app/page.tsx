'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Navbar, SubdomainTab } from '@/components/Navbar';
import { AdminControlTab } from '@/components/AdminControlTab';
import { AiHubTab } from '@/components/AiHubTab';
import LandingPage from '@/components/landing/LandingPage';
import { Lock, LogIn, ShieldAlert, KeyRound } from 'lucide-react';

export default function Home() {
  // view: 'landing' (website profesional, default) | 'app' (dashboard)
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<SubdomainTab>('ai-hub');
  const [systemData, setSystemData] = useState<any>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Admin session state
  const [isAdminSession, setIsAdminSession] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('apu_admin_token');
      if (storedToken) {
        setIsAdminSession(true);
      }
      const hash = window.location.hash;
      // Hash app → dashboard langsung; selain itu landing
      if (hash === '#admin') {
        setView('app');
        setActiveTab('admin');
      } else if (hash === '#ai-hub' || hash === '#app') {
        setView('app');
        setActiveTab('ai-hub');
      } else {
        setView('landing');
        setActiveTab('ai-hub');
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthSuccess(null);
    if (!tokenInput.trim()) {
      setLoginError('Token atau kredensial tidak boleh kosong');
      return;
    }

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier: tokenInput, password: tokenInput }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem('apu_admin_token', json.token || tokenInput);
        setIsAdminSession(true);
        setAuthSuccess('Login berhasil! Selamat datang Kembali.');
        setTimeout(() => {
          setActiveTab('admin');
          setAuthSuccess(null);
        }, 1000);
      } else {
        setLoginError(json.message || 'Access denied. Fuck you!');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Access denied. Fuck you!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apu_admin_token');
    setIsAdminSession(false);
    setActiveTab('ai-hub');
  };

  const fetchSystemData = async () => {
    try {
      setRefreshing(true);
      setSystemError(null);
      const res = await fetch('/api/v1/system-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSystemData(json);
    } catch (err) {
      setSystemError('Gagal memuat data sistem.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setRefreshing(true);
        const res = await fetch('/api/v1/system-status');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setSystemData(json);
        }
      } catch {
        /* ignore */
      } finally {
        if (isMounted) setRefreshing(false);
      }
    };

    loadInitialData();

    const interval = setInterval(() => {
      loadInitialData();
    }, 4000);

    const onHashChange = () => {
      const h = window.location.hash;
      // Landing anchors (#about/#skills/...) tidak mengganti view
      if (h === '#admin') {
        setView('app');
        setActiveTab('admin');
      } else if (h === '#ai-hub' || h === '#app') {
        setView('app');
        setActiveTab('ai-hub');
      } else if (h === '' || h === '#') {
        // kosong saat di app → tetap app; saat di landing → tetap landing
        setActiveTab('ai-hub');
      }
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // IntersectionObserver for scroll reveals — re-run saat view berubah
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [view]);

  const switchTab = (tab: SubdomainTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const hash = tab === 'admin' ? '#admin' : '';
      if (window.location.hash !== hash) window.location.hash = hash;
    }
  };

  // Landing = pintu depan profesional; app = dashboard (2 tab)
  if (view === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#22d3ee] selection:text-[#030309] bg-slate-950">
      {/* Ambient Orbs */}
      <div className="fixed top-1/4 -left-1/4 w-[600px] h-[600px] rounded-none bg-cyan-500/8  pointer-events-none z-0 animate-float-orb" />
      <div 
        className="fixed bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-none bg-purple-500/8  pointer-events-none z-0 animate-float-orb" 
        style={{ animationDelay: '3s' }} 
      />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={switchTab}
        serverOnline={systemData?.status === 'online'}
        onLogout={handleLogout}
        isAdmin={isAdminSession}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-28 md:pt-32 pb-36 md:pb-12">
        {activeTab === 'ai-hub' && <AiHubTab />}

        {activeTab === 'admin' && (
          isAdminSession ? (
            <AdminControlTab
              systemData={systemData}
              systemError={systemError}
              refreshing={refreshing}
              onManualRefreshSystem={fetchSystemData}
            />
          ) : (
            <div className="p-1 rounded-none liquid-glass border border-slate-700 border border-white/10 shadow-2xl max-w-md mx-auto my-12 reveal opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] [&.visible]:opacity-100 [&.visible]:translate-y-0">
              <div className="rounded-none bg-slate-950 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-none bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Login Admin Master</h2>
                    <p className="text-xs text-slate-400">Akses khusus Telemetri, Keuangan, & 9Router</p>
                  </div>
                </div>

                {loginError && (
                  <div className="mb-4 p-3.5 rounded-none bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-sans">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-4 p-3.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-sans">
                    <div className="w-2 h-2 rounded-none bg-emerald-400 animate-ping" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username / Email / Admin Token
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Token Admin Master..."
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-none text-xs text-white placeholder:text-slate-600 font-mono outline-none transition-all"
                        autoFocus
                      />
                      <KeyRound className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-none bg-cyan-400 text-slate-950 font-sans text-xs font-bold hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Admin Control</span>
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 mt-12 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 reveal opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] [&.visible]:opacity-100 [&.visible]:translate-y-0">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-none liquid-glass border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-xs">
                AI
              </div>
              <h3 className="font-bold text-white text-sm">apu.web.id</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pusat Berbagi Knowledge & Hub AI Indonesia — model benchmarking, prompt engineering & 9Router AI Gateway.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => switchTab('ai-hub')} className="hover:text-cyan-400 transition-colors">AI Hub & Direktori Model</button></li>
              <li><button onClick={() => switchTab('admin')} className="hover:text-cyan-400 transition-colors">Admin Control Panel</button></li>
            </ul>
          </div>
          <div className="flex flex-col justify-end items-start lg:items-end">
            <p className="text-[11px] text-slate-500 font-mono">© 2026 apu.web.id — Powered by Arch Linux & 9Router</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
