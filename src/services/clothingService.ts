import { API_URL } from '@/config/env';
import type {
  Slider,
  Category,
  Outfit,
  MostSearchedItem,
} from '@/store/clothingSlice';

/**
 * Service class for handling clothing-related API calls
 * Follows Single Responsibility Principle - handles only API communication
 */
export class ClothingApiService {
  private static baseUrl = API_URL;

  /**
   * Fetch sliders from the API
   * @param gender Optional gender filter
   * @returns Promise<Slider[]>
   */
  static async fetchSliders(gender?: 'male' | 'female'): Promise<Slider[]> {
    const params = gender ? `?gender=${gender}` : '';
    const url = `${this.baseUrl}sliders${params}`;

    console.log('🌐 Fetching sliders from:', url);

    const response = await fetch(url);

    console.log('📡 Sliders API response status:', response.status);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch sliders: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('📋 Sliders data received:', data);

    return data;
  }

  /**
   * Fetch categories from the API
   * @param gender Optional gender filter
   * @returns Promise<Category[]>
   */
  static async fetchCategories(
    gender?: 'male' | 'female'
  ): Promise<Category[]> {
    const params = gender ? `?gender=${gender}` : '';
    const response = await fetch(`${this.baseUrl}categories${params}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch outfits from the API
   * @param gender Optional gender filter
   * @returns Promise<Outfit[]>
   */
  static async fetchOutfits(gender?: 'male' | 'female'): Promise<Outfit[]> {
    const params = gender ? `?gender=${gender}` : '';
    const response = await fetch(`${this.baseUrl}outfits${params}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch outfits: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch most searched items from the API
   * @returns Promise<MostSearchedItem[]>
   */
  static async fetchMostSearched(): Promise<MostSearchedItem[]> {
    const response = await fetch(`${this.baseUrl}searchs`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch most searched: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}

/**
 * Utility functions for data transformation
 * Follows Single Responsibility Principle - handles only data transformation
 */
export class ClothingDataUtils {
  /**
   * Filter sliders by type and gender
   */
  static filterSliders(
    sliders: Slider[],
    type?: 'desktop' | 'mobile',
    gender?: 'male' | 'female'
  ): Slider[] {
    return sliders.filter((slider) => {
      if (type && slider.slider_type !== type) return false;
      if (gender && slider.gender !== gender) return false;
      return true;
    });
  }

  /**
   * Filter categories by gender and enabled status
   */
  static filterCategories(
    categories: Category[],
    gender?: 'male' | 'female',
    enabledOnly = true
  ): Category[] {
    return categories
      .filter((category) => {
        if (enabledOnly && !category.enabled) return false;
        if (gender && category.gender !== gender) return false;
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Get subcategories for a specific category
   */
  static getSubcategoriesForCategory(
    category: Category,
    enabledOnly = true
  ): typeof category.subcategories {
    return category.subcategories.filter((sub) => !enabledOnly || sub.enabled);
  }
}

/**
 * Constants for API endpoints and common parameters
 * Follows DRY principle - centralizes configuration
 */
export const CLOTHING_API_CONSTANTS = {
  ENDPOINTS: {
    SLIDERS: 'sliders',
    CATEGORIES: 'categories',
    OUTFITS: 'outfits',
    SEARCHES: 'searchs',
  },
  GENDERS: {
    MALE: 'male' as const,
    FEMALE: 'female' as const,
  },
  SLIDER_TYPES: {
    DESKTOP: 'desktop' as const,
    MOBILE: 'mobile' as const,
  },
} as const;
