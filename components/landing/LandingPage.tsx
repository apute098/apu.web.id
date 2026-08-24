'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

// ============================================================
// Landing + Portfolio apu.web.id — "System Readout"
// Signature: panel fastfetch hidup, data langsung dari
// /api/v1/system-status (mesin asli, bukan dekorasi).
// Entrance dashboard: hash '#ai-hub' / '#admin', page.tsx listen.
// ============================================================

const SITE = {
  nama: 'Regsi Wahyu Saputra',
  peran: 'Homelab Engineer & AI Tinkerer',
  tagline: 'Membangun self-hosted infrastructure, benchmarking LLM, & crafting AI agents.',
};

const SKILLS = [
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
      'Portal self-hosted: server monitor, finance tracker, AI hub & dashboard terpadu.',
    githubLink: 'https://github.com/apute098',
    tag: 'Next.js 16',
  },
  {
    title: 'Hermes AI Agent',
    description:
      'AI assistant agent (Nous Research) dengan durable session, memory & tool-use.',
    githubLink: 'https://github.com/apute098',
    tag: 'AI Agent',
  },
  {
    title: '9Router AI Gateway',
    description:
      'AI gateway dengan routing provider & fallback untuk agent dan tools.',
    githubLink: 'https://github.com/apute098',
    tag: 'AI Gateway',
  },
];

const EXPERIENCE = [
  {
    period: '2022 — kini',
    role: 'Store Ops & Service Crew',
    company: 'Seblak Dower, Purwokerto',
    description: 'Operasional harian store, pelayanan pelanggan, dan koordinasi tim service.',
  },
  {
    period: '2019 — 2022',
    role: 'Service Crew',
    company: 'RM Pempek Ny Kamto, Yogyakarta',
    description: 'Pelayanan pelanggan dan operasional restoran.',
  },
  {
    period: '2018 — 2019',
    role: 'Staf Operasional',
    company: 'PT Propack Kreasi Mandiri',
    description: 'Mendukung operasional produksi dan logistik.',
  },
  {
    period: 'aktif',
    role: 'Homelab Engineer',
    company: 'Self-Hosted, apu.web.id',
    description:
      'Merawat server Arch Linux x86_64, 9Router AI Gateway (localhost:20128), Hermes agent & layanan self-hosted lain.',
  },
];

// Bentuk minimum payload /api/v1/system-status yang dipakai panel
type SystemStatus = {
  status?: string | boolean;
  os?: string;
  uptime?: string;
  cpu?: { usagePercent?: number; cores?: number; model?: string };
  ram?: { usedGB?: number; totalGB?: number; usagePercent?: number };
  hdd?: { usedTB?: number; totalTB?: number; freeTB?: number; usagePercent?: number };
  temperature?: { currentC?: number | null; status?: string };
  loadAverage?: number[];
  services?: Record<string, string>;
};

function kernelFromOs(os?: string): string {
  const m = os?.match(/Linux\s+([^\s)]+)/);
  return m ? m[1] : 'linux';
}

export default function LandingPage() {
  const [sys, setSys] = useState<SystemStatus | null>(null);

  // Telemetri nyata untuk panel fastfetch (poll 30s)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/system-status');
        const json = await res.json();
        setSys(json);
      } catch {
        /* biarkan panel memakai nilai terakhir */
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const enterDashboard = (tab: 'ai-hub' | 'admin') => {
    window.location.hash = tab === 'admin' ? '#admin' : '#ai-hub';
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const online = sys ? !!(sys.status === 'online' || sys.status === true) : false;
  const services = sys?.services ?? {};
  const svcTotal = Object.keys(services).length;
  const svcActive = Object.values(services).filter((s) => s.startsWith('active')).length;
  const tempC = sys?.temperature?.currentC;
  const hot = typeof tempC === 'number' && (tempC > 75 || sys?.temperature?.status === 'warning');
  const loads = sys?.loadAverage ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#05050d] text-[#e8eaf2] apu-root overflow-x-hidden">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#05050d]/90 backdrop-blur-sm border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => scrollTo('hero')}
            className="font-mono text-sm tracking-tight text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70 rounded px-1"
          >
            <span className="text-white">apu</span>
            <span className="text-[#f97316]">.web.id</span>
          </button>

          <div className="hidden md:flex items-center gap-7">
            {[
              ['about', 'tentang'],
              ['skills', 'skills'],
              ['projects', 'project'],
              ['experience', 'log'],
              ['contact', 'kontak'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-mono text-xs text-[#8a90a5] hover:text-[#00f5ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70 rounded px-1"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => enterDashboard('ai-hub')}
            className="px-4 py-2 min-h-[36px] rounded-md bg-[#00f5ff] text-[#05050d] text-xs font-bold hover:bg-[#5cf7ff] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="hero" className="pt-32 pb-20 md:pt-40 md:pb-28 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.15fr_1fr] gap-12 md:gap-10 items-center">
          {/* Kiri: identitas */}
          <div>
            <p className="apu-in apu-in-1 font-mono text-xs text-[#8a90a5] mb-6 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-[#00f5ff]' : 'bg-[#f97316]'}`} />
              {online ? 'arch linux · online' : sys ? 'arch linux · degraded' : 'arch linux'}
            </p>

            <h1 className="apu-in apu-in-2 font-display font-extrabold tracking-[-0.03em] leading-[0.95] text-[clamp(2.75rem,8vw,5.25rem)] text-white">
              Regsi Wahyu
              <br />
              Saputra
            </h1>

            <p className="apu-in apu-in-3 mt-6 text-lg text-[#aab0c4] max-w-md leading-relaxed">
              {SITE.tagline}
              <span className="apu-cursor ml-1 select-none" aria-hidden="true" />
            </p>

            <div className="apu-in apu-in-4 mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => enterDashboard('ai-hub')}
                className="px-5 py-3 min-h-[44px] rounded-md bg-[#00f5ff] text-[#05050d] text-sm font-bold hover:bg-[#5cf7ff] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
              >
                Buka Dashboard
              </button>
              <button
                onClick={() => scrollTo('projects')}
                className="px-5 py-3 min-h-[44px] rounded-md border border-white/15 text-sm font-semibold text-white hover:border-[#00f5ff]/60 hover:text-[#00f5ff] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
              >
                Lihat Project
              </button>
            </div>
          </div>

          {/* Kanan: SIGNATURE — panel fastfetch hidup */}
          <aside className="apu-in apu-in-3 apu-panel rounded-lg border border-white/10 bg-[#0b0b16]" aria-label="Status server langsung">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <span className="font-mono text-[11px] text-[#8a90a5]">regsi@archlinux</span>
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <i className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <i className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-[#00f5ff]' : 'bg-[#f97316]'}`} />
              </span>
            </div>

            <div className="p-4 sm:p-5 flex gap-4 sm:gap-5">
              {/* Logo Arch ASCII */}
              <pre className="hidden xs:block sm:block font-mono text-[9px] sm:text-[10px] leading-[1.35] text-[#00f5ff] shrink-0 select-none" aria-hidden="true">{`       /\\
      /  \\
     /\\   \\
    /  __  \\
   /  (  )  \\
  / __|  |__ \\\\\\
 /.\\\`        \\.\\\``}</pre>

              {/* Readout */}
              <dl className="font-mono text-[11px] sm:text-xs leading-relaxed min-w-0 flex-1">
                {[
                  ['os', 'Arch Linux x86_64'],
                  ['kernel', kernelFromOs(sys?.os)],
                  ['uptime', sys?.uptime ?? '—'],
                  [
                    'cpu',
                    sys?.cpu
                      ? `${(sys.cpu.model ?? '').replace(/^Intel\(R\)\s*Core\(TM\)\s*/, 'i3 ').replace(/\s*CPU.*$/, '')} (${sys.cpu.cores}) ${sys.cpu.usagePercent}%`
                      : '—',
                  ],
                  [
                    'ram',
                    sys?.ram ? `${sys.ram.usedGB}G / ${sys.ram.totalGB}G (${sys.ram.usagePercent}%)` : '—',
                  ],
                  [
                    'disk',
                    sys?.hdd
                      ? `${Math.round((sys.hdd.usedTB ?? 0) * 1000)}G / ${Math.round((sys.hdd.totalTB ?? 0) * 1000)}G (${sys.hdd.usagePercent}%)`
                      : '—',
                  ],
                  [
                    'temp',
                    typeof tempC === 'number' ? `${tempC}°C${hot ? ' ⚠' : ''}` : '—',
                  ],
                  ['load', loads.length ? loads.join(' ') : '—'],
                  ['svc', svcTotal ? `${svcActive}/${svcTotal} aktif` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className={`w-12 shrink-0 ${k === 'temp' && hot ? 'text-[#f97316]' : 'text-[#00f5ff]'}`}>{k}</dt>
                    <dd className="text-[#c6cbdd] truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== TENTANG + SKILLS ===== */}
      <section id="about" className="py-16 md:py-24 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16">
          <div>
            <p className="font-mono text-xs text-[#f97316] mb-4">## tentang</p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white leading-tight">
              Satu mesin,
              <br />
              semua layanan.
            </h2>
            <p className="mt-5 text-[#aab0c4] leading-relaxed max-w-sm">
              Homelab enthusiast. Bangun, monitor, dan otomasi infrastruktur self-hosted —
              dari telemetri kernel sampai gateway AI.
            </p>
          </div>

          {/* Lembar spesifikasi */}
          <dl className="rounded-lg border border-white/10 divide-y divide-white/[0.07] self-start">
            {[
              ['Lokasi', 'Purwokerto, Indonesia'],
              ['Fokus', 'Self-hosted infra, LLM tooling, otomasi'],
              ['Stack', 'Next.js 16 · Bun · SQLite WAL · systemd'],
              ['Rig', 'i3-7100 · 8 GB RAM · 500 GB HDD · Arch Linux'],
            ].map(([k, v]) => (
              <div key={k} className="px-5 py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#8a90a5] w-20 shrink-0">{k}</dt>
                <dd className="text-sm text-[#e8eaf2]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Skills strip */}
        <div id="skills" className="max-w-6xl mx-auto mt-12 scroll-mt-24">
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {SKILLS.map((label) => (
              <li
                key={label}
                className="font-mono text-xs px-3.5 py-2 rounded-md border border-white/10 bg-[#0b0b16] text-[#c6cbdd]"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== PROJECT (baris indeks, bukan grid kartu) ===== */}
      <section id="projects" className="py-16 md:py-24 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-xs text-[#f97316] mb-4">## project</p>
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white">
                Yang dibangun di atasnya.
              </h2>
            </div>
          </div>

          <ul className="border-t border-white/10">
            {PROJECTS.map((project) => (
              <li key={project.title} className="border-b border-white/10">
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,20rem)_1fr_auto_auto] gap-x-6 gap-y-1 items-center py-5 md:py-6 px-2 -mx-2 rounded-md hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
                >
                  <h3 className="font-semibold text-white group-hover:text-[#00f5ff] transition-colors">
                    {project.title}
                  </h3>
                  <p className="col-span-2 md:col-span-1 text-sm text-[#8a90a5] leading-relaxed">
                    {project.description}
                  </p>
                  <span className="hidden md:inline-block font-mono text-[11px] text-[#8a90a5] border border-white/10 rounded px-2 py-1">
                    {project.tag}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8a90a5] group-hover:text-[#00f5ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </li>
            ))}
            <li className="border-b border-white/10">
              <a
                href="https://github.com/apute098"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-5 md:py-6 px-2 -mx-2 rounded-md hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
              >
                <span className="font-mono text-sm text-[#8a90a5] group-hover:text-white transition-colors">
                  $ ls ~/projects --all
                </span>
                <span className="font-mono text-xs text-[#00f5ff] group-hover:underline underline-offset-4">
                  github.com/apute098
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== PENGALAMAN — log kronologis ===== */}
      <section id="experience" className="py-16 md:py-24 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-[#f97316] mb-4">## log</p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white mb-10">
            Riwayat.
          </h2>

          <ol className="space-y-0 border-t border-white/10">
            {EXPERIENCE.map((entry, i) => (
              <li key={i} className="grid md:grid-cols-[10rem_1fr] gap-x-8 gap-y-1 py-5 border-b border-white/10">
                <span className="font-mono text-xs text-[#8a90a5] pt-1">[{entry.period}]</span>
                <div>
                  <h3 className="font-semibold text-white">
                    {entry.role}
                    <span className="text-[#8a90a5] font-normal"> — {entry.company}</span>
                  </h3>
                  <p className="text-sm text-[#aab0c4] mt-1 leading-relaxed max-w-2xl">{entry.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== KONTAK ===== */}
      <section id="contact" className="py-16 md:py-28 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-[#f97316] mb-4">## kontak</p>
          <a
            href="mailto:contact@apu.web.id"
            className="group inline-block font-display font-extrabold tracking-tight text-[clamp(1.6rem,5vw,3.25rem)] text-white hover:text-[#00f5ff] transition-colors break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70 rounded"
          >
            contact@apu.web.id
            <span className="apu-cursor ml-2 select-none align-baseline" aria-hidden="true" />
          </a>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'WhatsApp', value: '0877-5115-09544', href: 'https://wa.me/62877511509544', note: 'bot aktif 24/7' },
              { label: 'Telegram', value: '@locomaniac_bot', href: 'https://t.me/locomaniac_bot', note: 'bot aktif 24/7' },
              { label: 'Email', value: 'contact@apu.web.id', href: 'mailto:contact@apu.web.id', note: 'balasan < 24 jam' },
              { label: 'GitHub', value: '@apute098', href: 'https://github.com/apute098', note: 'source code' },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 bg-[#0b0b16] p-4 hover:border-[#00f5ff]/50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/70"
              >
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#8a90a5] group-hover:text-[#00f5ff] transition-colors">
                  {c.label}
                </p>
                <p className="font-mono text-xs text-[#e8eaf2] mt-2 truncate">{c.value}</p>
                <p className="text-[11px] text-[#8a90a5] mt-1">{c.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto border-t border-white/[0.07] px-5 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="font-mono text-xs text-[#8a90a5]">
            © 2026 apu<span className="text-[#f97316]">.web.id</span> — arch linux · 9router
          </span>
          <span className="font-mono text-[11px] text-[#585f75]">uptime {sys?.uptime ?? '—'} · {svcTotal ? `${svcActive}/${svcTotal} svc` : ''}</span>
        </div>
      </footer>
    </div>
  );
}
