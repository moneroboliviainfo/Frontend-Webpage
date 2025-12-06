import { API_URL } from '@/config/env';
import { AuthStorage } from './authStorage';

interface CreateAddressRequest {
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  type: 'national' | 'international';
  place?: number;
}

interface AddressResponse {
  id: number;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
    type: string;
    provider: string;
  };
  place?: {
    id: number;
  };
}

export const createAddress = async (
  addressData: CreateAddressRequest
): Promise<AddressResponse> => {
  const token = AuthStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}addresses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create address: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Normalize place name from snake_case to Title Case
 * Example: "la_paz" -> "La Paz"
 */
export const normalizePlaceName = (place: string): string => {
  return place
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format address label for display in dropdowns
 * Shows first 2 words of address and normalized place name
 */
export const formatAddressLabel = (
  address: string,
  placeName: string
): string => {
  const addressWords = address.split(' ').slice(0, 2).join(' ');
  const normalizedPlace = normalizePlaceName(placeName);
  return `${addressWords} - ${normalizedPlace}`;
};
