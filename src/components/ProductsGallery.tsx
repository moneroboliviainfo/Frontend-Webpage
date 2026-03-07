'use client';
import React, { useMemo } from 'react';
import { calculatePrice } from '@/utils/price';
import useIsMobile from '@/hooks/useIsMobile';
import GalleryItem from '@/app/[gender]/clothes/GalleryItem';
import { DAYS_TO_CONSIDER_NEW } from '@/constants/clothes';

// Types for API response (shared)
export interface ProductColor {
  id: number;
  multimedia: string[];
  pdfs: string[];
  color: {
    id: number;
    name: string;
    code: string;
  };
  // Optional timestamp when this color/variant was created
  createdAt?: string;
}

export interface Discount {
  id: number;
  description: string;
  discountType: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  value: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  enabled: boolean;
  createdAt: string;
  productColors: ProductColor[];
  discount: Discount | null;
  subcategory?: {
    id: number;
    name: string;
    enabled: boolean;
    videos: string[];
    category?: {
      id: number;
      name: string;
      gender: 'male' | 'female';
      displayOrder: number;
      enabled: boolean;
      image: string;
    };
  };
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

interface ProductsGalleryProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: {
    title: string;
    subtitle: string;
  };
}

// Helper functions
const isProductNew = (createdAt: string): boolean => {
  const productDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - productDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= DAYS_TO_CONSIDER_NEW;
};

const getProductImage = (multimedia: string[]): string => {
  // Find first image (not video)
  const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const image = multimedia.find((url) =>
    imageFormats.some((format) => url.toLowerCase().includes(format)),
  );
  return image || '/images/placeholder.jpg';
};

export const transformProductsToClothesItems = (
  products: Product[],
): ClothesItem[] => {
  // Guard against non-array inputs
  if (!Array.isArray(products)) {
    console.warn(
      'transformProductsToClothesItems: products is not an array',
      products,
    );
    return [];
  }

  return products
    .filter((product) => product.enabled && product.productColors.length > 0)
    .map((product) => {
      const {
        price: roundedBasePrice,
        discountPercent,
        finalPrice,
      } = calculatePrice(product.price, product.discount);

      return {
        productId: product.id,
        src: getProductImage(product.productColors[0]?.multimedia || []),
        name: product.name,
        price: roundedBasePrice,
        colors: product.productColors
          .filter((pc) => pc.color)
          .map((pc) => pc.color.code),
        isNew: isProductNew(product.createdAt),
        discount: discountPercent,
        finalPrice: finalPrice,
      };
    });
};

export default function ProductsGallery({
  products,
  loading = false,
  error = null,
  emptyMessage = {
    title: 'Lo sentimos — pronto traeremos estas prendas.',
    subtitle: 'Mientras tanto, mira otras categorías o regresa pronto.',
  },
}: ProductsGalleryProps) {
  const isMobile = useIsMobile();

  // Transform API data to component format
  const clothesData = useMemo(() => {
    // Ensure products is an array before transforming
    if (!Array.isArray(products)) {
      console.warn('ProductsGallery: products prop is not an array', products);
      return [];
    }
    return transformProductsToClothesItems(products);
  }, [products]);

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

  return (
    <section
      className="w-full"
      style={{
        paddingLeft: isMobile ? 0 : '0.35rem',
        paddingRight: isMobile ? 0 : '0.35rem',
        paddingTop: '0.35rem',
      }}
    >
      {clothesData.length === 0 ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-700 text-lg font-medium">
              {emptyMessage.title}
            </p>
            <p className="text-gray-500 mt-2">{emptyMessage.subtitle}</p>
          </div>
        </div>
      ) : (
        <div
          className={`w-full grid gap-1 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}
          style={{ alignItems: 'start' }}
        >
          {clothesData.map((item) => (
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
  );
}
