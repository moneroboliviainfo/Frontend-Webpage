import { API_URL } from '@/config/env';

export interface CybersourceBilling {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isLoggedIn: boolean;
  isRepeatCustomer: boolean;
}

export interface CheckoutParamsRequest {
  orderId: number;
  cardFirst4: string;
  deviceFingerprintId: string;
  billing: CybersourceBilling;
}

// Signed fields returned by the backend, used to build the hidden form submitted to Cybersource
export type CheckoutParamsResponse = Record<string, string>;

// Update the order with the card BIN and get the signed Cybersource checkout params
export const getCybersourceCheckoutParams = async (
  data: CheckoutParamsRequest,
): Promise<CheckoutParamsResponse> => {
  const response = await fetch(`${API_URL}payments/card/checkout-params`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to prepare payment: ${response.statusText}`,
    );
  }

  return response.json();
};
