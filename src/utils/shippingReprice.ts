import { API_URL } from '@/config/env';
import { AuthStorage } from './authStorage';
import type { RepriceData } from '@/store/checkoutSlice';

export interface RepricePayload {
  selectedServiceType: string;
}

export async function getShippingReprice(
  fedexShippingToken: string,
  payload: RepricePayload,
): Promise<RepriceData> {
  const token = AuthStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}shipping/reprice/${fedexShippingToken}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to reprice shipping: ${response.statusText}`,
    );
  }

  const data: RepriceData = await response.json();

  return data;
}
