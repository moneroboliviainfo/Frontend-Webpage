import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../store/Provider';
import AuthProvider from '../components/AuthProvider';
import BugsnagProvider from '../components/BugsnagProvider';
import { baseMetadata } from '../config/metadata';

import '@fontsource/poppins';
import '@fontsource/space-grotesk';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clarity only runs in production builds or when explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('isProduction:', isProduction);

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link
          rel="shortcut icon"
          href="/logos/Logo-Monero.png"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/logos/Logo-Monero.png" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ClothingStore',
              name: 'MoneroGet',
              alternateName: 'Monero',
              url: 'https://www.moneroget.com',
              logo: 'https://www.moneroget.com/logos/Logo-Monero.png',
              description:
                'Monero - Tienda de ropa en Sucre, Bolivia. Moda para hombres y mujeres. Las últimas tendencias y prendas premium.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Sucre',
                addressRegion: 'Chuquisaca',
                addressCountry: 'BO',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -19.0333,
                longitude: -65.2627,
              },
              areaServed: [
                {
                  '@type': 'City',
                  name: 'Sucre',
                },
                {
                  '@type': 'Country',
                  name: 'Bolivia',
                },
              ],
              potentialAction: {
                '@type': 'SearchAction',
                target:
                  'https://www.moneroget.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              sameAs: [
                'https://www.facebook.com/profile.php?id=61577714284167',
                'https://www.instagram.com/moneroget',
                'https://www.tiktok.com/@moneroget',
              ],
            }),
          }}
        />

        {isProduction && (
          <>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "uj4u9y5mht");
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isProduction && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-9V15LRZ0PM"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-9V15LRZ0PM');
              `}
            </Script>
          </>
        )}
        <ReduxProvider>
          <BugsnagProvider>
            <AuthProvider>{children}</AuthProvider>
          </BugsnagProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
