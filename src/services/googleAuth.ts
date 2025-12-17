import { API_URL } from '@/config/env';
import { AUTH_ENDPOINTS, DEFAULT_ROUTES } from '@/constants/auth';
import type { Client } from '@/store/clientSlice';

interface AuthResponse {
  token?: string;
  user?: Client;
}

/**
 * Service class for handling Google OAuth operations
 */
export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow
   * @param callbackUrl - The URL to redirect to after authentication
   */
  static initiateLogin(callbackUrl: string): void {
    const authUrl = `${API_URL}${
      AUTH_ENDPOINTS.GOOGLE_LOGIN
    }?callback=${encodeURIComponent(callbackUrl)}`;
    window.location.href = authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param code - Authorization code from Google
   * @returns Promise with token and user data
   */
  static async exchangeCodeForTokens(code: string): Promise<AuthResponse> {
    const response = await fetch(
      `${API_URL}${AUTH_ENDPOINTS.GOOGLE_EXCHANGE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  /**
   * Generate callback URL for the current origin with optional state parameters
   * @param state - Optional state object to pass through OAuth flow
   */
  static generateCallbackUrl(state?: {
    cart?: string;
    gender?: string;
    redirect?: string;
  }): string {
    const baseUrl = `${window.location.origin}${DEFAULT_ROUTES.AUTH_CALLBACK}`;

    if (!state) return baseUrl;

    const params = new URLSearchParams();
    if (state.cart) params.set('state_cart', state.cart);
    if (state.gender) params.set('state_gender', state.gender);
    if (state.redirect) params.set('state_redirect', state.redirect);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }
}
