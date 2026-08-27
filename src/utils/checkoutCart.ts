import { API_URL } from '@/config/env';
import { getCart, saveCart, removeFromCart } from './cartStorage';
import type { Cart, CartItem } from '@/types/cart';

export interface CartApiRequest {
  items: Array<{
    variantId: number;
    quantity: number;
  }>;
}

export interface CartApiResponse {
  cart: Array<{
    variantId: number;
    quantity: number;
    variant: {
      id: number;
      size: {
        id: number;
        name: string;
      };
      productColor: {
        id: number;
        multimedia: string[];
        pdfs: string[];
        color: {
          id: number;
          name: string;
          code: string;
        };
        product: {
          id: number;
          name: string;
          description: string;
          price: string;
          enabled: boolean;
          createdAt: string;
          discount: {
            id?: number;
            description?: string;
            discountType?: string;
            isActive?: boolean;
            startDate?: string | null;
            endDate?: string | null;
            value?: number;
          } | null;
        };
      };
    };
  }>;
  token: string;
}

export interface RepriceItemResponse {
  variantId: number;
  quantity: number;
  unit_price: number;
  discountValue: number;
  totalPrice: string;
}

export interface RepriceSuccessResponse {
  items: RepriceItemResponse[];
  total: string;
}

export interface RepriceErrorResponse {
  message: string;
  variants: number[];
  error: string;
  statusCode: number;
}

/**
 * Create a cart on the backend with variant IDs and quantities
 */
export async function createBackendCart(
  items: Array<{ variantId: number; quantity: number }>
): Promise<CartApiResponse> {
  const response = await fetch(`${API_URL}cart?type=online`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to create cart');
  }

  return response.json();
}

/**
 * Get repricing for cart items
 */
export async function repriceCart(
  token: string
): Promise<RepriceSuccessResponse | RepriceErrorResponse> {
  const response = await fetch(`${API_URL}orders/reprice/${token}?type=online`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Parse variant IDs from message: "Insufficient stock for variants: [643, 644]"
    let variants: number[] = [];
    if (data.message && typeof data.message === 'string') {
      const match = data.message.match(/\[(\d+(?:,\s*\d+)*)\]/);
      if (match && match[1]) {
        variants = match[1]
          .split(',')
          .map((id: string) => parseInt(id.trim(), 10));
      }
    }
    return { ...data, variants } as RepriceErrorResponse;
  }

  return data as RepriceSuccessResponse;
}

/**
 * Check if reprice response is an error
 */
export function isRepriceError(
  response: RepriceSuccessResponse | RepriceErrorResponse
): response is RepriceErrorResponse {
  return 'statusCode' in response && response.statusCode === 400;
}

/**
 * Update local cart with repriced values from backend
 */
export function updateCartWithRepriceData(
  repriceData: RepriceSuccessResponse
): void {
  const localCart = getCart();
  const updatedItems: CartItem[] = [];

  // Update each item with backend-validated prices
  localCart.items.forEach((localItem) => {
    const repriceItem = repriceData.items.find(
      (item) => item.variantId === localItem.variantId
    );

    if (repriceItem) {
      updatedItems.push({
        ...localItem,
        quantity: repriceItem.quantity,
        price: repriceItem.unit_price,
        discount: repriceItem.discountValue,
        finalPrice: parseFloat(repriceItem.totalPrice) / repriceItem.quantity,
      });
    }
  });

  // Save updated cart
  const updatedCart: Cart = {
    items: updatedItems,
    version: localCart.version,
  };

  saveCart(updatedCart);
}

/**
 * Remove out-of-stock variants from local cart
 */
export function removeOutOfStockVariants(variantIds: number[]): CartItem[] {
  const localCart = getCart();
  const removedItems: CartItem[] = [];

  variantIds.forEach((variantId) => {
    const item = localCart.items.find((i) => i.variantId === variantId);
    if (item) {
      removedItems.push(item);
      removeFromCart(item.variantId, item.sizeName);
    }
  });

  return removedItems;
}

/**
 * Get items that are still in stock from local cart
 */
export function getAvailableCartItems(
  outOfStockVariantIds: number[]
): CartItem[] {
  const localCart = getCart();
  return localCart.items.filter(
    (item) => !outOfStockVariantIds.includes(item.variantId)
  );
}
