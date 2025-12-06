import { API_URL } from '@/config/env';
import { AuthStorage } from './authStorage';

interface CreateOrderRequest {
  items: string; // cart token
  shipment: number;
  address: number;
}

interface CreateOrderResponse {
  id: number;
  // Add other fields as needed
}

interface GenerateQRResponse {
  qr: string; // base64 image string
}

export const createOrder = async (
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const token = AuthStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}orders/online`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create order: ${response.statusText}`
    );
  }

  return response.json();
};

export const generateQR = async (
  orderId: number
): Promise<GenerateQRResponse> => {
  // Temporarily disabled - backend work in progress
  throw new Error(
    'La generación de código QR está temporalmente deshabilitada. Por favor, intenta otro método de pago.'
  );

  /* Disabled until backend is ready
  const token = AuthStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}payments/generate-qr`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ order: orderId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to generate QR: ${response.statusText}`
    );
  }

  return response.json();
  */
};
