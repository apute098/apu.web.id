import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'APU Dashboard — Server Monitor, Finance & AI Hub',
  description: 'apu.web.id — Arch Linux server monitor, finance tracker, process manager & AI hub',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
