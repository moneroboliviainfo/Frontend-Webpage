'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import GalleryItem from './GalleryItem';

const sampleClothes = [
  {
    src: '/clothes/clothe-1.png',
    name: 'Chaqueta Derby',
    price: 129,
    colors: ['#000000', '#ffffff'],
    isNew: true,
    discount: 10,
    finalPrice: 116,
  },
  {
    src: '/clothes/clothe-2.png',
    name: 'Pantalón Slim',
    price: 79,
    colors: ['#2b6cb0', '#f6ad55'],
    isNew: true,
    discount: 0,
    finalPrice: 79,
  },
  {
    src: '/clothes/clothe-3.png',
    name: 'Suéter Lana',
    price: 99,
    colors: ['#9f7aea'],
    isNew: false,
    discount: 5,
    finalPrice: 94,
  },
  {
    src: '/clothes/clothe-4.png',
    name: 'Blusa Seda',
    price: 89,
    colors: ['#e53e3e', '#f6ad55', '#f7fafc'],
    isNew: true,
    discount: 20,
    finalPrice: 71,
  },
  {
    src: '/clothes/clothe-1.png',
    name: 'Chaqueta Derby',
    price: 129,
    colors: ['#111827'],
    isNew: false,
    discount: 0,
    finalPrice: 129,
  },
  {
    src: '/clothes/clothe-2.png',
    name: 'Pantalón Slim',
    price: 79,
    colors: ['#0ea5e9', '#67e8f9'],
    isNew: false,
    discount: 15,
    finalPrice: 67,
  },
  {
    src: '/clothes/clothe-3.png',
    name: 'Suéter Lana',
    price: 99,
    colors: ['#10b981', '#065f46'],
    isNew: false,
    discount: 0,
    finalPrice: 99,
  },
  {
    src: '/clothes/clothe-4.png',
    name: 'Blusa Seda',
    price: 89,
    colors: ['#f97316'],
    isNew: false,
    discount: 0,
    finalPrice: 89,
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
          return (
            <div key={idx}>
              <GalleryItem
                src={c.src}
                name={c.name}
                price={c.price}
                isMobile={isMobile}
                colors={c.colors}
                isNew={c.isNew}
                discount={c.discount}
                finalPrice={c.finalPrice}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
// (placeholder removed) - file contains the ClothesGallery implementation above
