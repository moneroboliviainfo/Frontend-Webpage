import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import { AD_TYPES } from '@/constants/ads';

type Props = {
  params: { gender: string };
  searchParams?: { category?: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params?: { gender?: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const capitalize = (s: string) =>
    s
      .split(/[-_\s]+/) // split on hyphen/underscore/spaces
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(' ');

  // determine gender label
  const genderParam = (params?.gender ?? '').toString().toLowerCase();
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

  const title = `Categorias - ${genderLabel} | Monero`;
  const description =
    first(searchParams?.description) ??
    `Descubre todas las categorias para ${genderLabel.toLowerCase()} en Monero.`;

  return {
    title,
    description,
  };
}

export default function GenderClothesPage({ params, searchParams }: Props) {
  const gender = params?.gender ?? AD_TYPES.WOMEN;
  const category = Array.isArray(searchParams?.category)
    ? searchParams!.category[0]
    : searchParams?.category;

  // For now we render the same PageContainer used elsewhere.
  // We include the gender/category as data attributes so they are used and
  // available in the DOM for debugging or styling. Later we can pass them
  // to PageContainer as props when it accepts them.
  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div data-gender={gender} data-category={category ?? ''}>
        Categorías
      </div>
      <Footer />
    </>
  );
}
