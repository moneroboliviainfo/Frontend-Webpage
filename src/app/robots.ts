import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Nothing to index behind these, and checkout carries order state.
        '/w/checkout',
        '/auth/callback',
        // Search result pages: thin, infinite and duplicate the catalog.
        '/*/results',
      ],
    },
    // Built from SITE_URL so it cannot drift from the canonical host again —
    // the previous static file pointed at the bare domain, which 301-redirects.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
