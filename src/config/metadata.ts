import type { Metadata } from 'next';

// Shared metadata configuration following DRY principles
export const baseMetadata: Metadata = {
  title: {
    default: 'Monero | Tienda de Moda Online',
    template: '%s | MoneroGet',
  },
  description:
    'Monero - Tienda de ropa Monero para hombres y mujeres en Bolivia. Descubre las últimas tendencias de moda, colecciones exclusivas y compra prendas premium en línea.',
  keywords: [
    'moneroget',
    'monero',
    'tienda monero',
    'moda',
    'ropa',
    'hombres',
    'mujeres',
    'tienda online',
    'fashion',
    'tendencias',
    'ropa Bolivia',
    'tienda de ropa online Bolivia',
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
    title: 'Monero - Tienda de Moda Monero Online',
    description:
      'Monero - Descubre las últimas tendencias de moda para hombres y mujeres en Monero. Ropa premium y accesorios en Bolivia.',
    url: 'https://moneroget.com',
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
