'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '@/config/env';
import ProductsGallery, { Product } from '@/components/ProductsGallery';
import NewProductsNavBar from '../new/NewProductsNavBar';
import LoadingMore from '@/components/LoadingMore/LoadingMore';

interface DiscountsBodyProps {
  gender: string;
}

interface DiscountsResponse {
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

export default function DiscountsBody({ gender }: DiscountsBodyProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState<number | null>(null);

  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);
  const hasNextPageRef = useRef(hasNextPage);
  const currentPageRef = useRef(currentPage);
  const isLoadingPageRef = useRef(isLoadingPage);
  const pagesFetchingRef = useRef<Set<number>>(new Set());

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
    return 'female';
  };

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (pagesFetchingRef.current.has(page)) return;
      pagesFetchingRef.current.add(page);

      try {
        setIsLoadingPage(page);

        if (append) setLoadingMore(true);
        else setLoading(true);

        setError(null);

        const response = await fetch(
          `${API_URL}products?discounts=true&page=${page}`,
        );
        if (!response.ok)
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        const responseData: DiscountsResponse = await response.json();

        const targetGender = normalizeGenderForFiltering(gender);
        const now = new Date();

        // TODO: remove this client-side discount date filter once the backend
        // guarantees it only returns products whose discount dates are valid
        // (backend should not return clothes with null/expired discounts).
        const isDiscountActive = (product: Product) => {
          const disc: any = (product as any).discount;
          if (disc == null) return false;
          const start = new Date(disc.startDate);
          const end = new Date(disc.endDate);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
          return now >= start && now <= end;
        };

        const filteredProducts = responseData.data.filter(
          (product) =>
            product.subcategory?.category?.gender === targetGender &&
            product.enabled &&
            product.productColors.length > 0 &&
            // require a discount object and that it's currently active
            isDiscountActive(product),
        );

        if (append) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = filteredProducts.filter(
              (p) => !existingIds.has(p.id),
            );
            return [...prev, ...newUnique];
          });
        } else {
          setProducts(filteredProducts);
          setTotalCount(responseData.meta.total);
        }

        setHasNextPage(responseData.meta.hasNextPage);
        setCurrentPage(responseData.meta.page);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsLoadingPage(null);
        pagesFetchingRef.current.delete(page);
      }
    },
    [gender],
  );

  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasNextPage(true);
    setIsLoadingPage(null);
    fetchProducts(1, false);
  }, [gender]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loadingRef.current &&
        !loadingMoreRef.current &&
        hasNextPageRef.current &&
        isLoadingPageRef.current === null
      ) {
        fetchProducts(currentPageRef.current + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const emptyMessage = {
    title: 'No hay descuentos disponibles',
    subtitle: 'Vuelve pronto para ver las últimas ofertas y descuentos.',
  };

  return (
    <>
      <NewProductsNavBar
        gender={gender}
        productsCount={loading ? undefined : totalCount}
        variant="discounts"
      />
      <ProductsGallery
        products={products}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
      />

      {loadingMore && <LoadingMore />}

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
              ¡Has visto todas las ofertas!
            </h3>
            <p className="text-gray-600">
              No hay más productos en promoción por ahora. Vuelve pronto para
              ver más descuentos.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
