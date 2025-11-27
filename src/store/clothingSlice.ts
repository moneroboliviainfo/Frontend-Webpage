import { API_URL } from '@/config/env';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types for categories and subcategories
export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface MostSearchedItem {
  id: number;
  name: string;
  searchCount: number;
}

interface ClothingState {
  categories: Category[];
  subcategories: Subcategory[];
  mostSearched: MostSearchedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ClothingState = {
  categories: [],
  subcategories: [],
  mostSearched: [],
  loading: false,
  error: null,
};

// Async thunk to fetch categories and subcategories
export const fetchCategoriesAndSubcategories = createAsyncThunk(
  'clothing/fetchCategoriesAndSubcategories',
  async () => {
    const response = await fetch('/api/clothing/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories and subcategories');
    }
    // Expected response: { categories: Category[], subcategories: Subcategory[] }
    return response.json() as Promise<{
      categories: Category[];
      subcategories: Subcategory[];
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
      .addCase(fetchCategoriesAndSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAndSubcategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
        state.loading = false;
      })
      .addCase(fetchCategoriesAndSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          'Failed to fetch categories and subcategories';
      })
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
