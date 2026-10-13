import { apiFetch } from '@/shared/api/client';
import { AuthStorage } from '@/utils/authStorage';
import { setClient, type Client } from '@/store/clientSlice';

type CustomerProfile = {
  id?: number | string;
  name?: string;
  email?: string;
  address?: unknown;
  phone?: string;
  orders?: unknown;
};

export async function completeLoginWithToken(
  token: string,
  dispatch: any,
): Promise<Client | null> {
  try {
    AuthStorage.storeToken(token);

    // The token was just stored, but pass it explicitly so this does not depend
    // on storage having settled.
    const profile = await apiFetch<CustomerProfile>('customers/me', { token });

    const client: Client = {
      clientId: String(profile.id ?? ''),
      name: profile.name ?? '',
      email: profile.email ?? '',
      address: Array.isArray(profile.address) ? profile.address : undefined,
      phone: profile.phone ?? undefined,
      orders: Array.isArray(profile.orders) ? profile.orders : undefined,
    };

    dispatch(setClient(client));
    return client;
  } catch (err) {
    console.error('Error in completeLoginWithToken:', err);
    return null;
  }
}
