import { API_URL } from '@/config/env';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ClothingApiService } from '@/services/clothingService';

// Types for sliders
export interface Slider {
  id: number;
  name: string;
  image: string;
  button_text: string;
  url: string;
  slider_type: 'desktop' | 'mobile';
  gender: 'male' | 'female';
}

// Types for categories with subcategories
export interface Subcategory {
  id: number;
  name: string;
  enabled: boolean;
  videos: string[];
}

export interface Category {
  id: number;
  name: string;
  gender: 'male' | 'female';
  displayOrder: number;
  enabled: boolean;
  subcategories: Subcategory[];
}

// Legacy types for backwards compatibility
export interface LegacyCategory {
  id: string;
  name: string;
}

export interface LegacySubcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface MostSearchedItem {
  id: number;
  name: string;
  searchCount: number;
}

// Outfit type for future API call
export interface Outfit {
  id: number;
  name: string;
  gender: 'male' | 'female';
  items: string[];
  image: string;
}

interface ClothingState {
  sliders: Slider[];
  categories: Category[];
  outfits: Outfit[];
  // Legacy fields for backwards compatibility
  legacyCategories: LegacyCategory[];
  subcategories: LegacySubcategory[];
  mostSearched: MostSearchedItem[];
  loading: boolean;
  error: string | null;
  // Loading states for different data types
  slidersLoading: boolean;
  categoriesLoading: boolean;
  outfitsLoading: boolean;
}

const initialState: ClothingState = {
  sliders: [],
  categories: [],
  outfits: [],
  // Legacy fields for backwards compatibility
  legacyCategories: [],
  subcategories: [],
  mostSearched: [],
  loading: false,
  error: null,
  // Loading states for different data types
  slidersLoading: false,
  categoriesLoading: false,
  outfitsLoading: false,
};

// Async thunk to fetch sliders
export const fetchSliders = createAsyncThunk(
  'clothing/fetchSliders',
  async (gender?: 'male' | 'female') => {
    return await ClothingApiService.fetchSliders(gender);
  }
);

// Async thunk to fetch categories
export const fetchCategories = createAsyncThunk(
  'clothing/fetchCategories',
  async (gender?: 'male' | 'female') => {
    return await ClothingApiService.fetchCategories(gender);
  }
);

// Async thunk to fetch outfits (lower priority)
export const fetchOutfits = createAsyncThunk(
  'clothing/fetchOutfits',
  async (gender?: 'male' | 'female') => {
    return await ClothingApiService.fetchOutfits(gender);
  }
);

// Legacy async thunk to fetch categories and subcategories (for backwards compatibility)
export const fetchCategoriesAndSubcategories = createAsyncThunk(
  'clothing/fetchCategoriesAndSubcategories',
  async () => {
    const response = await fetch('/api/clothing/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories and subcategories');
    }
    // Expected response: { categories: LegacyCategory[], subcategories: LegacySubcategory[] }
    return response.json() as Promise<{
      categories: LegacyCategory[];
      subcategories: LegacySubcategory[];
    }>;
  }
);

// Async thunk to fetch most searched items
export const fetchMostSearched = createAsyncThunk(
  'clothing/fetchMostSearched',
  async () => {
    const response = await fetch(API_URL + 'searchs');
    if (!response.ok) {
      throw new Error('Failed to fetch most searched items');
    }
    // Expected response: { mostSearched: MostSearchedItem[] }
    return response.json();
  }
);

const clothingSlice = createSlice({
  name: 'clothing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Sliders
      .addCase(fetchSliders.pending, (state) => {
        state.slidersLoading = true;
        state.error = null;
      })
      .addCase(fetchSliders.fulfilled, (state, action) => {
        state.sliders = action.payload;
        state.slidersLoading = false;
      })
      .addCase(fetchSliders.rejected, (state, action) => {
        state.slidersLoading = false;
        state.error = action.error.message || 'Failed to fetch sliders';
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Outfits
      .addCase(fetchOutfits.pending, (state) => {
        state.outfitsLoading = true;
        state.error = null;
      })
      .addCase(fetchOutfits.fulfilled, (state, action) => {
        state.outfits = action.payload;
        state.outfitsLoading = false;
      })
      .addCase(fetchOutfits.rejected, (state, action) => {
        state.outfitsLoading = false;
        state.error = action.error.message || 'Failed to fetch outfits';
      })
      // Legacy support
      .addCase(fetchCategoriesAndSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAndSubcategories.fulfilled, (state, action) => {
        state.legacyCategories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
        state.loading = false;
      })
      .addCase(fetchCategoriesAndSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          'Failed to fetch categories and subcategories';
      })
      // Most searched
      .addCase(fetchMostSearched.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMostSearched.fulfilled, (state, action) => {
        state.mostSearched = action.payload;
        state.loading = false;
      })
      .addCase(fetchMostSearched.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch most searched items';
      });
  },
});

export default clothingSlice.reducer;
