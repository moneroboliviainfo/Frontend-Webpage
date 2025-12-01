'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { calculatePrice } from '@/utils/price';
import { useSearchParams } from 'next/navigation';
import useIsMobile from '@/hooks/useIsMobile';
import GalleryItem from './GalleryItem';
import ClothesPageNavBar from './ClothesPageNavBar';
import { API_URL } from '@/config/env';

// Constants
import { DAYS_TO_CONSIDER_NEW } from '@/constants/clothes';

// Types for API response
interface ProductColor {
  id: number;
  multimedia: string[];
  pdfs: string[];
  color: {
    id: number;
    name: string;
    code: string;
  };
}

interface Discount {
  id: number;
  description: string;
  discountType: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  value: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  enabled: boolean;
  createdAt: string;
  productColors: ProductColor[];
  discount: Discount | null;
}

interface Subcategory {
  id: number;
  name: string;
  enabled: boolean;
  videos: string[];
  products: Product[];
}

interface CategoryResponse {
  id: number;
  name: string;
  gender: 'male' | 'female';
  displayOrder: number;
  enabled: boolean;
  image: string;
  subcategories: Subcategory[];
}

// Type for transformed product data
interface ClothesItem {
  productId: number;
  src: string;
  name: string;
  price: number;
  colors: string[];
  isNew: boolean;
  discount: number;
  finalPrice: number;
}

export default function ClothesGallery() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [categoryData, setCategoryData] = useState<CategoryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract category ID and name from URL params
  const categoryParam = searchParams.get('category');
  const [rawCategoryName, categoryId] = useMemo(() => {
    if (!categoryParam) return [null, null];
    // Try to split by last space and check if last part is a number
    const trimmed = categoryParam.trim();
    const lastSpaceIdx = trimmed.lastIndexOf(' ');
    if (lastSpaceIdx !== -1) {
      const possibleId = trimmed.substring(lastSpaceIdx + 1);
      if (/^\d+$/.test(possibleId)) {
        const name = trimmed.substring(0, lastSpaceIdx);
        return [decodeURIComponent(name), parseInt(possibleId, 10)];
      }
    }
    // Fallback: dash format
    const parts = trimmed.split('-');
    const id = parts[parts.length - 1];
    const name = parts.slice(0, -1).join('-').replace(/-/g, ' ');
    return [decodeURIComponent(name), id ? parseInt(id, 10) : null];
  }, [categoryParam]);

  // Fetch category data
  useEffect(() => {
    if (!categoryId) {
      setError('No se encontró el ID de categoría');
      setLoading(false);
      return;
    }

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}categories/${categoryId}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: CategoryResponse = await response.json();
        setCategoryData(data);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  // Helper function to check if product is new
  const isProductNew = (createdAt: string): boolean => {
    const productDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - productDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= DAYS_TO_CONSIDER_NEW;
  };

  // Helper function to get image from multimedia array
  const getProductImage = (multimedia: string[]): string => {
    // Find first image (not video)
    const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const image = multimedia.find((url) =>
      imageFormats.some((format) => url.toLowerCase().includes(format))
    );
    return image || '/images/placeholder.jpg';
  };

  // (shared pricing utility used below)

  // Transform API data to component format
  const clothesData = useMemo(() => {
    if (!categoryData) return [];

    const allProducts: ClothesItem[] = [];

    categoryData.subcategories.forEach((subcategory) => {
      if (!subcategory.enabled) return;

      subcategory.products.forEach((product) => {
        if (!product.enabled || product.productColors.length === 0) return;

        const {
          price: roundedBasePrice,
          discountPercent,
          finalPrice,
        } = calculatePrice(product.price, product.discount);
        const discountValue = discountPercent;

        allProducts.push({
          productId: product.id,
          src: getProductImage(product.productColors[0]?.multimedia || []),
          name: product.name,
          price: roundedBasePrice,
          colors: product.productColors
            .filter((pc) => pc.color)
            .map((pc) => pc.color.code),
          isNew: isProductNew(product.createdAt),
          discount: discountValue,
          finalPrice: finalPrice, // Already integer from utility
        });
      });
    });

    return allProducts;
  }, [categoryData]);

  // Pills (subcategories) logic
  const subcategories = useMemo(() => {
    return (
      categoryData?.subcategories
        ?.filter((s) => s.enabled)
        .map((s) => ({ id: s.id, name: s.name })) || []
    );
  }, [categoryData]);

  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);

  // Reset to 'Ver todo' when subcategories change
  useEffect(() => {
    setSelectedSubcategoryId(null);
  }, [subcategories.length]);

  const filteredClothes = useMemo(() => {
    if (!selectedSubcategoryId) return clothesData;
    const subcat = categoryData?.subcategories?.find(
      (s) => s.id === selectedSubcategoryId
    );
    if (!subcat) return [];
    const ids = new Set(subcat.products.map((p) => p.id));
    return clothesData.filter((item) => ids.has(item.productId));
  }, [selectedSubcategoryId, clothesData, categoryData]);

  // Loading state
  if (loading) {
    return (
      <section className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar los productos</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  // Main render — always show the PageNavBar; if no clothes for selected subcategory show friendly message
  return (
    <>
      <ClothesPageNavBar
        gender={rawCategoryName || ''}
        category={rawCategoryName || ''}
        subcategories={subcategories}
        selectedSubcategoryId={selectedSubcategoryId}
        onSelectSubcategory={setSelectedSubcategoryId}
      />
      <section
        className="w-full"
        style={{
          paddingLeft: isMobile ? 0 : '0.35rem',
          paddingRight: isMobile ? 0 : '0.35rem',
          paddingTop: '0.35rem',
        }}
      >
        {filteredClothes.length === 0 ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-700 text-lg font-medium">
                Lo sentimos — pronto traeremos estas prendas.
              </p>
              <p className="text-gray-500 mt-2">
                Mientras tanto, mira otras categorías o regresa pronto.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`w-full grid gap-1 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-4'
            }`}
            style={{ alignItems: 'start' }}
          >
            {filteredClothes.map((item) => (
              <div key={item.productId}>
                <GalleryItem
                  productId={item.productId}
                  src={item.src}
                  name={item.name}
                  price={item.price}
                  isMobile={isMobile}
                  colors={item.colors}
                  isNew={item.isNew}
                  discount={item.discount}
                  finalPrice={item.finalPrice}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
