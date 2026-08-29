import { API_URL } from '@/config/env';

export interface CybersourceOrderItem {
  name: string;
  price: number;
}

export interface CreateCybersourceOrderRequest {
  paymentType: 'card_online' | 'qr_transfer';
  items: CybersourceOrderItem[];
  totalPrice: string;
}

export interface CreateCybersourceOrderResponse {
  orderId: string;
  totalPrice: string;
  paymentType: string;
  status: string;
  message?: string;
}

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

// STEP 1: Reserve inventory / create the payment order on the Cybersource backend
export const createCybersourceOrder = async (
  data: CreateCybersourceOrderRequest,
): Promise<CreateCybersourceOrderResponse> => {
  const response = await fetch(`${API_URL}orders/online`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to create payment order: ${response.statusText}`,
    );
  }

  return response.json();
};

// STEP 2: Update the order with the card BIN and get the signed Cybersource checkout params
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
