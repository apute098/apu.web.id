import { MetadataRoute } from 'next';

// Tailnet-only: tidak ada yang boleh diindeks mesin pencari.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}