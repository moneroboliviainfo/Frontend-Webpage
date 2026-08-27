'use client';
import React, { useEffect, useState } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import CategoryGalleryItem from './CategoryGalleryItem';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { CLOTHING_API_CONSTANTS } from '@/services/clothingService';
import { API_URL } from '@/config/env';

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

  type CategoryApi = {
    id: number;
    name: string;
    gender?: string;
    displayOrder?: number;
    enabled?: boolean;
    image?: string | null;
    subcategories?: Array<{
      id: number;
      name: string;
      enabled?: boolean;
      videos?: string[];
    }>;
  };

  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const apiGender: 'male' | 'female' =
      gender === FRONTEND_GENDERS.MEN
        ? CLOTHING_API_CONSTANTS.GENDERS.MALE
        : CLOTHING_API_CONSTANTS.GENDERS.FEMALE;

    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}web-page/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = (await res.json()) as CategoryApi[];

        if (!mounted) return;

        const filtered = data
          .filter((c) => c.enabled && c.gender === apiGender)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        setCategories(filtered);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'Error');
        setLoading(false);
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [gender]);

  if (loading) {
    return (
      <LoadingScreen
        message="Cargando categorías..."
        enhancedSpinner={true}
        logoPulse={true}
      />
    );
  }

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

  if (categories.length === 0) {
    return (
      <section className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500 text-center">
          <p>No hay categorías disponibles para esta sección</p>
        </div>
      </section>
    );
  }

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
        style={{ alignItems: 'start' }}
      >
        {categories.map((category) => (
          <div key={category.id}>
            <CategoryGalleryItem
              categoryId={category.id.toString()}
              src={
                category.image && String(category.image).trim()
                  ? category.image
                  : ''
              }
              name={category.name}
              isMobile={isMobile}
              gender={gender}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
