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
   * Extracts only pathname + search + hash to avoid domain mismatch issues
   */
  static storeRedirectUrl(url: string): void {
    try {
      // Extract only the path part (pathname + search + hash) to avoid domain issues
      const urlObj = new URL(url);
      const pathOnly = urlObj.pathname + urlObj.search + urlObj.hash;
      localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_URL, pathOnly);
      sessionStorage.setItem(PRE_AUTH_REDIRECT_KEY, pathOnly);
    } catch {
      // Fallback if URL parsing fails - store as-is
      localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_URL, url);
      sessionStorage.setItem(PRE_AUTH_REDIRECT_KEY, url);
    }
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
}
