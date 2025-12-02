'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductsGallery, { Product } from '@/components/ProductsGallery';
import ClothesPageNavBar from './ClothesPageNavBar';
import { API_URL } from '@/config/env';

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

export default function ClothesGallery() {
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

  // Transform API data to get all products
  const allProducts = useMemo(() => {
    if (!categoryData) return [];

    const products: Product[] = [];
    categoryData.subcategories.forEach((subcategory) => {
      if (!subcategory.enabled) return;
      subcategory.products.forEach((product) => {
        if (product.enabled && product.productColors.length > 0) {
          products.push(product);
        }
      });
    });

    return products;
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

  const filteredProducts = useMemo(() => {
    if (!selectedSubcategoryId) return allProducts;
    const subcat = categoryData?.subcategories?.find(
      (s) => s.id === selectedSubcategoryId
    );
    if (!subcat) return [];
    return subcat.products.filter(
      (product) => product.enabled && product.productColors.length > 0
    );
  }, [selectedSubcategoryId, allProducts, categoryData]);

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
      <ProductsGallery
        products={filteredProducts}
        loading={loading}
        error={error}
      />
    </>
  );
}
