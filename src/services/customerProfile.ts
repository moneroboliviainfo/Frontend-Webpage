import { apiFetch } from '@/shared/api/client';
import { type Client } from '@/store/clientSlice';

/**
 * What `GET /web-page/customers/me` returns, loosely typed: the backend sends
 * the full customer with `address[]` (each with its `place`) and `orders[]`
 * (all of them, unpaginated). A guest gets both empty.
 */
export type CustomerProfile = {
  id?: number | string;
  name?: string;
  email?: string;
  address?: unknown;
  phone?: string;
  orders?: unknown;
};

/**
 * The logged-in customer's profile.
 *
 * Lives under `web-page/` — the bare `customers/me` this used to call is not a
 * route at all (it falls into the admin `customers/{id}`), so it always failed.
 * That mattered more than it looks: the callers treat a failure as an invalid
 * token and clear it, so the wrong path logged the customer out on every load.
 *
 * Fetching and mapping sit together here because both callers — the session
 * bootstrap and the login completion — need exactly the same thing, and when
 * they each had their own copy the wrong path had to be fixed twice.
 */
export const fetchCustomerProfile = (
  token?: string,
): Promise<CustomerProfile> =>
  apiFetch<CustomerProfile>('web-page/customers/me', {
    // An explicit token is used right after login, before storage settles.
    ...(token ? { token } : { auth: true }),
  });

/** Maps the API profile onto the shape the store keeps. */
export const toClient = (profile: CustomerProfile): Client => ({
  clientId: String(profile.id ?? ''),
  name: profile.name ?? '',
  email: profile.email ?? '',
  address: Array.isArray(profile.address) ? profile.address : undefined,
  phone: profile.phone ?? undefined,
  orders: Array.isArray(profile.orders) ? profile.orders : undefined,
});
