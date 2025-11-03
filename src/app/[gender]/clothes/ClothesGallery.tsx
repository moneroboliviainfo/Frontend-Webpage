'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import GalleryItem from './GalleryItem';

const sampleClothes = [
  {
    src: '/clothes/clothe-1.png',
    name: 'Chaqueta Derby',
    price: '$129',
    colors: ['#000000', '#ffffff'],
    isNew: true,
  },
  {
    src: '/clothes/clothe-2.png',
    name: 'Pantalón Slim',
    price: '$79',
    colors: ['#2b6cb0', '#f6ad55'],
    isNew: true,
  },
  {
    src: '/clothes/clothe-3.png',
    name: 'Suéter Lana',
    price: '$99',
    colors: ['#9f7aea'],
    isNew: false,
  },
  {
    src: '/clothes/clothe-4.png',
    name: 'Blusa Seda',
    price: '$89',
    colors: ['#e53e3e', '#f6ad55', '#f7fafc'],
    isNew: true,
  },
  {
    src: '/clothes/clothe-1.png',
    name: 'Chaqueta Derby',
    price: '$129',
    colors: ['#111827'],
    isNew: false,
  },
  {
    src: '/clothes/clothe-2.png',
    name: 'Pantalón Slim',
    price: '$79',
    colors: ['#0ea5e9', '#67e8f9'],
    isNew: false,
  },
  {
    src: '/clothes/clothe-3.png',
    name: 'Suéter Lana',
    price: '$99',
    colors: ['#10b981', '#065f46'],
    isNew: false,
  },
  {
    src: '/clothes/clothe-4.png',
    name: 'Blusa Seda',
    price: '$89',
    colors: ['#f97316'],
    isNew: false,
  },
];

export default function ClothesGallery() {
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
        {sampleClothes.map((c, idx) => {
          // randomize isNew for demo: ~30% chance an item is new
          return (
            <div key={idx}>
              <GalleryItem
                src={c.src}
                name={c.name}
                price={c.price}
                isMobile={isMobile}
                colors={c.colors}
                isNew={c.isNew}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
// (placeholder removed) - file contains the ClothesGallery implementation above
