import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { SpotlightPanel } from '@/components/SpotlightPanel';

interface Work {
  title: string;
  blurb: string;
  tags: string[];
  href?: string;
}

/**
 * Static, real project list for the apex landing (Etalase).
 * Kept here on purpose: no API fetch, no mock data — these are shipped projects.
 */
const WORKS: Work[] = [
  {
    title: 'apu.web.id',
    blurb: 'Portal & master gateway homelab — telemetri, kontrol systemd, dan AI ecosystem watchdog.',
    tags: ['Next.js 16', 'Telemetry', 'systemd'],
    href: 'https://apu.web.id',
  },
  {
    title: 'regsi.my.id',
    blurb: 'Blog dan lab teknik — tulisan rekayasa perangkat lunak serta eksperimen infrastruktur.',
    tags: ['Astro 5', 'Cloudflare'],
    href: 'https://regsi.my.id',
  },
  {
    title: 'apute098/OpenBot',
    blurb: 'Open-source AI coworkers with a computer of their own.',
    tags: ['Open Source', 'AI Agents'],
    href: 'https://github.com/apute098/OpenBot',
  },
  {
    title: 'apute098/bot-wa-mulyono',
    blurb: 'WhatsApp bot untuk otomasi percakapan harian.',
    tags: ['WhatsApp', 'Bot'],
    href: 'https://github.com/apute098/bot-wa-mulyono',
  },
  {
    title: '9Router',
    blurb: 'Gateway multi-model lokal — satu endpoint OpenAI-compatible untuk banyak provider.',
    tags: ['Local Gateway', 'LLM'],
  },
  {
    title: 'ARTEMIS',
    blurb: 'Natural-language Android automation — perintah bahasa jadi aksi di perangkat.',
    tags: ['Android', 'Automation'],
  },
];

export function WorkGrid() {
  return (
    <ul
      role="list"
      aria-label="Daftar karya"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {WORKS.map((work) => {
        const card = (
          <GlassCard interactive className="h-full p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-100">{work.title}</h3>
              {work.href && (
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-cyan-300"
                />
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{work.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <span key={tag} className="hud-chip text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>
        );

        return (
          <li key={work.title} className="h-full">
            <SpotlightPanel className="h-full rounded-2xl">
              {work.href ? (
                <a
                  href={work.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  aria-label={`${work.title} — buka di tab baru`}
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </SpotlightPanel>
          </li>
        );
      })}
    </ul>
  );
}
