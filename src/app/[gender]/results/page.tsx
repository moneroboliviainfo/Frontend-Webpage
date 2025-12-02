import type { Metadata } from 'next';

import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';

import { createPageMetadata } from '@/config/metadata';
import SearchResultsBody from './SearchResultsBody';

type Props = {
  params: Promise<{ gender: string }>;
  searchParams?: Promise<{ search?: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
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

  const searchQuery = first(resolvedSearchParams?.search) || '';
  const title = searchQuery
    ? `Resultados para "${searchQuery}" - ${genderLabel}`
    : `Resultados de búsqueda - ${genderLabel}`;
  const description = searchQuery
    ? `Encuentra los mejores productos relacionados con "${searchQuery}" para ${genderLabel.toLowerCase()} en Monero.`
    : `Explora nuestros resultados de búsqueda para ${genderLabel.toLowerCase()} en Monero.`;

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

export default async function SearchResultsPage({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const gender = resolvedParams?.gender ?? 'women';
  const searchQuery = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams!.search[0]
    : resolvedSearchParams?.search || '';

  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div
        data-gender={gender}
        data-search={searchQuery}
        style={{ marginTop: '40px' }}
      >
        <SearchResultsBody gender={gender} searchQuery={searchQuery} />
      </div>
      <Footer />
    </>
  );
}
