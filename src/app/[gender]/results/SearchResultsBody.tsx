'use client';
import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config/env';
import ProductsGallery, { Product } from '@/components/ProductsGallery';
import SearchResultsNavBar from './SearchResultsNavBar';

interface SearchResultsBodyProps {
  gender: string;
  searchQuery: string;
}

export default function SearchResultsBody({
  gender,
  searchQuery,
}: SearchResultsBodyProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}searchs/advanced?search=${encodeURIComponent(searchQuery)}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // The API returns an object with data property containing the products array
        const response_data = await response.json();
        console.log('Search API response:', response_data); // Debug log

        // Extract the data array from the response
        const data: Product[] = response_data?.data || [];

        // Ensure we have an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn('API response data is not an array:', data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const emptyMessage = {
    title: searchQuery
      ? `No encontramos resultados para "${searchQuery}"`
      : 'No hay términos de búsqueda',
    subtitle: searchQuery
      ? 'Intenta con palabras diferentes o explora nuestras categorías.'
      : 'Escribe algo en el buscador para ver resultados.',
  };

  return (
    <>
      <SearchResultsNavBar
        gender={gender}
        searchQuery={searchQuery}
        resultsCount={loading ? undefined : products.length}
      />
      <ProductsGallery
        products={products}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
      />
    </>
  );
}
