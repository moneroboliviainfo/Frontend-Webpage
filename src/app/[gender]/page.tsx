import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NavBar from '@/components/nav/NavBar';
import PageContainer from '../PageContainer';
import Footer from '@/components/Footer';
import { createPageMetadata } from '@/config/metadata';
import GenderPageDataLoader from './GenderPageDataLoader';
import SeasonalDiscountModalGate from './SeasonalDiscountModalGate';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender?: string }>;
}): Promise<Metadata> {
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
  let description = 'Descubre la colección para mujeres en Monero.';

  if (
    genderParam === 'men' ||
    genderParam === 'hombres' ||
    genderParam === 'male'
  ) {
    genderLabel = 'Hombres';
    description = 'Descubre la colección para hombres en Monero.';
  } else if (
    genderParam === 'women' ||
    genderParam === 'mujeres' ||
    genderParam === 'female'
  ) {
    genderLabel = 'Mujeres';
    description = 'Descubre la colección para mujeres en Monero.';
  }

  return createPageMetadata({
    title: genderLabel,
    description,
    openGraph: {
      title: `${genderLabel} | Monero`,
      description,
    },
    twitter: {
      title: `${genderLabel} | Monero`,
      description,
    },
  });
}

export default async function GenderPage({ params }: Props) {
  const resolvedParams = await params;
  const gender = resolvedParams?.gender ?? 'women';

  // Validate gender parameter and show 404 if invalid
  if (!isValidGender(gender)) {
    notFound();
  }

  return (
    <GenderPageDataLoader gender={gender}>
      <NavBar />
      <SeasonalDiscountModalGate gender={gender} />
      <PageContainer gender={gender} />
      <Footer />
    </GenderPageDataLoader>
  );
}
