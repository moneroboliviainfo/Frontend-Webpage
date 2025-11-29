'use client';
import React, { useEffect, useState } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import OutfitsGalleryItem from './OutfitsGalleryItem';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/env';

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
        const res = await fetch(`${API_URL}outfits`);
        if (!res.ok) throw new Error('Fetch outfits failed');
        const data = await res.json();

        if (!mounted) return;

        const mapped: OutfitCard[] = (data as OutfitApi[])
          .filter((o) => (gender ? o.gender === gender : true))
          .map((o) => ({
            src:
              o.images && o.images.length > 0
                ? (o.images[0] as string)
                : '/clothes/clothe-1.png',
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
                      `${outfit.name}-${outfit.productId}`
                    )}`
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
