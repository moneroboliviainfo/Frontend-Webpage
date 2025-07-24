export const CART_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type CartStatus = (typeof CART_STATUS)[keyof typeof CART_STATUS];

export const CART_ACTIONS = {
  ADD: 'cart/addToCart',
  REMOVE: 'cart/removeFromCart',
} as const;

export const ENCRYPTED_CART_KEY = 'encryptedCart';
