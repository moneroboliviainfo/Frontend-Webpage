'use client';
import React, { useEffect, useState } from 'react';
// Image import removed: not used in apology fallback
// import Image from 'next/image';
import useIsMobile from '@/hooks/useIsMobile';
import OutfitsGalleryItem from './OutfitsGalleryItem';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/env';
import { filterOutfitsByGender } from '@/utils/outfits';

type OutfitCard = {
  src: string;
  productId: number;
  name?: string;
  gender?: string;
};

type OutfitApi = {
  id: number;
  name: string;
  images?: string[];
  videos?: string[];
  gender?: string;
  productColors?: unknown[];
};

type Props = { gender?: string };

export default function OutfitsGallery({ gender = 'female' }: Props) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [outfits, setOutfits] = useState<OutfitCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`${API_URL}web-page/outfits`);
        if (!res.ok) throw new Error('Fetch outfits failed');
        const data = await res.json();

        if (!mounted) return;

        // Filter using the shared helper (handles 'men'|'women' and 'male'|'female')
        const filtered = filterOutfitsByGender(data as unknown[], gender);

        const mapped: OutfitCard[] = (filtered as OutfitApi[]).map((o) => ({
          src: o.images && o.images.length > 0 ? (o.images[0] as string) : '',
          productId: o.id,
          name: o.name,
          gender: o.gender,
        }));

        setOutfits(mapped);
        setLoading(false);
      } catch (err) {
        console.warn('Failed to load outfits:', err);
        setOutfits([]);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [gender]);

  // grid: 4 columns desktop, 2 columns mobile
  return (
    <section
      className="w-full"
      style={{
        paddingLeft: isMobile ? 0 : '0.35rem',
        paddingRight: isMobile ? 0 : '0.35rem',
        paddingTop: '0.35rem',
      }}
    >
      {loading ? (
        <LoadingScreen message="Cargando outfits..." isVisible={true} />
      ) : outfits.length === 0 ? (
        // No outfits for this gender: show an apology message on black background
        <div style={{ backgroundColor: 'black', padding: isMobile ? 12 : 24 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', color: '#fff' }}>
            <div
              style={{
                padding: isMobile ? '1rem' : '2rem',
                textAlign: 'center',
              }}
            >
              <h3
                style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.5rem' }}
              >
                Lo sentimos
              </h3>
              <p style={{ color: '#d1d5db', marginTop: 8 }}>
                No encontramos outfits para esta categoría en este momento.
                Estamos trabajando para traer más opciones pronto.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full grid gap-1 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}
          style={{
            // ensure items use viewport-based sizing per requirement
            alignItems: 'start',
          }}
        >
          {outfits.map((outfit) => {
            return (
              <div
                key={outfit.productId}
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    `/w/outfits?outfit=${encodeURIComponent(
                      `${outfit.name}-${outfit.productId}`,
                    )}`,
                  )
                }
              >
                <OutfitsGalleryItem
                  productId={outfit.productId}
                  src={outfit.src}
                  isMobile={isMobile}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
