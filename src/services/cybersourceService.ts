import { API_URL } from '@/shared/config/env';

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
    // This call renews the order and its stock reservation before the charge,
    // so its failures are about time running out, not about the card.
    // 409: the renewal cap was reached and under 5 minutes are left.
    // 404: the order expired or is no longer PENDING.
    if (response.status === 409) {
      throw new Error(
        'Se agotó el tiempo para pagar esta orden. Volvé a armar tu compra.',
      );
    }
    if (response.status === 404) {
      throw new Error(
        'Tu orden venció o ya no está disponible. Volvé a armar tu compra.',
      );
    }

    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error ||
        errorData?.message ||
        `No se pudo preparar el pago: ${response.statusText}`,
    );
  }

  return response.json();
};
