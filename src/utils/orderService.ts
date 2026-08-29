import { API_URL } from '@/config/env';
import { AuthStorage } from './authStorage';
import { getCart } from './cartStorage';
import { FEATURE_FLAGS } from '@/config/features';
import type { CartItem } from '@/types/cart';

interface CreateOrderRequest {
  items: string; // cart token
  name: string;
  phone: string;
  shipment: number;
  address: number;
  // Payment type: 'qr' or 'card_online'
  payment_type?: 'qr' | 'card_online';
  // Optional fields
  email?: string;
  billing?: {
    ci?: string;
    name?: string;
    phone?: string;
    email?: string;
    complemento?: string;
    codigoTipoDocumentoIdentidad?: number;
  };
}

interface CreateOrderResponse {
  id: number;
  // Add other fields as needed
}

interface GenerateQRResponse {
  qr: string; // base64 image string
  gloss?: string; // optional gloss field
}

export const createOrder = async (
  orderData: CreateOrderRequest,
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
      errorData.message || `Failed to create order: ${response.statusText}`,
    );
  }

  return response.json();
};

/**
 * Check if cart contains any women's clothing items
 * Fetches product details for each cart item to determine gender
 */
const checkForWomenItems = async (cartItems: CartItem[]): Promise<boolean> => {
  try {
    // Fetch product details for each cart item to check gender
    const genderChecks = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const response = await fetch(
            `${API_URL}web-page/products/${item.productId}`,
          );
          if (!response.ok) return false;

          const product = await response.json();
          const gender = product?.subcategory?.category?.gender;

          // Return true if product is female/women
          return gender === 'female';
        } catch (error) {
          console.error('Error checking product gender:', error);
          return false;
        }
      }),
    );

    // Return true if any item is women's clothing
    return genderChecks.some((isWomen) => isWomen);
  } catch (error) {
    console.error('Error checking for women items:', error);
    return false;
  }
};

export const generateQR = async (
  orderId: number,
): Promise<GenerateQRResponse> => {
  // Check if women's section is disabled and cart contains women's items
  if (!FEATURE_FLAGS.WOMEN_ENABLED) {
    const cart = getCart();
    const hasWomenItems = await checkForWomenItems(cart.items);

    if (hasWomenItems) {
      throw new Error(
        'La generación de código QR está temporalmente deshabilitada para prendas de categoría mujeres.',
      );
    }
  }

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
    body: JSON.stringify({ orderId: orderId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to generate QR: ${response.statusText}`,
    );
  }

  return response.json();
};
