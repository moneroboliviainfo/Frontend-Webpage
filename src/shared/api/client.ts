import { API_URL } from '@/config/env';
import { AuthStorage } from '@/utils/authStorage';

export type ApiRequest = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Serialized as JSON; sets Content-Type automatically. */
  body?: unknown;
  /** Attaches the stored bearer token when there is one. */
  auth?: boolean;
  /** Overrides the stored token — for the login flow, before storage settles. */
  token?: string;
  /**
   * Prefix for the thrown message when the response carries no `message` or
   * `error` field — the result reads `"<errorMessage>: <statusText>"`, which is
   * the shape the call sites already used.
   */
  errorMessage?: string;
};

/**
 * Single entry point for calls to the Monero API.
 *
 * Throws on a non-2xx response, which is what most callers expect. The few that
 * treat a failure as a value instead — the stock check in repriceCart, the
 * advertisement cache, the QR payment poller — keep their own `fetch` on purpose.
 */
export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, auth, token, errorMessage }: ApiRequest = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const bearer = token ?? (auth ? AuthStorage.getToken() : null);
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const fallback = errorMessage
      ? `${errorMessage}: ${response.statusText}`
      : response.statusText;
    throw new Error(data.message || data.error || fallback);
  }

  return response.json();
}
