import type { Metadata, Viewport } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

const siteUrl = 'https://apu.web.id';

export const viewport: Viewport = {
  themeColor: '#030308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'apu.web.id | Server Control & Monitoring Station',
  description:
    'Dedicated Server Control, Real-Time Hardware Telemetry, Systemd Services Hub, Process Manager & AI Ecosystem Watchdog for Arch Linux node.',
  keywords: ['apu.web.id', 'server monitor', 'arch linux', 'systemd controller', '9router', 'process manager', 'homelab', 'pwa'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'APU Control',
  },
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning className="bg-[#030308] text-slate-100 antialiased selection:bg-cyan-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
