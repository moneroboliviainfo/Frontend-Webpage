import type { Metadata } from 'next';

// The www host is canonical: next.config.ts 301-redirects the bare domain.
export const SITE_URL = 'https://www.moneroget.com';

// Shared metadata configuration following DRY principles
export const baseMetadata: Metadata = {
  // Without this, relative image paths in openGraph/twitter resolve against
  // localhost and social previews break in production.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Monero | Tienda de Ropa en Sucre, Bolivia',
    template: '%s | MoneroGet',
  },
  description:
    'Monero - Tienda de ropa en Sucre, Bolivia. Monero ofrece moda para hombres y mujeres. Descubre las últimas tendencias, colecciones exclusivas y compra prendas premium en línea. Ropa de calidad en Bolivia.',
  keywords: [
    'monero',
    'moneroget',
    'tienda monero',
    'tienda de ropa en sucre',
    'tienda de ropa en bolivia',
    'tienda de ropa sucre',
    'tienda de ropa bolivia',
    'ropa sucre',
    'ropa bolivia',
    'ropa',
    'moda sucre',
    'moda bolivia',
    'ropa hombres sucre',
    'ropa mujeres sucre',
    'ropa hombres bolivia',
    'ropa mujeres bolivia',
    'tienda online sucre',
    'tienda online bolivia',
    'fashion sucre',
    'fashion bolivia',
    'tendencias moda bolivia',
    'ropa de calidad bolivia',
  ],
  authors: [{ name: 'Monero' }],
  creator: 'Monero',
  publisher: 'Monero',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        url: '/logos/Logo-Monero.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logos/Logo-Monero.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.png',
    apple: [
      {
        url: '/logos/Logo-Monero.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon.png',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Monero - Tienda de Ropa en Sucre, Bolivia',
    description:
      'Monero - Tienda de ropa Monero en Sucre, Bolivia. Descubre las últimas tendencias de moda para hombres y mujeres. Ropa premium y accesorios.',
    url: SITE_URL,
    siteName: 'MoneroGet',
    images: [
      {
        url: '/logos/Logo-Monero.png',
        width: 1200,
        height: 630,
        alt: 'Monero Logo',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monero - Tienda de Moda Online',
    description:
      'Descubre las últimas tendencias de moda para hombres y mujeres en Monero.',
    images: ['/logos/Logo-Monero.png'],
    creator: '@monero',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Utility function to create page-specific metadata while maintaining base configuration
export const createPageMetadata = (overrides: Partial<Metadata>): Metadata => {
  return {
    ...baseMetadata,
    ...overrides,
    openGraph: {
      ...baseMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...baseMetadata.twitter,
      ...overrides.twitter,
    },
  };
};
