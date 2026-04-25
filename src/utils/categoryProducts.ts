import { Product } from '@/components/ProductsGallery';

interface Subcategory {
  id: number;
  name: string;
  enabled: boolean;
  videos: string[];
  products: Product[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  gender: 'male' | 'female';
  displayOrder: number;
  enabled: boolean;
  image: string;
  subcategories: Subcategory[];
}

/**
 * Extracts all enabled products from category data
 */
export function extractProductsFromCategory(
  categoryData: CategoryResponse | null,
): Product[] {
  if (!categoryData) return [];

  const products: Product[] = [];
  categoryData.subcategories.forEach((subcategory) => {
    if (!subcategory.enabled) return;
    subcategory.products.forEach((product) => {
      // Ensure productColors are ordered by id ascending (lowest id first)
      if (
        Array.isArray(product.productColors) &&
        product.productColors.length > 0
      ) {
        product.productColors.sort((a, b) => a.id - b.id);
      }

      if (product.enabled && product.productColors.length > 0) {
        products.push(product);
      }
    });
  });

  return products;
}

/**
 * Category IDs for accessories
 */
export const ACCESSORIES_CATEGORY_IDS = {
  men: 17,
  women: 30,
} as const;
