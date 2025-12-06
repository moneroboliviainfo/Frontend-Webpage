'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { GenderStorage } from '@/utils/genderStorage';
import {
  fetchSliders,
  fetchCategories,
  fetchOutfits,
  fetchSearchRecommendations,
} from '@/store/clothingSlice';

interface GenderPageDataLoaderProps {
  gender: string;
  children: React.ReactNode;
}

/**
 * Data loader component that handles API calls at the page level
 * Shows loading state until essential data is loaded
 */
const GenderPageDataLoader: React.FC<GenderPageDataLoaderProps> = ({
  gender,
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Store gender in localStorage for navbar redirect
  useEffect(() => {
    GenderStorage.storeGender(gender);
  }, [gender]);

  // Use refs to track what we've already dispatched to prevent duplicate calls
  const dispatchedRef = useRef({
    sliders: new Set<string>(),
    categories: new Set<string>(),
    outfits: new Set<string>(),
    searchRecommendations: new Set<string>(),
  });

  // Convert gender string to API format
  const apiGender: 'male' | 'female' = gender === 'men' ? 'male' : 'female';

  // Selectors for loading states
  const slidersLoading = useSelector(
    (state: RootState) => state.clothing.slidersLoading
  );
  const categoriesLoading = useSelector(
    (state: RootState) => state.clothing.categoriesLoading
  );

  // Selectors for data
  const sliders = useSelector((state: RootState) => state.clothing.sliders);
  const categories = useSelector(
    (state: RootState) => state.clothing.categories
  );

  // Check if we have data for this gender
  const hasSliderData = sliders.some((slider) => slider.gender === apiGender);
  const hasCategoryData = categories.some(
    (category) => category.gender === apiGender
  );

  // Trigger API calls on mount - only run once per gender
  useEffect(() => {
    // Check current state
    const currentHasSliderData = sliders.some(
      (slider) => slider.gender === apiGender
    );
    const currentHasCategoryData = categories.some(
      (category) => category.gender === apiGender
    );

    const needSliders =
      !currentHasSliderData && !dispatchedRef.current.sliders.has(apiGender);
    const needCategories =
      !currentHasCategoryData &&
      !dispatchedRef.current.categories.has(apiGender);

    if (needSliders) {
      dispatch(fetchSliders(apiGender));
      dispatchedRef.current.sliders.add(apiGender);
    }

    if (needCategories) {
      dispatch(fetchCategories(apiGender));
      dispatchedRef.current.categories.add(apiGender);
    }

    // Mark as initialized
    if (
      needSliders ||
      needCategories ||
      currentHasSliderData ||
      currentHasCategoryData
    ) {
      setHasInitialized(true);
    }

    // Load search recommendations (only once for male gender)
    if (!dispatchedRef.current.searchRecommendations.has('male')) {
      dispatch(fetchSearchRecommendations('male'));
      dispatchedRef.current.searchRecommendations.add('male');
    }

    // Load outfits after a short delay (lower priority)
    if (!dispatchedRef.current.outfits.has('all')) {
      const timer = setTimeout(() => {
        dispatch(fetchOutfits());
        dispatchedRef.current.outfits.add('all');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [dispatch, apiGender, sliders, categories]); // Include sliders and categories to react to state changes

  // Clear dispatched tracking when component unmounts
  useEffect(() => {
    const currentDispatchedRef = dispatchedRef.current;
    return () => {
      currentDispatchedRef.sliders.clear();
      currentDispatchedRef.categories.clear();
      currentDispatchedRef.outfits.clear();
    };
  }, []);

  // Determine if we should show loading
  const shouldShowLoading =
    !hasInitialized ||
    (hasInitialized &&
      (slidersLoading || categoriesLoading) &&
      !hasSliderData &&
      !hasCategoryData);

  // Handle loading to content transition
  const dataIsReady =
    hasInitialized &&
    (hasSliderData || hasCategoryData) &&
    !slidersLoading &&
    !categoriesLoading;

  // Start fade-out transition when data is ready
  useEffect(() => {
    if (dataIsReady && shouldShowLoading && !isTransitioning) {
      console.log('✨ Starting fade-out transition');
      setIsTransitioning(true);
    }
  }, [dataIsReady, shouldShowLoading, isTransitioning]);

  // Show loading screen during loading or transitioning
  if (shouldShowLoading || isTransitioning) {
    return (
      <LoadingScreen
        message="Cargando contenido..."
        backgroundColor="rgba(255, 255, 255, 0.95)"
        isVisible={shouldShowLoading}
        onFadeComplete={() => {
          console.log('✅ Fade-out animation completed');
          setIsTransitioning(false);
        }}
        fadeDuration={600}
      />
    );
  }

  // Render children when data is ready
  return <>{children}</>;
};

export default GenderPageDataLoader;
