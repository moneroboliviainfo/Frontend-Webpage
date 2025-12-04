import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import { createPageMetadata } from '@/config/metadata';
import { notFound } from 'next/navigation';
import DiscountsBody from './DiscountsBody';

type Props = {
  params: Promise<{ gender: string }>;
};

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

  const title = `Descuentos - ${genderLabel}`;
  const description = `Encuentra los mejores descuentos y productos en oferta para ${genderLabel.toLowerCase()} en Monero.`;

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

export default async function DiscountsPage({ params }: Props) {
  const resolvedParams = await params;
  const gender = resolvedParams?.gender ?? 'women';

  if (!isValidGender(gender)) {
    notFound();
  }

  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div data-gender={gender} style={{ marginTop: '40px' }}>
        <DiscountsBody gender={gender} />
      </div>
      <Footer />
    </>
  );
}
