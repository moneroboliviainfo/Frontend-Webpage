import { AUTH_STORAGE_KEYS, DEFAULT_ROUTES } from '@/constants/auth';

const PRE_AUTH_CART_KEY = 'mng_pre_auth_cart';

/**
 * Utility class for handling authentication-related localStorage operations
 */
export class AuthStorage {
  /**
   * Store the current page URL for post-login redirection
   */
  static storeRedirectUrl(url: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_URL, url);
  }

  /**
   * Retrieve and clear the stored redirect URL
   * @returns The stored URL or default home route
   */
  static getAndClearRedirectUrl(): string {
    const redirectUrl =
      localStorage.getItem(AUTH_STORAGE_KEYS.REDIRECT_URL) ||
      DEFAULT_ROUTES.HOME;
    localStorage.removeItem(AUTH_STORAGE_KEYS.REDIRECT_URL);
    return redirectUrl;
  }

  /**
   * Store authentication token
   */
  static storeToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Retrieve authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Remove authentication token
   */
  static clearToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Store pre-authentication cart in sessionStorage
   * This preserves the cart across domain changes during OAuth flow
   */
  static storePreAuthCart(encodedCart: string): void {
    if (encodedCart && encodedCart.trim()) {
      sessionStorage.setItem(PRE_AUTH_CART_KEY, encodedCart);
    }
  }

  /**
   * Retrieve and clear pre-authentication cart
   * @returns The encoded cart string or null
   */
  static getAndClearPreAuthCart(): string | null {
    const cart = sessionStorage.getItem(PRE_AUTH_CART_KEY);
    sessionStorage.removeItem(PRE_AUTH_CART_KEY);
    return cart;
  }
}
