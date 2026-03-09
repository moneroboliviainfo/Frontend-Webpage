import type { Metadata } from 'next';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import TermsAndConditions from '@/components/TermsAndConditions';
import { createPageMetadata } from '@/config/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Términos y Condiciones',
  description:
    'Términos y Condiciones de Compra de Monero. Conoce nuestras políticas de venta, cambios, devoluciones y garantías.',
  openGraph: {
    title: 'Términos y Condiciones | Monero',
    description:
      'Conoce los términos y condiciones de compra en Monero. Políticas de venta, cambios, devoluciones y más.',
  },
  twitter: {
    title: 'Términos y Condiciones | Monero',
    description:
      'Términos y condiciones de compra en Monero. Políticas de venta y garantías.',
  },
});

export default function PoliciesPage() {
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
          <TermsAndConditions showTitle={true} compact={false} />
        </div>
      </main>
      <Footer visible={true} />
    </>
  );
}
