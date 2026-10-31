import type { Cart, CartItem } from '@/types/cart';

const CART_STORAGE_KEY = 'mng_cart_v1';
const CART_VERSION = 1;

/**
 * Simple encoding to obfuscate cart data (not cryptographic security)
 * Uses base64 encoding to make manual editing harder
 */
function encodeCart(cart: Cart): string {
  try {
    const json = JSON.stringify(cart);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

/**
 * Decode cart data from base64
 */
function decodeCart(encoded: string): Cart | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      return parsed as Cart;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get cart from localStorage
 */
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], version: CART_VERSION };
  }

  try {
    const encoded = localStorage.getItem(CART_STORAGE_KEY);
    if (!encoded) {
      return { items: [], version: CART_VERSION };
    }

    const cart = decodeCart(encoded);
    if (!cart || cart.version !== CART_VERSION) {
      return { items: [], version: CART_VERSION };
    }

    return cart;
  } catch {
    return { items: [], version: CART_VERSION };
  }
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  try {
    const encoded = encodeCart(cart);
    localStorage.setItem(CART_STORAGE_KEY, encoded);
  } catch (err) {
    console.error('Failed to save cart:', err);
  }
}

/**
 * Add item to cart or update quantity if already exists
 */
export function addToCart(
  item: Omit<CartItem, 'quantity' | 'addedAt'>
): CartItem {
  const cart = getCart();

  // Check if item already exists (same variant + size)
  const existingIndex = cart.items.findIndex(
    (i) => i.variantId === item.variantId && i.sizeName === item.sizeName
  );

  let addedItem: CartItem;

  if (existingIndex >= 0) {
    // Update quantity and refresh item properties
    const existingItem = cart.items[existingIndex];
    existingItem.quantity += 1;
    // Update properties in case they changed (e.g., price, image, color name)
    existingItem.productName = item.productName;
    existingItem.price = item.price;
    existingItem.discount = item.discount;
    existingItem.finalPrice = item.finalPrice;
    existingItem.colorName = item.colorName;
    existingItem.colorCode = item.colorCode;
    existingItem.imageUrl = item.imageUrl;
    addedItem = existingItem;
  } else {
    // Add new item
    addedItem = {
      ...item,
      quantity: 1,
      addedAt: Date.now(),
    };
    cart.items.push(addedItem);
  }

  saveCart(cart);
  return addedItem;
}

/**
 * Remove item from cart
 */
export function removeFromCart(variantId: number, sizeName: string): void {
  const cart = getCart();
  cart.items = cart.items.filter(
    (i) => !(i.variantId === variantId && i.sizeName === sizeName)
  );
  saveCart(cart);
}

/**
 * Update item quantity
 */
export function updateCartItemQuantity(
  variantId: number,
  sizeName: string,
  quantity: number
): void {
  const cart = getCart();
  const item = cart.items.find(
    (i) => i.variantId === variantId && i.sizeName === sizeName
  );

  if (item) {
    if (quantity <= 0) {
      removeFromCart(variantId, sizeName);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

/**
 * Clear entire cart
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Get cart item count
 */
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
