import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'apu.web.id — Homelab Engineer & AI Tinkerer',
  description:
    'apu.web.id — Arch Linux homelab, AI gateway (9Router), Hermes agent, server monitor & finance tracker. Portfolio + dashboard live.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
