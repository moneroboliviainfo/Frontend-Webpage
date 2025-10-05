'use client';
import React, { useEffect, useState } from 'react';

import CategorySlide from './CategorySlide';

const categories = [
  { name: 'JEANS', image: '/categories/jeans.jpg' },
  { name: 'JACKETS AND TRENCH', image: '/categories/swater.jpg' },
  { name: 'TROUSERS', image: '/categories/trousers.jpg' },
  { name: 'SWEATERS AND CARDIGANS', image: '/categories/cardigans.jpg' },
  { name: 'TOPS AND BODYSUITS', image: '/categories/tops.jpg' },
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
          <CategorySlide
            key={category.name}
            name={category.name}
            image={category.image}
            width={slideWidth}
            height={slideHeight}
          />
        ))}
        <CategorySlide
          key="all-categories"
          name="VER TODAS LAS CATEGORIAS"
          image="/categories/all-categories.png"
          width={slideWidth}
          height={slideHeight}
        />
      </ul>
    </div>
  );
}
