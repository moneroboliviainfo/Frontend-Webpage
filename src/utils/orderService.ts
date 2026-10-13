import { API_URL } from '@/config/env';
import { apiFetch } from '@/shared/api/client';
import { getCart } from './cartStorage';
import { FEATURE_FLAGS } from '@/config/features';
import type { CartItem } from '@/types/cart';

interface CreateOrderRequest {
  items: string; // cart token
  name: string;
  phone: string;
  shipment?: number;
  address: number;
  // When using prepaid FedEx, send the selected service type
  selectedServiceType?: string;
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

export const createOrder = (
  orderData: CreateOrderRequest,
): Promise<CreateOrderResponse> =>
  apiFetch<CreateOrderResponse>('orders/online', {
    method: 'POST',
    body: orderData,
    auth: true,
    errorMessage: 'Failed to create order',
  });

/**
 * Check if cart contains any women's clothing items
 * Fetches product details for each cart item to determine gender
 */
export const checkForWomenItems = async (
  cartItems: CartItem[],
): Promise<boolean> => {
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
  if (!orderId) {
    throw new Error('orderId is required to generate QR');
  }
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

  return apiFetch<GenerateQRResponse>('payments/generate-qr', {
    method: 'POST',
    body: { orderId },
    auth: true,
    errorMessage: 'Failed to generate QR',
  });
};
