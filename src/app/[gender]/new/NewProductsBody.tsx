'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '@/config/env';
import { DAYS_TO_CONSIDER_NEW } from '@/constants/clothes';
import ProductsGallery, { Product } from '@/components/ProductsGallery';
import NewProductsNavBar from './NewProductsNavBar';
import LoadingMore from '@/components/LoadingMore/LoadingMore';

interface NewProductsBodyProps {
  gender: string;
}

interface NewProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function NewProductsBody({ gender }: NewProductsBodyProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState<number | null>(null);

  // Refs to track current state without causing dependency issues
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);
  const hasNextPageRef = useRef(hasNextPage);
  const currentPageRef = useRef(currentPage);
  const isLoadingPageRef = useRef(isLoadingPage);
  // Track pages currently being fetched to avoid duplicate requests
  const pagesFetchingRef = useRef<Set<number>>(new Set());

  // Update refs when state changes
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
  }, [hasNextPage]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    isLoadingPageRef.current = isLoadingPage;
  }, [isLoadingPage]);

  // Helper function to normalize gender for API filtering
  const normalizeGenderForFiltering = (genderParam: string) => {
    const normalized = genderParam.toLowerCase();
    if (
      normalized === 'men' ||
      normalized === 'hombres' ||
      normalized === 'male'
    ) {
      return 'male';
    } else if (
      normalized === 'women' ||
      normalized === 'mujeres' ||
      normalized === 'female'
    ) {
      return 'female';
    }
    return 'female'; // default fallback
  };

  // Fetch new products
  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      // Prevent duplicate requests for the same page using the in-flight set
      if (pagesFetchingRef.current.has(page)) {
        console.log(
          `Already fetching page ${page}, skipping duplicate request`
        );
        return;
      }

      // Mark page as fetching
      pagesFetchingRef.current.add(page);

      try {
        setIsLoadingPage(page);

        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(
          `${API_URL}products?days=${DAYS_TO_CONSIDER_NEW}&page=${page}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const responseData: NewProductsResponse = await response.json();
        console.log('New products API response:', responseData);

        // Filter products by gender
        const targetGender = normalizeGenderForFiltering(gender);
        const filteredProducts = responseData.data.filter(
          (product) =>
            product.subcategory?.category?.gender === targetGender &&
            product.enabled &&
            product.productColors.length > 0
        );

        if (append) {
          setProducts((prev) => {
            // Create a Set of existing product IDs to avoid duplicates
            const existingIds = new Set(prev.map((product) => product.id));
            const newUniqueProducts = filteredProducts.filter(
              (product) => !existingIds.has(product.id)
            );
            return [...prev, ...newUniqueProducts];
          });
        } else {
          setProducts(filteredProducts);
          setTotalCount(responseData.meta.total);
        }

        setHasNextPage(responseData.meta.hasNextPage);
        setCurrentPage(responseData.meta.page);
      } catch (err) {
        console.error('Error fetching new products:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        // Clear loading flags and remove page from in-flight set
        setLoading(false);
        setLoadingMore(false);
        setIsLoadingPage(null);
        pagesFetchingRef.current.delete(page);
      }
    },
    [gender]
  );

  // Initial load
  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasNextPage(true);
    setIsLoadingPage(null);
    fetchProducts(1, false);
  }, [gender]); // Remove fetchProducts dependency

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loadingRef.current &&
        !loadingMoreRef.current &&
        hasNextPageRef.current &&
        isLoadingPageRef.current === null // Prevent duplicate requests
      ) {
        fetchProducts(currentPageRef.current + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array - use refs for state access

  const emptyMessage = {
    title: 'No hay novedades disponibles',
    subtitle:
      'Vuelve pronto para ver los últimos productos que hemos agregado.',
  };

  return (
    <>
      <NewProductsNavBar
        gender={gender}
        productsCount={loading ? undefined : totalCount}
      />
      <ProductsGallery
        products={products}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
      />

      {/* Loading more indicator */}
      {loadingMore && <LoadingMore />}

      {/* End of results message */}
      {!loading && !loadingMore && !hasNextPage && products.length > 0 && (
        <div className="w-full flex justify-center py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="#16302b"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Has visto todas las novedades!
            </h3>
            <p className="text-gray-600">
              No hay más productos nuevos por ahora. Vuelve pronto para ver más
              novedades.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
