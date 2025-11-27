import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import CategoriesPageNavBar from './CategoriesPageNavBar';
import CategoriesGallery from './CategoriesGallery';
import { AD_TYPES } from '@/constants/ads';
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
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const capitalize = (s: string) =>
    s
      .split(/[-_\s]+/) // split on hyphen/underscore/spaces
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(' ');

  // Await the params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

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

  const title = `Categorías - ${genderLabel}`;
  const description =
    first(resolvedSearchParams?.description) ??
    `Descubre todas las categorías para ${genderLabel.toLowerCase()} en Monero.`;

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
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const gender = resolvedParams?.gender ?? AD_TYPES.WOMEN;
  const category = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams!.category[0]
    : resolvedSearchParams?.category;

  // Categories page with gallery structure similar to outfits
  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div data-gender={gender} data-category={category ?? ''}>
        <CategoriesPageNavBar />
        <CategoriesGallery gender={gender} />
      </div>
      <Footer />
    </>
  );
}
