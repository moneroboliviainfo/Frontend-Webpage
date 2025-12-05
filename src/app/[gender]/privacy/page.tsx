import type { Metadata } from 'next';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { createPageMetadata } from '@/config/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Política de Privacidad',
  description:
    'Política de Privacidad de Monero. Conoce cómo protegemos y manejamos tus datos personales, tus derechos de privacidad y cómo usamos tu información.',
  openGraph: {
    title: 'Política de Privacidad | Monero',
    description:
      'Conoce cómo protegemos tu información personal en Monero. Política de privacidad, protección de datos y tus derechos.',
  },
  twitter: {
    title: 'Política de Privacidad | Monero',
    description:
      'Política de privacidad y protección de datos personales en Monero.',
  },
});

export default function PrivacyPage() {
  return (
    <>
      <NavBar dynamicTransparent={false} />
      <main
        style={{
          minHeight: 'calc(100vh - 120px)',
          backgroundColor: '#ffffff',
          padding: '2rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <PrivacyPolicy showTitle={true} compact={false} />
        </div>
      </main>
      <Footer />
    </>
  );
}
