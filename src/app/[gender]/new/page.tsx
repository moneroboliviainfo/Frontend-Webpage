import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import { createPageMetadata } from '@/config/metadata';
import { notFound } from 'next/navigation';
import NewProductsBody from './NewProductsBody';

type Props = {
  params: Promise<{ gender: string }>;
};

// Helper function to validate gender parameter
function isValidGender(gender: string): boolean {
  const normalizedGender = gender.toLowerCase();
  return (
    normalizedGender === 'men' ||
    normalizedGender === 'women' ||
    normalizedGender === 'hombres' ||
    normalizedGender === 'mujeres' ||
    normalizedGender === 'male' ||
    normalizedGender === 'female'
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const genderParam = (resolvedParams?.gender ?? '').toString().toLowerCase();

  // Validate gender parameter
  if (!isValidGender(genderParam)) {
    return createPageMetadata({
      title: 'Página no encontrada',
      description: 'La página que buscas no existe.',
    });
  }

  let genderLabel = 'Mujeres';
  if (
    genderParam === 'men' ||
    genderParam === 'hombres' ||
    genderParam === 'male'
  ) {
    genderLabel = 'Hombres';
  } else if (
    genderParam === 'women' ||
    genderParam === 'mujeres' ||
    genderParam === 'female'
  ) {
    genderLabel = 'Mujeres';
  }

  const title = `Novedades - ${genderLabel}`;
  const description = `Descubre las últimas novedades y productos más recientes para ${genderLabel.toLowerCase()} en Monero.`;

  return createPageMetadata({
    title,
    description,
    openGraph: {
      title: `${title} | Monero`,
      description,
    },
    twitter: {
      title: `${title} | Monero`,
      description,
    },
  });
}

export default async function NewProductsPage({ params }: Props) {
  const resolvedParams = await params;
  const gender = resolvedParams?.gender ?? 'women';

  // Validate gender parameter and show 404 if invalid
  if (!isValidGender(gender)) {
    notFound();
  }

  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div data-gender={gender} style={{ marginTop: '40px' }}>
        <NewProductsBody gender={gender} />
      </div>
      <Footer />
    </>
  );
}
