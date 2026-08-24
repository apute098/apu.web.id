import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

const siteUrl = 'https://apu.web.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'apu.web.id | Server Control & Monitoring Station',
  description:
    'Dedicated Server Control, Real-Time Hardware Telemetry, Systemd Services Hub, Process Manager & AI Ecosystem Watchdog for Arch Linux node.',
  keywords: ['apu.web.id', 'server monitor', 'arch linux', 'systemd controller', '9router', 'process manager', 'homelab'],
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'apu.web.id',
    title: 'apu.web.id | Server Control & Monitoring Station',
    description:
      'Dedicated Server Control, Real-Time Hardware Telemetry, Systemd Services Hub, Process Manager & AI Ecosystem Watchdog.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'apu.web.id — Server Control Station' }],
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'apu.web.id | Server Control & Monitoring Station',
    description:
      'Dedicated Server Control, Real-Time Hardware Telemetry, Systemd Services Hub, Process Manager & AI Ecosystem Watchdog.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning className="bg-[#05050d] text-slate-100 antialiased selection:bg-cyan-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
