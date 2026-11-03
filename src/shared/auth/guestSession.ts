import { apiFetch, isApiStatus } from '@/shared/api/client';

/**
 * The shared placeholder account every guest checkout runs under. The backend
 * reports it as the customer's email, which is how the frontend tells a guest
 * apart from someone with a real account.
 */
export const GUEST_EMAIL = 'guest@moneroget.com';

/** Whether this customer email belongs to a guest checkout. */
export const isGuestEmail = (email?: string | null): boolean =>
  email === GUEST_EMAIL;

/**
 * Whether a thrown error means the session is gone.
 *
 * The backend answers `401 Guest session expired` for a guest token it no
 * longer accepts. Matching on the status rather than that text also covers a
 * plain expiry, and keeps working if the wording changes.
 */
export const isSessionExpired = (error: unknown): boolean =>
  isApiStatus(error, 401);

/**
 * Opens a **new** guest session and returns its token.
 *
 * Every call opens a fresh one, and anything created under the previous token —
 * the address, the order — becomes unreachable (`404`). So a caller recovering
 * from an expired session has to discard the address it was holding and collect
 * it again; reusing the old `addressId` would fail at order creation.
 */
export const requestGuestToken = async (): Promise<string> => {
  const data = await apiFetch<{ email?: string; token?: string }>(
    'auth/guest',
    { method: 'POST' },
  );

  if (!data.token) {
    throw new Error('No se pudo iniciar la compra como invitado.');
  }

  return data.token;
};
