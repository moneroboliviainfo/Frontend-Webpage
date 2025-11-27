import type { Metadata } from 'next';
import NavBar from '@/components/nav/NavBar';
import PageContainer from '../PageContainer';
import Footer from '@/components/Footer';
import { createPageMetadata } from '@/config/metadata';

type Props = {
  params: Promise<{ gender: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const genderParam = (resolvedParams?.gender ?? '').toString().toLowerCase();

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

  return (
    <>
      <NavBar />
      <PageContainer gender={gender} />
      <Footer />
    </>
  );
}
