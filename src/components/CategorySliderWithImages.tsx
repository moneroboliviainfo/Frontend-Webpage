'use client';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import CategorySlide from './CategorySlide';
import useIsMobile from '@/hooks/useIsMobile';
import { CLOTHING_API_CONSTANTS } from '@/services/clothingService';
import type { RootState } from '@/store/store';

// Frontend gender constants to match route parameters
const FRONTEND_GENDERS = {
  MEN: 'men' as const,
  WOMEN: 'women' as const,
} as const;

type CategorySliderWithImagesProps = {
  gender?: string;
};

export default function CategorySliderWithImages({
  gender = 'women',
}: CategorySliderWithImagesProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Get categories and loading/error state from Redux store
  const apiCategories = useSelector(
    (state: RootState) => state.clothing.categories
  );
  const loading = useSelector((state: RootState) => state.clothing.loading);
  const error = useSelector((state: RootState) => state.clothing.error);

  // Filter and sort categories for current gender, show only top 5
  const categories = useMemo(() => {
    const apiGender: 'male' | 'female' =
      gender === FRONTEND_GENDERS.MEN
        ? CLOTHING_API_CONSTANTS.GENDERS.MALE
        : CLOTHING_API_CONSTANTS.GENDERS.FEMALE;

    // Filter by gender and enabled status, then sort by displayOrder (lowest first)
    return apiCategories
      .filter((category) => category.gender === apiGender && category.enabled)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 5); // Take only top 5 categories
  }, [apiCategories, gender]);

  const slideWidth = isMobile ? '40vw' : '16.666vw';
  const slideHeight = isMobile ? '60vw' : '25vw';

  // Show loading state
  if (loading && categories.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-blue-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && categories.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500 text-center">
          <p className="text-sm">Error al cargar las categorías</p>
        </div>
      </div>
    );
  }

  // Show empty state if no categories available
  if (categories.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500 text-center">
          <p className="text-sm">No hay categorías disponibles</p>
        </div>
      </div>
    );
  }

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
          const categoryUrl = encodeURIComponent(
            `${category.name}-${category.id}`
          );

          return (
            <CategorySlide
              key={category.id}
              name={category.name}
              image={category.image || '/categories/default.jpg'}
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
          image={`/categories/all-categories${
            gender === FRONTEND_GENDERS.MEN ? '.jpg' : '.png'
          }`}
          width={slideWidth}
          height={slideHeight}
          onClick={() => router.push(`/${gender}/categories`)}
        />
      </ul>
    </div>
  );
}
