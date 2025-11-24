'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import OutfitsGalleryItem from './OutfitsGalleryItem.tsx';

const sampleOutfits = [
  {
    src: '/clothes/clothe-1.png',
    productId: 101,
  },
  {
    src: '/clothes/clothe-2.png',
    productId: 102,
  },
  {
    src: '/clothes/clothe-3.png',
    productId: 103,
  },
  {
    src: '/clothes/clothe-4.png',
    productId: 104,
  },
  {
    src: '/clothes/clothe-1.png',
    productId: 105,
  },
  {
    src: '/clothes/clothe-2.png',
    productId: 106,
  },
  {
    src: '/clothes/clothe-3.png',
    productId: 107,
  },
  {
    src: '/clothes/clothe-4.png',
    productId: 108,
  },
];

export default function OutfitsGallery() {
  const isMobile = useIsMobile();

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
      <div
        className={`w-full grid gap-1 ${
          isMobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}
        style={{
          // ensure items use viewport-based sizing per requirement
          alignItems: 'start',
        }}
      >
        {sampleOutfits.map((outfit) => {
          return (
            <div key={outfit.productId}>
              <OutfitsGalleryItem
                productId={outfit.productId}
                src={outfit.src}
                isMobile={isMobile}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
