'use client';
import React, { useEffect, useState } from 'react';

import Image from 'next/image';

const categories = [
  { name: 'JEANS', image: '/categories/jeans.jpg' },
  { name: 'JACKETS AND TRENCH', image: '/categories/swater.jpg' },
  { name: 'TROUSERS', image: '/categories/trousers.jpg' },
  { name: 'SWEATERS AND CARDIGANS', image: '/categories/cardigans.jpg' },
  { name: 'TOPS AND BODYSUITS', image: '/categories/tops.jpg' },
  { name: 'SWATSHIRTS AND HOODIES', image: '/categories/hoodies.jpg' },
];

export default function CategorySliderWithImages() {
  const [isMobile, setIsMobile] = useState(false);

  const slideWidth = isMobile ? '40vw' : '16.666vw';
  const slideHeight = isMobile ? '60vw' : '25vw';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="w-full overflow-x-auto hide-scrollbar"
      style={{
        msOverflowStyle: 'none', // IE and Edge
        scrollbarWidth: 'none', // Firefox
      }}
    >
      <ul
        className="flex gap-1"
        style={{
          WebkitOverflowScrolling: 'touch',
          minWidth: 'fit-content',
          overflow: 'hidden',
          paddingTop: '0.25rem',
        }}
      >
        {categories.map((category) => (
          <li
            key={category.name}
            className="text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
            style={{
              width: slideWidth,
              height: slideHeight,
              minWidth: slideWidth,
              minHeight: slideHeight,
              maxWidth: slideWidth,
              maxHeight: slideHeight,
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'white',
              borderStyle: 'solid',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              sizes={slideWidth}
            />
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.1rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 2,
                textAlign: 'center',
                width: '90%',
              }}
            >
              {category.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
