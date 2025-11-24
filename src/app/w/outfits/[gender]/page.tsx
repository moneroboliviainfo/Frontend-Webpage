import type { Metadata } from 'next';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import OutfitsPageNavBar from '../OutfitsPageNavBar';
import OutfitsGallery from '../OutfitsGallery';

type Props = {
  params: { gender: string };
};

export async function generateMetadata({
  params,
}: {
  params?: { gender?: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
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
  }

  return {
    title: `Obtén el estilo - ${genderLabel} | Monero`,
    description: `Toma inspiración de los outfits que preparamos para ${genderLabel.toLowerCase()}. Descubre combinaciones únicas en Monero.`,
  };
}

export default async function GenderOutfitsPage({ params }: Props) {
  const resolvedParams = await params;
  const gender = resolvedParams?.gender ?? 'women';

  return (
    <>
      <NavBar dynamicTransparent={false} />
      <div data-gender={gender}>
        <OutfitsPageNavBar />
        <OutfitsGallery />
      </div>
      <Footer />
    </>
  );
}
