import type { MetadataRoute } from 'next';

const base = 'https://archlinux.tail0d5c92.ts.net';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/etalase`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];
}