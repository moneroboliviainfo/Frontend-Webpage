import { API_URL } from '@/shared/config/env';
import { AuthStorage } from '@/shared/storage/authStorage';

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
 * A non-2xx response from the API.
 *
 * Extends `Error` so the existing `error instanceof Error ? error.message`
 * call sites keep working untouched; what it adds is the `status`, which some
 * decisions genuinely depend on. Clearing the stored token, for one, is only
 * correct on a `401` — doing it on any failure logs the customer out over a
 * network blip.
 */
export class ApiError extends Error {
  readonly status: number;
  /** The parsed error body, when there was one. */
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Whether a thrown value is an API response with this status. */
export const isApiStatus = (error: unknown, status: number): boolean =>
  error instanceof ApiError && error.status === status;

/**
 * Single entry point for calls to the Monero API.
 *
 * Throws `ApiError` on a non-2xx response, which is what most callers expect.
 * The few that treat a failure as a value instead — the stock check in
 * repriceCart, the advertisement cache, the QR payment poller — keep their own
 * `fetch` on purpose.
 *
 * A failed request (offline, DNS, timeout) rejects with the browser's own
 * `TypeError`, not an `ApiError`: there is no status to report, and callers
 * must not treat it as a verdict from the server.
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
    // `?? {}` covers a body of literal `null`, which parses fine and would
    // otherwise throw while reading .message.
    const data = (await response.json().catch(() => null)) ?? {};
    const fallback = errorMessage
      ? `${errorMessage}: ${response.statusText}`
      : response.statusText;
    throw new ApiError(
      data.message || data.error || fallback,
      response.status,
      data,
    );
  }

  return response.json();
}
