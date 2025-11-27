import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import {
  fetchSliders,
  fetchCategories,
  fetchOutfits,
} from '@/store/clothingSlice';

/**
 * Custom hook for managing gender page data
 * Follows Single Responsibility Principle - handles only gender page data loading
 * Implements priority loading: sliders and categories first, then outfits
 */
export const useGenderPageData = (gender: 'male' | 'female') => {
  const dispatch = useDispatch<AppDispatch>();

  // Track what has been initiated to prevent duplicate API calls
  const loadingInitiated = useRef({
    sliders: new Set<string>(),
    categories: new Set<string>(),
    outfits: new Set<string>(),
  });

  // Selectors for different data types
  const sliders = useSelector((state: RootState) => state.clothing.sliders);
  const categories = useSelector(
    (state: RootState) => state.clothing.categories
  );
  const outfits = useSelector((state: RootState) => state.clothing.outfits);

  // Loading states
  const slidersLoading = useSelector(
    (state: RootState) => state.clothing.slidersLoading
  );
  const categoriesLoading = useSelector(
    (state: RootState) => state.clothing.categoriesLoading
  );
  const outfitsLoading = useSelector(
    (state: RootState) => state.clothing.outfitsLoading
  );

  // Error state
  const error = useSelector((state: RootState) => state.clothing.error);

  // Filter data for current gender
  const genderSliders = sliders.filter((slider) => slider.gender === gender);
  const genderCategories = categories.filter(
    (category) => category.gender === gender && category.enabled
  );
  const genderOutfits = outfits.filter((outfit) => outfit.gender === gender);

  // Priority loading effect - only runs once per gender
  useEffect(() => {
    console.log('🔍 Checking priority data loading for gender:', gender);
    console.log(
      '📊 Current sliders:',
      sliders.length,
      'Categories:',
      categories.length
    );

    const needsSliders =
      !sliders.some((s) => s.gender === gender) &&
      !loadingInitiated.current.sliders.has(gender);
    const needsCategories =
      !categories.some((c) => c.gender === gender) &&
      !loadingInitiated.current.categories.has(gender);

    console.log(
      '🎯 Needs sliders:',
      needsSliders,
      'Needs categories:',
      needsCategories
    );

    if (needsSliders) {
      console.log('🚀 Dispatching fetchSliders for gender:', gender);
      loadingInitiated.current.sliders.add(gender);
      dispatch(fetchSliders(gender));
    }

    if (needsCategories) {
      console.log('🚀 Dispatching fetchCategories for gender:', gender);
      loadingInitiated.current.categories.add(gender);
      dispatch(fetchCategories(gender));
    }
  }, [dispatch, gender, sliders, categories]);

  // Lower priority loading effect - load outfits after priority data
  useEffect(() => {
    const needsOutfits =
      !outfits.some((o) => o.gender === gender) &&
      !loadingInitiated.current.outfits.has(gender);
    const priorityDataLoaded = !slidersLoading && !categoriesLoading;

    if (needsOutfits && priorityDataLoaded) {
      loadingInitiated.current.outfits.add(gender);

      const timer = setTimeout(() => {
        dispatch(fetchOutfits(gender));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [dispatch, gender, outfits, slidersLoading, categoriesLoading]);

  return {
    // Filtered data for current gender
    sliders: genderSliders,
    categories: genderCategories,
    outfits: genderOutfits,
    // Loading states
    priorityDataLoading: slidersLoading || categoriesLoading,
    outfitsLoading,
    allDataLoaded: !slidersLoading && !categoriesLoading && !outfitsLoading,
    // Error state
    error,
    // Helper flags
    hasPriorityData: genderSliders.length > 0 || genderCategories.length > 0,
    hasOutfits: genderOutfits.length > 0,
  };
};

/**
 * Custom hook for managing category data specifically
 * Follows Single Responsibility Principle - handles only category operations
 */
export const useCategoriesData = (gender?: 'male' | 'female') => {
  const categories = useSelector(
    (state: RootState) => state.clothing.categories
  );
  const categoriesLoading = useSelector(
    (state: RootState) => state.clothing.categoriesLoading
  );

  // Filter and sort categories
  const filteredCategories = categories
    .filter((category) => {
      if (gender && category.gender !== gender) return false;
      return category.enabled;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Get categories with their subcategories
  const categoriesWithSubcategories = filteredCategories.map((category) => ({
    ...category,
    subcategories: category.subcategories.filter((sub) => sub.enabled),
  }));

  return {
    categories: filteredCategories,
    categoriesWithSubcategories,
    loading: categoriesLoading,
    totalCategories: filteredCategories.length,
    hasCategories: filteredCategories.length > 0,
  };
};

/**
 * Custom hook for managing slider data specifically
 * Follows Single Responsibility Principle - handles only slider operations
 */
export const useSlidersData = (
  gender?: 'male' | 'female',
  sliderType?: 'desktop' | 'mobile'
) => {
  const sliders = useSelector((state: RootState) => state.clothing.sliders);
  const slidersLoading = useSelector(
    (state: RootState) => state.clothing.slidersLoading
  );

  // Filter sliders
  const filteredSliders = sliders.filter((slider) => {
    if (gender && slider.gender !== gender) return false;
    if (sliderType && slider.slider_type !== sliderType) return false;
    return true;
  });

  return {
    sliders: filteredSliders,
    loading: slidersLoading,
    totalSliders: filteredSliders.length,
    hasSliders: filteredSliders.length > 0,
    desktopSliders: filteredSliders.filter((s) => s.slider_type === 'desktop'),
    mobileSliders: filteredSliders.filter((s) => s.slider_type === 'mobile'),
  };
};
