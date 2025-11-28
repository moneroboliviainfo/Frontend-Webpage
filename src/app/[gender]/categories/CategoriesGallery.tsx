'use client';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useIsMobile from '@/hooks/useIsMobile';
import CategoryGalleryItem from './CategoryGalleryItem';
import { CLOTHING_API_CONSTANTS } from '@/services/clothingService';
import type { RootState } from '@/store/store';

// Frontend gender constants to match route parameters
const FRONTEND_GENDERS = {
  MEN: 'men' as const,
  WOMEN: 'women' as const,
} as const;

type CategoriesGalleryProps = {
  gender?: string;
};

export default function CategoriesGallery({
  gender = 'women',
}: CategoriesGalleryProps) {
  const isMobile = useIsMobile();

  // Get categories from Redux store
  const allCategories = useSelector(
    (state: RootState) => state.clothing.categories
  );
  const loading = useSelector((state: RootState) => state.clothing.loading);
  const error = useSelector((state: RootState) => state.clothing.error);

  // Convert gender string to API format and filter categories
  const categories = useMemo(() => {
    const apiGender: 'male' | 'female' =
      gender === FRONTEND_GENDERS.MEN
        ? CLOTHING_API_CONSTANTS.GENDERS.MALE
        : CLOTHING_API_CONSTANTS.GENDERS.FEMALE;

    return allCategories
      .filter((category) => category.enabled && category.gender === apiGender)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [allCategories, gender]);

  // Loading state
  if (loading) {
    return (
      <section className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 border-t-blue-500 rounded-full mx-auto mb-2"></div>
          <p>Cargando categorías...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full flex items-center justify-center py-8">
        <div className="text-red-500 text-center">
          <p>Error al cargar las categorías</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </section>
    );
  }

  // No categories available
  if (categories.length === 0) {
    return (
      <section className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500 text-center">
          <p>No hay categorías disponibles para esta sección</p>
        </div>
      </section>
    );
  }

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
                categoryId={category.id.toString()}
                src={category.image || '/categories/default.jpg'}
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
