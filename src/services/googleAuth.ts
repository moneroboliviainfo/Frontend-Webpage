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
   * Generate callback URL for the current origin
   */
  static generateCallbackUrl(): string {
    return `${window.location.origin}${DEFAULT_ROUTES.AUTH_CALLBACK}`;
  }
}
