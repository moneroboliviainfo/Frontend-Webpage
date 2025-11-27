'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import CategoryGalleryItem from './CategoryGalleryItem';

type CategoriesGalleryProps = {
  gender?: string;
};

const categories = [
  {
    id: 'jeans',
    name: 'JEANS',
    image: '/categories/jeans.jpg',
  },
  {
    id: 'jackets-and-trench',
    name: 'JACKETS AND TRENCH',
    image: '/categories/swater.jpg',
  },
  {
    id: 'trousers',
    name: 'TROUSERS',
    image: '/categories/trousers.jpg',
  },
  {
    id: 'sweaters-and-cardigans',
    name: 'SWEATERS AND CARDIGANS',
    image: '/categories/cardigans.jpg',
  },
  {
    id: 'tops-and-bodysuits',
    name: 'TOPS AND BODYSUITS',
    image: '/categories/tops.jpg',
  },
  {
    id: 'dresses',
    name: 'DRESSES',
    image: '/categories/jeans.jpg',
  },
  {
    id: 'skirts',
    name: 'SKIRTS',
    image: '/categories/trousers.jpg',
  },
  {
    id: 'blazers',
    name: 'BLAZERS',
    image: '/categories/swater.jpg',
  },
  {
    id: 'coats',
    name: 'COATS',
    image: '/categories/cardigans.jpg',
  },
  {
    id: 'shoes',
    name: 'SHOES',
    image: '/categories/tops.jpg',
  },
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    image: '/categories/jeans.jpg',
  },
  {
    id: 'bags',
    name: 'BAGS',
    image: '/categories/trousers.jpg',
  },
  {
    id: 'lingerie',
    name: 'LINGERIE',
    image: '/categories/swater.jpg',
  },
  {
    id: 'sportswear',
    name: 'SPORTSWEAR',
    image: '/categories/cardigans.jpg',
  },
  {
    id: 'swimwear',
    name: 'SWIMWEAR',
    image: '/categories/tops.jpg',
  },
  {
    id: 'jewelry',
    name: 'JEWELRY',
    image: '/categories/jeans.jpg',
  },
];

export default function CategoriesGallery({
  gender = 'women',
}: CategoriesGalleryProps) {
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
        {categories.map((category) => {
          return (
            <div key={category.id}>
              <CategoryGalleryItem
                categoryId={category.id}
                src={category.image}
                name={category.name}
                isMobile={isMobile}
                gender={gender}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
