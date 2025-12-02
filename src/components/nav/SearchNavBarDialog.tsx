import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiTag, FiAlertCircle } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';
import './SearchDropdown.css';

import type { AppDispatch } from '../../store/store';
import { fetchMostSearched } from '../../store/clothingSlice';
import type { RootState } from '../../store/store';
import NavBarDialog from './NavBarDialog';
import MostSearchedPills from '../MostSearchedPills';

// Types for search API response
interface SearchProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  enabled: boolean;
  createdAt: string;
  subcategory: {
    id: number;
    name: string;
    enabled: boolean;
    videos: string[];
    category: {
      id: number;
      name: string;
      gender: 'male' | 'female';
      displayOrder: number;
      enabled: boolean;
      image: string | null;
    };
  };
}

interface SearchResponse {
  data: SearchProduct[];
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

const iconSize = 20;
const iconStrokeWidth = 1.8;

const SearchNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const mostSearched = useSelector(
    (state: RootState) => state.clothing.mostSearched
  );
  const loading = useSelector((state: RootState) => state.clothing.loading);
  const error = useSelector((state: RootState) => state.clothing.error);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(false);

  // Search state
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearchedWithNoResults, setHasSearchedWithNoResults] =
    useState(false);

  // Refs for debouncing and cancelling requests
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const pathname = usePathname();

  // Function to get current gender from URL path for suggestion navigation
  const getCurrentGender = useCallback((): 'male' | 'female' => {
    const p = pathname || window.location.pathname;
    return p.includes('/men') ? 'male' : 'female';
  }, [pathname]);

  // Get page gender only when the top-level path is `men` or `women`.
  // Returns 'male'|'female' or undefined when the page is not a gender route.
  const getPageGenderOrNull = useCallback((): 'male' | 'female' | undefined => {
    const p = pathname || window.location.pathname || '';
    const segments = p.split('/').filter(Boolean);
    const first = segments[0];
    if (first === 'men') return 'male';
    if (first === 'women') return 'female';
    return undefined;
  }, [pathname]);

  // Function to extract unique suggestions from search response
  const extractSuggestions = useCallback(
    (response: SearchResponse): string[] => {
      const currentGender = getCurrentGender();
      const categories = new Set<string>();
      const subcategories = new Set<string>();

      // Extract categories and subcategories, filtering by gender
      response.data.forEach((product) => {
        // Only include products whose category matches the current page gender
        if (product.subcategory?.category?.gender === currentGender) {
          if (product.subcategory.category.name) {
            categories.add(product.subcategory.category.name.toLowerCase());
          }
          if (product.subcategory.name) {
            subcategories.add(product.subcategory.name.toLowerCase());
          }
        }
      });

      // Create mixed array with categories taking priority
      const mixedSuggestions = new Set<string>();

      // Add categories first (they have priority)
      categories.forEach((category) => mixedSuggestions.add(category));

      // Add subcategories only if not already present (case-insensitive)
      subcategories.forEach((subcategory) => {
        if (!mixedSuggestions.has(subcategory)) {
          mixedSuggestions.add(subcategory);
        }
      });

      // Convert to array, capitalize first letter, and return top 10
      return Array.from(mixedSuggestions)
        .map(
          (suggestion) =>
            suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
        )
        .slice(0, 10);
    },
    [getCurrentGender]
  );

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        setHasSearchedWithNoResults(false);
        return;
      }

      try {
        setIsSearching(true);
        setHasSearchedWithNoResults(false);

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const response = await fetch(
          `https://api.moneroget.com/api/searchs/advanced?search=${encodeURIComponent(
            query
          )}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data: SearchResponse = await response.json();
        const suggestions = extractSuggestions(data);

        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);

        // Set no results state if search was performed but no suggestions found
        setHasSearchedWithNoResults(suggestions.length === 0);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchSuggestions([]);
          setShowSuggestions(false);
          setHasSearchedWithNoResults(true);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [extractSuggestions]
  );

  // Handle input change with debouncing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for 400ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 400);
    },
    [performSearch]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      const encodedSearch = encodeURIComponent(suggestion);
      // Get gender from current path
      const currentGender = getCurrentGender() === 'male' ? 'men' : 'women';
      router.push(`/${currentGender}/results?search=${encodedSearch}`);
      setOpen(false);
    },
    [router, setOpen, getCurrentGender]
  );

  // Handle input blur with delay to allow suggestion clicks
  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [searchSuggestions.length]);

  useEffect(() => {
    // Whenever the dialog is open and the path (which may include gender) changes,
    // request the most searched list from the backend. This ensures results
    // reflect navigation between /women and /men routes even when the dialog stays open.
    if (open) {
      const pageGender = getPageGenderOrNull();
      dispatch(fetchMostSearched(pageGender));
    }
  }, [open, pathname, dispatch, getPageGenderOrNull]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (open) {
      timeout = setTimeout(() => setFocus(true), 200);
    } else {
      setFocus(false);
    }
    return () => timeout && clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (open && focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, focus]);

  // Cleanup search timeouts and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset search state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchValue('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setHasSearchedWithNoResults(false);

      // Clear any pending search requests
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]); // elegir la portada mediante el color para cada producto
  // revisar las tallas
  // pasar a Belen lo que necesitamos

  return (
    <NavBarDialog open={open} setOpen={setOpen}>
      <div
        className="flex flex-col items-center h-[70vh]"
        style={{
          background: 'var(--color-white)',
        }}
      >
        {/* Search input section */}
        <div
          className="flex w-full justify-center items-center gap-1"
          style={{ padding: '1rem' }}
        >
          <div className="relative w-[100%]">
            <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <FiSearch
                size={iconSize}
                strokeWidth={iconStrokeWidth}
                style={{ marginLeft: '0.8rem' }}
              />
            </span>
            {isSearching && (
              <span className="absolute inset-y-0 right-0 flex items-center">
                <div className="search-loading-spinner"></div>
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => {
                setFocus(true);
                handleInputFocus();
              }}
              onBlur={() => {
                setFocus(false);
                handleInputBlur();
              }}
              placeholder="Escribe aquí..."
              className="focus:outline-none focus:ring-2 focus:ring-primary text-lg w-full"
              style={{
                borderRadius: '0.375rem',
                paddingLeft: '2.5rem', // pl-10
                paddingRight: '1rem', // pr-4
                paddingTop: '0.5rem', // py-3
                paddingBottom: '0.5rem', // py-3
                border: '1px solid var(--color-gray-border)', // border-gray-300
              }}
              autoFocus
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-dropdown">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="search-suggestion"
                  >
                    <FiTag className="search-suggestion-icon" />
                    <span className="search-suggestion-text">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="rounded-lg text-black font-bold hover:bg-gray-300 transition"
            style={{
              width: '20%',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              cursor: 'pointer',
            }}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
        </div>

        {/* No Results Message - Moved outside input container to prevent layout shifts */}
        {hasSearchedWithNoResults &&
          searchValue.length >= 3 &&
          !isSearching && (
            <div
              className="flex items-center gap-2 mx-4 mb-4 px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg"
              style={{ width: 'calc(100% - 2rem)' }}
            >
              <FiAlertCircle className="text-red-500 flex-shrink-0" size={18} />
              <span className="text-sm font-medium">
                No se encontraron resultados para &quot;{searchValue}&quot;
              </span>
            </div>
          )}
        {/* Most Searched section */}
        <div
          className="w-full justify-center items-center gap-1"
          style={{
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '0.5rem',
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ marginBottom: '1rem' }}
          >
            Más buscados
          </h3>
          {loading && <div className="text-gray-500">Cargando...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && mostSearched.length > 0 && (
            <MostSearchedPills onPillClick={() => setOpen(false)} />
          )}
        </div>
      </div>
    </NavBarDialog>
  );
};

export default SearchNavBarDialog;
