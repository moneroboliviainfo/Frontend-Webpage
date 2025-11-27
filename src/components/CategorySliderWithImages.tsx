'use client';
import React from 'react';

import { useRouter } from 'next/navigation';
import CategorySlide from './CategorySlide';
import useIsMobile from '@/hooks/useIsMobile';

const categories = [
  { name: 'JEANS', image: '/categories/jeans.jpg' },
  { name: 'JACKETS AND TRENCH', image: '/categories/swater.jpg' },
  { name: 'TROUSERS', image: '/categories/trousers.jpg' },
  { name: 'SWEATERS AND CARDIGANS', image: '/categories/cardigans.jpg' },
  { name: 'TOPS AND BODYSUITS', image: '/categories/tops.jpg' },
];

type CategorySliderWithImagesProps = {
  gender?: string;
};

export default function CategorySliderWithImages({
  gender = 'women',
}: CategorySliderWithImagesProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const slideWidth = isMobile ? '40vw' : '16.666vw';
  const slideHeight = isMobile ? '60vw' : '25vw';

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
        {categories.map((category) => {
          const slug = category.name.split(' ').join('-').toLowerCase();
          return (
            <CategorySlide
              key={category.name}
              name={category.name}
              image={category.image}
              width={slideWidth}
              height={slideHeight}
              onClick={() =>
                router.push(
                  `/${gender}/clothes?category=${encodeURIComponent(slug)}`
                )
              }
            />
          );
        })}
        <CategorySlide
          key="all-categories"
          name="VER TODAS LAS CATEGORIAS"
          image="/categories/all-categories.png"
          width={slideWidth}
          height={slideHeight}
          onClick={() => router.push(`/${gender}/categories`)}
        />
      </ul>
    </div>
  );
}
