import { apiFetch } from '@/shared/api/client';

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

export const createAddress = (
  addressData: CreateAddressRequest
): Promise<AddressResponse> =>
  apiFetch<AddressResponse>('addresses', {
    method: 'POST',
    body: addressData,
    auth: true,
    errorMessage: 'Failed to create address',
  });

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
