import type { Metadata } from 'next';
import { ArrowDown } from 'lucide-react';
import { WorkGrid } from '@/components/WorkGrid';
import { SpotlightPanel } from '@/components/SpotlightPanel';
import { GlassCard } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apu — Systems & Software Engineer',
  description:
    'Etalase Apu: portal dan master gateway homelab, bot, gateway multi-model lokal, dan otomasi Android. Purwokerto, Indonesia.',
  openGraph: {
    title: 'Apu — Systems & Software Engineer',
    description:
      'Etalase Apu: portal dan master gateway homelab, bot, gateway multi-model lokal, dan otomasi Android. Purwokerto, Indonesia.',
    url: 'https://apu.web.id',
    type: 'website',
    siteName: 'apu.web.id',
  },
};

const LAB_URL = 'https://regsi.my.id';
const GITHUB_URL = 'https://github.com/apute098';

function LabLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={LAB_URL}
      className={`rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-cyan-400 ${className}`}
      aria-label="Buka Lab di regsi.my.id (tab baru)"
    >
      ← Lab
    </a>
  );
}

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-6">
      {/* Nav — sticky liquid-glass pill */}
      <header className="sticky top-3 z-50 mt-3">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 backdrop-blur-md"
        >
          <a
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            Apu<span className="text-cyan-300">.</span>
          </a>
          <div className="flex items-center gap-1">
            <a
              href="#karya"
              className="hidden rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-cyan-400 sm:block"
            >
              Karya
            </a>
            <LabLink />
            <a
              href="/admin"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-400 active:scale-[0.98]"
            >
              Admin
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-1 flex-col justify-center py-16 sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.14),transparent_55%),radial-gradient(ellipse_at_80%_100%,rgba(16,185,129,0.08),transparent_50%)]"
          />
          <SpotlightPanel className="rounded-3xl">
            <div className="px-2 py-6 sm:px-6">
              <p className="hud-chip inline-block text-cyan-300">Purwokerto, Indonesia</p>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl">
                Apu
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Systems &amp; Software Engineer — membangun portal homelab, gateway AI lokal,
                dan otomasi yang benar-benar dipakai sehari-hari.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#karya"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-cyan-400 active:scale-[0.98]"
                >
                  Lihat karya
                  <ArrowDown aria-hidden="true" className="size-4" />
                </a>
                <LabLink className="border border-white/10 px-5 py-2.5" />
              </div>
            </div>
          </SpotlightPanel>
        </section>

        {/* Work grid */}
        <section id="karya" className="scroll-mt-24 pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-100">Karya</h2>
            <span className="hud-chip text-slate-400">Etalase</span>
          </div>
          <WorkGrid />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <GlassCard variant="subtle" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Regsi Wahyu Saputra (Apu)</span>
            <span className="mx-2 text-slate-500">·</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <LabLink />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="GitHub apute098 (tab baru)"
            >
              GitHub ↗
            </a>
          </div>
        </GlassCard>
      </footer>
    </div>
  );
}
