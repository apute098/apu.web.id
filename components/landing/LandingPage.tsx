'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

// ============================================================
// Landing apu.web.id — "BOOT SEQUENCE"
// Halaman booting seperti Arch: log systemd mengetik di hero,
// fastfetch hidup sebagai signature, konten muncul setelah
// "login". Semua data dari /api/v1/system-status — mesin asli.
// Entrance dashboard: hash '#ai-hub' / '#admin', page.tsx listen.
// ============================================================

const SITE = {
  nama: 'Regsi Wahyu Saputra',
  peran: 'Homelab Engineer & AI Tinkerer',
  tagline: 'Membangun self-hosted infrastructure, benchmarking LLM, & crafting AI agents.',
};

const SKILLS = ['Linux/Server', 'AI/LLM', 'Web Dev', 'Network', 'Automation', 'Finance'];

const PROJECTS = [
  {
    title: 'apu.web.id Portal',
    description: 'Portal self-hosted: server monitor, finance tracker, AI hub & dashboard terpadu.',
    githubLink: 'https://github.com/apute098',
    tag: 'Next.js 16',
  },
  {
    title: 'Hermes AI Agent',
    description: 'AI assistant agent (Nous Research) dengan durable session, memory & tool-use.',
    githubLink: 'https://github.com/apute098',
    tag: 'AI Agent',
  },
  {
    title: '9Router AI Gateway',
    description: 'AI gateway dengan routing provider & fallback untuk agent dan tools.',
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

type SystemStatus = {
  status?: string | boolean;
  os?: string;
  uptime?: string;
  cpu?: { usagePercent?: number; cores?: number; model?: string };
  ram?: { usedGB?: number; totalGB?: number; usagePercent?: number };
  hdd?: { usedTB?: number; totalTB?: number; usagePercent?: number };
  temperature?: { currentC?: number | null; status?: string };
  loadAverage?: number[];
  services?: Record<string, string>;
};

const ARCH_LOGO = [
  '       /\\',
  '      /  \\',
  '     /\\   \\',
  '    /  __  \\',
  '   /  (  )  \\',
  '  / __|  |__-\\',
  ' /.\\u00b7        .\\',
].join('\n');

export default function LandingPage() {
  const [sys, setSys] = useState<SystemStatus | null>(null);
  const [bootDone, setBootDone] = useState(false);
  const [bootLines, setBootLines] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const bootRef = useRef<HTMLDivElement>(null);

  // Baris boot journal — nilai nyata disuntikkan saat fetch selesai
  const [liveLines, setLiveLines] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    // Boot tidak boleh menunggu fetch: timeout 3s → fallback offline lines
    const timeout = setTimeout(() => controller.abort(), 3000);
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/system-status', { signal: controller.signal });
        const json: SystemStatus = await res.json();
        if (!alive) return;
        setSys(json);
        const svc = Object.values(json.services ?? {});
        const svcActive = svc.filter((s) => s.startsWith('active')).length;
        setLiveLines([
          `[ OK ] Finished Arch Linux x86_64 (kernel ${json.os?.match(/Linux\s+([^\s)]+)/)?.[1] ?? 'zen'}).`,
          `[ OK ] Reached target System Time Synchronized.`,
          `[ OK ] Started 9Router AI Gateway on :20128.`,
          `[ OK ] Mounted /dev/sda2 ext4 — WAL mode active.`,
          `[ OK ] Started hermes-gateway.service — agent online.`,
          `[ OK ] Started ${svcActive}/${svc.length} user units — all systems nominal.`,
        ]);
      } catch {
        if (!alive || controller.signal.aborted) return;
        setLiveLines(['[ WARN ] telemetri tidak terjangkau — mode offline.']);
      } finally {
        clearTimeout(timeout);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    // Hard cap: boot selesai maksimal 2.5s walau fetch masih pending
    const hardCap = setTimeout(() => alive && setSkipped(true), 2500);
    return () => {
      alive = false;
      clearInterval(interval);
      clearTimeout(hardCap);
    };
  }, []);

  // Boot sequence: ketik baris demi baris, lalu tampilkan landing penuh
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || skipped) {
      setBootDone(true);
      return;
    }
    const total = liveLines.length;
    if (total === 0 || bootDone) return;
    if (bootLines >= total) {
      const t = setTimeout(() => setBootDone(true), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBootLines((n) => n + 1), bootLines === 0 ? 200 : 200);
    return () => clearTimeout(t);
  }, [liveLines.length, bootLines, bootDone, skipped]);

  // Skip boot dengan klik/scroll/key — boot tidak pernah memblokir lebih dari ~2s
  useEffect(() => {
    if (bootDone) return;
    const skip = () => setSkipped(true);
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
    };
  }, [bootDone]);

  useEffect(() => {
    if (skipped) setBootDone(true);
  }, [skipped]);

  // Momen orkestrasi: specRows fastfetch muncul berurutan (stagger 30ms)
  // setelah boot selesai — data "booting in", bukan sekadar tampil.
  // Query dokumen: readout mobile & panel desktop sama-sama ikut animasi.
  useEffect(() => {
    if (!bootDone) return;
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-spec-row]'));
    if (!rows.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      rows,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' },
    );
    return () => {
      gsap.killTweensOf(rows);
      gsap.set(rows, { clearProps: 'all' });
    };
  }, [bootDone]);

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

  // Baris fastfetch — dipakai panel desktop & readout inline mobile
  const specRows: [string, string][] = [
    ['os', 'Arch Linux x86_64'],
    ['kernel', sys?.os?.match(/Linux\s+([^\s)]+)/)?.[1] ?? 'linux-zen'],
    ['uptime', sys?.uptime ?? '—'],
    [
      'cpu',
      sys?.cpu
        ? `${(sys.cpu.model ?? '').replace(/^Intel\(R\)\s*Core\(TM\)\s*/, '').replace(/\s*CPU.*$/, '')} (${sys.cpu.cores}c) · ${sys.cpu.usagePercent}%`
        : 'Intel i3-7100 (4c)',
    ],
    ['ram', sys?.ram ? `${sys.ram.usedGB}/${sys.ram.totalGB}G (${sys.ram.usagePercent}%)` : '—'],
    [
      'disk',
      sys?.hdd
        ? `${Math.round((sys.hdd.usedTB ?? 0) * 1000)}G/${Math.round((sys.hdd.totalTB ?? 0) * 1000)}G (${sys.hdd.usagePercent}%)`
        : '—',
    ],
    ['temp', typeof tempC === 'number' ? `${tempC}°C${hot ? ' ⚠' : ''}` : '—'],
    ['load', loads.length ? loads.map((l) => l.toFixed(2)).join(' ') : '—'],
    ['svc', svcTotal ? `${svcActive}/${svcTotal} unit aktif` : '—'],
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#05050d] text-[#e8eaf2] apu-root overflow-x-hidden">
      {/* ===== BOOT OVERLAY ===== */}
      {!bootDone && (
        <div
          ref={bootRef}
          className="fixed inset-0 z-[100] bg-[#05050d] flex items-center justify-center px-6"
          onClick={() => setSkipped(true)}
          role="presentation"
        >
          <div className="w-full max-w-xl font-mono text-xs sm:text-sm leading-relaxed">
            <p className="text-white mb-3">APU LINUX — booting…</p>
            {liveLines.slice(0, bootLines).map((line, i) => (
              <p key={i} className={line.startsWith('[ OK') ? 'apu-boot-ok' : 'apu-boot-warn'}>
                {line}
              </p>
            ))}
            <span className="apu-cursor" aria-hidden="true" />
            <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-[#585f75]">
              klik untuk melewati
            </p>
          </div>
        </div>
      )}

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#05050d]/92 backdrop-blur-sm border-b border-white/[0.07]">
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
      <section id="hero" className="pt-32 pb-20 md:pt-40 md:pb-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-10 items-start">
          {/* Kiri: identitas — login prompt setelah boot */}
          <div>
            <p className={`font-mono text-xs text-[#f97316] mb-4 tracking-wider ${bootDone ? 'apu-in apu-in-1' : 'opacity-0'}`}>
              $ whoami
            </p>

            <h1 className={`font-display font-black leading-[0.92] text-[clamp(2.6rem,7vw,5rem)] text-white uppercase ${bootDone ? 'apu-in apu-in-1' : 'opacity-0'}`}>
              Regsi
              <br />
              Wahyu Saputra
            </h1>

            <h2 className={`mt-5 text-lg sm:text-xl leading-snug text-[#00f5ff] max-w-md ${bootDone ? 'apu-in apu-in-2' : 'opacity-0'}`}>
              Setiap angka di panel ini dibaca langsung dari mesin saya — bukan demo.
            </h2>

            <p className={`mt-4 font-mono text-sm text-[#8a90a5] ${bootDone ? 'apu-in apu-in-2' : 'opacity-0'}`}>
              archlinux login:{' '}
              <span className="text-[#00f5ff] font-semibold">{SITE.peran.toLowerCase()}</span>
              <span className="text-white/60"> — password:</span>{' '}
              <span className="tracking-tighter">********</span>
            </p>

            <p className={`mt-6 text-lg text-[#aab0c4] max-w-md leading-relaxed ${bootDone ? 'apu-in apu-in-3' : 'opacity-0'}`}>
              {SITE.tagline}
            </p>

            {/* Mobile: readout neofetch inline — satu output terminal, bukan dua blok */}
            <dl className={`md:hidden mt-7 font-mono text-xs leading-relaxed border-t border-white/[0.07] pt-5 ${bootDone ? 'apu-in apu-in-3' : 'opacity-0'}`}>
              {specRows.map(([k, v]) => (
                <div key={k} data-spec-row className="flex gap-3">
                  <dt className={`w-11 shrink-0 ${k === 'temp' && hot ? 'text-[#f97316]' : 'text-[#00f5ff]'}`}>{k}</dt>
                  <dd className="text-[#c6cbdd] truncate">{v}</dd>
                </div>
              ))}
            </dl>

            <div className={`mt-9 flex flex-wrap gap-3 ${bootDone ? 'apu-in apu-in-4' : 'opacity-0'}`}>
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

          {/* Kanan: SIGNATURE — fastfetch hidup (desktop saja, mobile inline di kiri) */}
          <aside
            className={`hidden md:block apu-panel rounded-lg border border-white/10 bg-[#0b0b16] ${bootDone ? 'apu-in apu-in-2' : 'opacity-0'}`}
            aria-label="Status server langsung"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <span className="font-mono text-[11px] text-[#8a90a5]">regsi@archlinux: ~/welcome</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                  online
                    ? 'text-[#00f5ff] border-[#00f5ff]/30 bg-[#00f5ff]/5'
                    : 'text-[#f97316] border-[#f97316]/30 bg-[#f97316]/5'
                }`}
              >
                {online ? '● live' : sys ? '● degraded' : '···'}
              </span>
            </div>

            <div className="p-4 sm:p-5 flex gap-4 sm:gap-5">
              <pre className="hidden sm:block font-mono text-[9px] sm:text-[10px] leading-[1.35] text-[#00f5ff] shrink-0 select-none" aria-hidden="true">{ARCH_LOGO}</pre>

              <dl className="font-mono text-[11px] sm:text-xs leading-relaxed min-w-0 flex-1">
                {specRows.map(([k, v]) => (
                  <div key={k} data-spec-row className="flex gap-3">
                    <dt className={`w-11 shrink-0 ${k === 'temp' && hot ? 'text-[#f97316]' : 'text-[#00f5ff]'}`}>{k}</dt>
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
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 reveal">
          <div>
            <p className="font-mono text-xs text-[#f97316] mb-4">$ cat tentang.txt</p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white leading-tight">
              Satu mesin,
              <br />
              semua layanan.
            </h2>
            <p className="mt-5 text-[#aab0c4] leading-relaxed max-w-sm">
              Homelab enthusiast. Bangun, monitor, dan otomasi infrastruktur self-hosted — dari
              telemetri kernel sampai gateway AI.
            </p>
          </div>

          <dl className="rounded-lg border border-white/10 divide-y divide-white/[0.07] self-start bg-[#0b0b16]">
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

      {/* ===== PROJECT ===== */}
      <section id="projects" className="py-16 md:py-24 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="font-mono text-xs text-[#f97316] mb-4">$ systemctl list-units --project</p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white">
              Yang dibangun di atasnya.
            </h2>
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

      {/* ===== PENGALAMAN — journalctl ===== */}
      <section id="experience" className="py-16 md:py-24 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-[#f97316] mb-4">$ journalctl --riwayat</p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl text-white mb-10">
            Riwayat.
          </h2>

          <ol className="border-t border-white/10">
            {EXPERIENCE.map((entry, i) => {
              const active = entry.period === 'aktif';
              return (
              <li
                key={i}
                className={`grid md:grid-cols-[10rem_1fr] gap-x-8 gap-y-1 py-5 border-b border-white/10 group ${
                  active ? 'border-l-2 border-l-[#f97316] pl-4 md:pl-6 bg-gradient-to-r from-[#f97316]/[0.06] to-transparent' : ''
                }`}
              >
                <span className={`font-mono text-xs pt-1 transition-colors ${active ? 'text-[#f97316] font-semibold' : 'text-[#585f75] group-hover:text-[#00f5ff]'}`}>
                  [{entry.period}]
                </span>
                <div>
                  <h3 className="font-semibold text-white">
                    {entry.role}
                    <span className="text-[#8a90a5] font-normal"> — {entry.company}</span>
                  </h3>
                  <p className="text-sm text-[#aab0c4] mt-1 leading-relaxed max-w-2xl">{entry.description}</p>
                </div>
              </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===== KONTAK ===== */}
      <section id="contact" className="py-16 md:py-28 px-5 md:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-[#f97316] mb-4">$ ping --kontak</p>
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
          <span className="font-mono text-[11px] text-[#585f75]">
            up {sys?.uptime ?? '—'} · {svcTotal ? `${svcActive}/${svcTotal} svc` : ''}
          </span>
        </div>
      </footer>
    </div>
  );
}
