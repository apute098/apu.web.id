'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Bot, Network } from 'lucide-react';

// ============================================================
// Landing + Portfolio page untuk apu.web.id
// Pintu depan profesional; dashboard (ai-hub/admin) tetap di belakang.
// Entrance ke dashboard: set hash '#ai-hub' / '#admin'. page.tsx yang listen.
// ============================================================

// ==== ISI KONTEN DI SINI: ganti placeholder di bawah dengan data pribadi ====
const SITE = {
  nama: 'Regsi Wahyu Saputra', // ISI KONTEN DI SINI
  peran: 'Homelab Engineer & AI Tinkerer',
  tagline:
    'Membangun self-hosted infrastructure, benchmarking LLM, & crafting AI agents.',
};

const SKILLS = [
  // ISI KONTEN DI SINI: tambah/kurangi skill sesuai realita
  'Linux/Server',
  'AI/LLM',
  'Web Dev',
  'Network',
  'Automation',
  'Finance',
];

const PROJECTS = [
  {
    title: 'apu.web.id Portal',
    description:
      'Self-hosted web portal: server monitor, finance tracker, AI hub & dashboard terpadu.',
    githubLink: 'https://github.com/apute098',
    tag: 'Next.js 16',
    icon: Globe,
  },
  {
    title: 'Hermes AI Agent',
    description:
      'AI assistant agent (Nous Research) dengan durable session, memory & tool-use.',
    githubLink: 'https://github.com/apute098',
    tag: 'AI Agent',
    icon: Bot,
  },
  {
    title: '9Router AI Gateway',
    description:
      'AI gateway dengan routing provider & fallback untuk agent dan tools.',
    githubLink: 'https://github.com/apute098',
    tag: 'AI Gateway',
    icon: Network,
  },
];

const EXPERIENCE = [
  {
    role: 'Store Ops & Service Crew',
    company: 'Seblak Dower, Purwokerto',
    period: '2022 - sekarang',
    description: 'Operasional harian store, pelayanan pelanggan, dan koordinasi tim service.',
  },
  {
    role: 'Service Crew',
    company: 'RM Pempek Ny Kamto, Yogyakarta',
    period: '2019 - 2022',
    description: 'Pelayanan pelanggan dan operasional restoran.',
  },
  {
    role: 'Staf Operasional',
    company: 'PT Propack Kreasi Mandiri',
    period: '2018 - 2019',
    description: 'Mendukung operasional produksi dan logistik.',
  },
  {
    role: 'Homelab Engineer',
    company: 'Self-Hosted, apu.web.id',
    period: 'Aktif',
    description:
      'Merawat server Arch Linux x86_64, 9Router AI Gateway (localhost:20128), Hermes agent & layanan self-hosted lain.',
  },
];

export default function LandingPage() {
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Fetch status server asli untuk badge LIVE di hero (data real, bukan mock)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/system-status');
        if (res.ok) {
          const json = await res.json();
          setSystemStatus(json?.status === 'online' || json?.status === true ? 'online' : 'offline');
        } else {
          setSystemStatus('offline');
        }
      } catch {
        setSystemStatus('offline');
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Masuk dashboard: set hash, biar page.tsx (hashchange listener) yang ganti view.
  // Jangan pakai hash anchor landing (#about/#skills/...) untuk nyamain hash routing app.
  const enterDashboard = (tab: 'ai-hub' | 'admin') => {
    window.location.hash = tab === 'admin' ? '#admin' : '#ai-hub';
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans bg-slate-950 overflow-x-hidden">
      {/* Ambient orbs, tema app */}
      <div className="fixed top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/8 pointer-events-none z-0 animate-float-orb" />
      <div
        className="fixed bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/8 pointer-events-none z-0 animate-float-orb-reverse"
        style={{ animationDelay: '3s' }}
      />

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-white/10 py-4 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
          <button onClick={() => scrollTo('hero')} className="text-left focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none">
            <span className="text-xl font-bold tracking-tighter text-cyan-400">
              apu<span className="text-green-500">.web.id</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {[
              ['hero', 'Home'],
              ['about', 'Tentang'],
              ['skills', 'Skills'],
              ['projects', 'Project'],
              ['experience', 'Pengalaman'],
              ['contact', 'Kontak'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => enterDashboard('ai-hub')}
              className="px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-sans text-xs font-bold hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO (apu-hero) ===== */}
      <section
        id="hero"
        className="apu-hero relative min-h-[75vh] flex items-center justify-center overflow-hidden reveal"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 opacity-5">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0 0 L50 100 L100 0 L0 100 Z M20 30 L80 70 L40 90 L60 50 Z M10 60 L90 40 L50 10 L70 80 Z"
              fill="rgba(34, 211, 238, 0.03)"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs font-medium text-slate-400 mb-6">
            <span
              className={`w-2 h-2 rounded-full ${
                systemStatus === 'online' ? 'bg-green-500 animate-pulse' : systemStatus === 'offline' ? 'bg-red-400' : 'bg-slate-500'
              }`}
            />
            Server:{' '}
            <span
              className={`font-medium ${
                systemStatus === 'online' ? 'text-green-400' : systemStatus === 'offline' ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {systemStatus === 'online' ? 'LIVE' : systemStatus === 'offline' ? 'OFFLINE' : '···'}
            </span>
            <span className="text-slate-600">· Arch Linux x86_64</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            {SITE.nama}
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-cyan-400 mt-3">
              {SITE.peran}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {SITE.tagline}
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => enterDashboard('ai-hub')}
              className="gradient-border px-6 py-3 rounded-full bg-slate-950/60 text-cyan-400 font-sans text-xs font-bold hover:brightness-125 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              Buka Dashboard
            </button>
            <button
              onClick={() => scrollTo('projects')}
              className="px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-white font-sans text-xs font-bold hover:bg-slate-950 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              Lihat Project
            </button>
          </div>
        </div>
      </section>

      {/* ===== ABOUT (apu-about) ===== */}
      <section id="about" className="apu-about py-16 md:py-24 px-6 md:px-8 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Tentang Saya
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                        Homelab enthusiast. Bangun, monitor, dan otomasi infrastruktur self-hosted.
                      </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="group liquid-glass border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all lg:col-span-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Arch Linux Homelab
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Server Arch Linux x86_64 di apu.web.id: server monitor, finance tracker, AI hub & bot.
              </p>
            </article>

            <article className="group liquid-glass border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                9Router AI Gateway
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                AI request routing & provider failover di lapisan gateway (localhost:20128).
              </p>
            </article>

            <article className="group liquid-glass border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Hermes AI Agent
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                AI assistant agent (Nous Research) dengan durable session, memory & tool-use.
              </p>
            </article>
          </div>

          {/* SKILLS — digabung ke bagian tentang biar halaman pendek */}
          <div id="skills" className="apu-skills mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Skills</h2>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
                Core competencies: Linux, AI, Web & otomasi. {/* ISI KONTEN DI SINI */}
              </p>
            </div>
            {/* ISI KONTEN DI SINI: sesuaikan daftar skill di konstanta SKILLS atas file */}
          <div className="flex flex-wrap justify-center gap-4">
            {SKILLS.map((label, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-white/10 text-sm"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-cyan-400" />
                {label}
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS (apu-projects) ===== */}
      <section id="projects" className="apu-projects py-16 md:py-24 px-6 md:px-8 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Projects
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                        Selected self-hosted projects: portal web, AI agent, dan AI gateway.
                      </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, i) => (
              <article
                                key={i}
                                className="group liquid-glass border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all flex flex-col"
                              >
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                                  <project.icon className="w-6 h-6 text-cyan-400" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-300 text-sm mt-2 flex-1">{project.description}</p>
                <div className="mt-4 flex gap-2 items-center">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
                  >
                    GitHub
                  </a>
                  {project.tag && (
                    <span className="px-2 py-0.5 rounded-xs text-xs font-medium text-slate-500 bg-slate-950/50">
                      {project.tag}
                    </span>
                  )}
                </div>
              </article>
            ))}

            {/* CTA card tambah project */}
            <a
              href="https://github.com/apute098"
              target="_blank"
              rel="noopener noreferrer"
              className="group liquid-glass border border-dashed border-white/10 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center text-center min-h-[180px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <p className="text-slate-500 group-hover:text-cyan-400 transition-colors text-sm font-medium">
                Lihat semua di GitHub
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE (apu-experience) ===== */}
      <section id="experience" className="apu-experience py-16 md:py-24 px-6 md:px-8 bg-slate-950/50 reveal">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Pengalaman
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                        Riwayat kerja, pendidikan, dan proyek pribadi.
                      </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px liquid-glass md:-translate-x-px" />
            <div className="space-y-8">
              {EXPERIENCE.map((entry, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col md:flex-row md:items-start gap-4 pl-12 md:pl-0 ${
                    i % 2 === 0 ? 'md:pr-[calc(50%+2rem)]' : 'md:pl-[calc(50%+2rem)]'
                  }`}
                >
                  <span className="absolute left-2 md:left-1/2 top-1.5 w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#05050d] md:-translate-x-1/2" />
                  <div className="group liquid-glass border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {entry.role}
                    </h3>
                    <p className="text-slate-500 text-sm mb-1">{entry.company}</p>
                    <p className="text-slate-400 text-xs mb-3">{entry.period}</p>
                    <p className="text-slate-300 text-sm">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT (apu-contact) ===== */}
      <section id="contact" className="apu-contact py-16 md:py-24 px-6 md:px-8 reveal">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">Kontak</h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            Bot aktif 24/7. Konsultasi, kolaborasi, atau sekadar ngobrol.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <a
              href="https://wa.me/62877511509544"
              target="_blank"
              rel="noopener noreferrer"
              className="group liquid-glass border border-white/10 rounded-2xl p-5 hover:border-green-500/40 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">WhatsApp</p>
              <p className="text-slate-500 text-xs mt-1">0877-5115-09544</p>
              <div className="text-xs text-slate-500 mt-2">Bot aktif 24/7</div>
            </a>

            <a
              href="https://t.me/locomaniac_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="group liquid-glass border border-white/10 rounded-2xl p-5 hover:border-cyan-500/40 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">Telegram</p>
              <p className="text-slate-500 text-xs mt-1">@locomaniac_bot</p>
              <div className="text-xs text-slate-500 mt-2">Bot aktif 24/7</div>
            </a>

            <div className="group liquid-glass border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-full bg-slate-400/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 8l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
                </svg>
              </div>
              <p className="font-medium text-white">Email</p>
              <p className="text-slate-500 text-xs mt-1">you@example.com</p>
              {/* ISI KONTEN DI SINI: ganti you@example.com dengan email asli + jadikan <a href="mailto:..."> */}
              <div className="text-xs text-slate-500 mt-2">Balasan dalam 24 jam</div>
            </div>

            <a
              href="https://github.com/apute098"
              target="_blank"
              rel="noopener noreferrer"
              className="group liquid-glass border border-white/10 rounded-2xl p-5 hover:border-cyan-500/40 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-slate-400/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </div>
              <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">GitHub</p>
              <p className="text-slate-500 text-xs mt-1">@apute098</p>
              <div className="text-xs text-slate-500 mt-2">Source code & projects</div>
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER (apu-footer) ===== */}
      <footer className="apu-footer relative z-10 border-t border-white/10 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div>
              <button onClick={() => scrollTo('hero')} className="text-left mb-3">
                <span className="font-bold text-white text-sm">
                  apu<span className="text-cyan-400">.web.id</span>
                </span>
              </button>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pusat berbagi knowledge & hub AI: model benchmarking, prompt engineering & 9Router
                AI Gateway. Powered by Arch Linux.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => scrollTo('projects')} className="hover:text-cyan-400 transition-colors">
                    Projects
                  </button>
                </li>
                <li>
                  <button onClick={() => enterDashboard('ai-hub')} className="hover:text-cyan-400 transition-colors">
                    AI Hub & Direktori Model
                  </button>
                </li>
                <li>
                  <button onClick={() => enterDashboard('admin')} className="hover:text-cyan-400 transition-colors">
                    Admin Control Panel
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Kontak</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a
                    href="https://t.me/locomaniac_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Telegram @locomaniac_bot
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/62877511509544"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    WhatsApp 0877-5115-09544
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/apute098"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    GitHub @apute098
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
            © 2026 apu.web.id. Powered by Arch Linux & 9Router
          </div>
        </div>
      </footer>
    </div>
  );
}