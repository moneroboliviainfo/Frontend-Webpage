import { AUTH_STORAGE_KEYS, DEFAULT_ROUTES } from '@/constants/auth';

const PRE_AUTH_CART_KEY = 'mng_pre_auth_cart';
const PRE_AUTH_REDIRECT_KEY = 'mng_pre_auth_redirect';
const PRE_AUTH_GENDER_KEY = 'mng_pre_auth_gender';

/**
 * Utility class for handling authentication-related localStorage operations
 */
export class AuthStorage {
  /**
   * Store the current page URL for post-login redirection
   * Stores in both localStorage (for same domain) and sessionStorage (for cross-domain)
   */
  static storeRedirectUrl(url: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_URL, url);
    sessionStorage.setItem(PRE_AUTH_REDIRECT_KEY, url);
  }

  /**
   * Retrieve and clear the stored redirect URL
   * Checks sessionStorage first (for cross-domain), then localStorage
   * @returns The stored URL or default home route
   */
  static getAndClearRedirectUrl(): string {
    // Check sessionStorage first (survives domain change)
    const sessionRedirect = sessionStorage.getItem(PRE_AUTH_REDIRECT_KEY);
    sessionStorage.removeItem(PRE_AUTH_REDIRECT_KEY);

    if (sessionRedirect) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REDIRECT_URL);
      return sessionRedirect;
    }

    // Fallback to localStorage
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

  /**
   * Store pre-authentication gender in sessionStorage
   * This preserves the gender across domain changes during OAuth flow
   */
  static storePreAuthGender(gender: string): void {
    if (gender && gender.trim()) {
      sessionStorage.setItem(PRE_AUTH_GENDER_KEY, gender);
    }
  }

  /**
   * Retrieve and clear pre-authentication gender
   * @returns The gender string or null
   */
  static getAndClearPreAuthGender(): string | null {
    const gender = sessionStorage.getItem(PRE_AUTH_GENDER_KEY);
    sessionStorage.removeItem(PRE_AUTH_GENDER_KEY);
    return gender;
  }
}
