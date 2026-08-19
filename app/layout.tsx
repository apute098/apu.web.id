import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const dynamic = 'force-dynamic';

const siteUrl = 'https://apu.web.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'apu.web.id | Homelab Engineer & AI Tinkerer',
  description:
    'apu.web.id: Arch Linux homelab, AI gateway (9Router), Hermes agent, server monitor & finance tracker. Portfolio + dashboard live.',
  keywords: ['apu.web.id', 'homelab', 'arch linux', '9router', 'hermes', 'ai gateway', 'self-hosted'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'apu.web.id',
    title: 'apu.web.id | Homelab Engineer & AI Tinkerer',
    description:
      'Arch Linux homelab, AI gateway (9Router), Hermes agent, server monitor & finance tracker.',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary',
    title: 'apu.web.id | Homelab Engineer & AI Tinkerer',
    description:
      'Arch Linux homelab, AI gateway (9Router), Hermes agent, server monitor & finance tracker.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        {/* JSON-LD Person schema untuk SEO professional */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Regsi Wahyu Saputra',
              url: siteUrl,
              sameAs: ['https://github.com/apute098'],
              jobTitle: 'Homelab Engineer & AI Tinkerer',
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
