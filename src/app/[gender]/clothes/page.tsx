import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import CompactSeasonalDiscountModalGate from '@/app/CompactSeasonalDiscountModalGate';
import { AD_TYPES } from '@/constants/ads';
import ClothesPageBody from './ClothesPageBody';
import { createPageMetadata } from '@/config/metadata';

type Props = {
  params: Promise<{ gender: string }>;
  searchParams?: Promise<{ category?: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ gender?: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  // Await dynamic route APIs as required by Next.js
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  // category can be passed as ?category=jeans or as ?title=Jeans
  const rawCategory =
    first(resolvedSearchParams?.category) ??
    first(resolvedSearchParams?.title) ??
    'Todas';

  const capitalize = (s: string) =>
    s
      .split(/[-_\s]+/) // split on hyphen/underscore/spaces
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(' ');

  const categoryLabel = capitalize(String(rawCategory));

  // determine gender label
  const genderParam = (resolvedParams?.gender ?? '').toString().toLowerCase();
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
  } else if (genderParam) {
    // fallback: capitalize raw param
    genderLabel = capitalize(genderParam);
  }

  const title = `${categoryLabel} - ${genderLabel}`;
  const description =
    first(resolvedSearchParams?.description) ??
    `Descubre la colección de ${categoryLabel.toLowerCase()} para ${genderLabel.toLowerCase()} en Monero.`;

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

export default async function GenderClothesPage({
  params,
  searchParams,
}: Props) {
  // `params` can be async in Next.js dynamic route handlers — await it before
  // accessing properties to satisfy the sync-dynamic-apis requirement.
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const gender = resolvedParams?.gender ?? AD_TYPES.WOMEN;
  const category = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams!.category[0]
    : resolvedSearchParams?.category;

  // For now we render the same PageContainer used elsewhere.
  // We include the gender/category as data attributes so they are used and
  // available in the DOM for debugging or styling. Later we can pass them
  // to PageContainer as props when it accepts them.
  return (
    <>
      <NavBar dynamicTransparent={false} />
      <CompactSeasonalDiscountModalGate gender={gender} />
      <div data-gender={gender} data-category={category ?? ''}>
        <ClothesPageBody
          gender={String(gender)}
          category={String(category ?? '')}
        />
      </div>
      <Footer />
    </>
  );
}
