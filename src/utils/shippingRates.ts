import { API_URL } from '@/config/env';
import { AuthStorage } from './authStorage';
import type { FedexService, CheckoutFormData } from '@/store/checkoutSlice';

export interface FedexRecipientAddress {
  streetLines: string[];
  cityName: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean;
}

export interface FedexRecipient {
  personName: string;
  emailAddress: string;
  phoneNumber: string;
  address: FedexRecipientAddress;
}

export interface FedexRatesResponse {
  success: boolean;
  fedexShippingToken: string;
  services: FedexService[];
  debugMetadata: {
    calculatedBoxes: number;
    calculatedTotalWeightKg: number;
    boxDimensions: string;
    exchangeRateUSDToBOB: number;
  };
}

// FedEx expects a digits-only phone number (no "+" prefix or spaces)
export const buildFedexPhoneNumber = (
  countryCode: string,
  phone: string,
): string => `${countryCode}${phone}`.replace(/[^\d]/g, '');

export const buildFedexRecipient = (
  formData: CheckoutFormData,
): FedexRecipient => ({
  personName: formData.name,
  emailAddress: formData.email,
  phoneNumber: buildFedexPhoneNumber(formData.countryCode, formData.phone),
  address: {
    streetLines: [formData.streetNumber],
    cityName: formData.city,
    stateOrProvinceCode: formData.stateProvince,
    postalCode: formData.postalCode,
    countryCode: formData.countryIso,
    residential: true,
  },
});

export async function getFedexRates(
  cartToken: string,
  recipient: FedexRecipient,
): Promise<FedexRatesResponse> {
  const token = AuthStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}shipping/rates/${cartToken}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ recipient }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to fetch shipping rates: ${response.statusText}`,
    );
  }

  const data: FedexRatesResponse = await response.json();

  if (!data.success || !data.services || data.services.length === 0) {
    throw new Error(
      'No hay opciones de envío disponibles para esta dirección.',
    );
  }

  return data;
}
