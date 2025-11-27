'use client';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import CategorySlide from './CategorySlide';
import useIsMobile from '@/hooks/useIsMobile';
import type { RootState } from '@/store/store';

const staticCategories = [
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

  // Get categories from Redux store
  const apiCategories = useSelector(
    (state: RootState) => state.clothing.categories
  );

  // Filter and sort categories for current gender, show only top 5
  const categories = useMemo(() => {
    const genderFilter: 'male' | 'female' =
      gender === 'men' ? 'male' : 'female';

    // Filter by gender and enabled status, then sort by displayOrder (lowest first)
    const filteredCategories = apiCategories
      .filter(
        (category) => category.gender === genderFilter && category.enabled
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 5); // Take only top 5 categories

    // Fallback to static categories if no API data
    return filteredCategories.length > 0
      ? filteredCategories
      : staticCategories.slice(0, 5);
  }, [apiCategories, gender]);

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
          // Handle both API categories (with id) and static categories (without id)
          const isApiCategory = 'id' in category;
          const categoryUrl = isApiCategory
            ? encodeURIComponent(`${category.name}-${category.id}`)
            : encodeURIComponent(
                category.name.split(' ').join('-').toLowerCase()
              );

          return (
            <CategorySlide
              key={
                isApiCategory ? `api-${category.id}` : `static-${category.name}`
              }
              name={category.name}
              image={category.image}
              width={slideWidth}
              height={slideHeight}
              onClick={() =>
                router.push(`/${gender}/clothes?category=${categoryUrl}`)
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
