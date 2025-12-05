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
