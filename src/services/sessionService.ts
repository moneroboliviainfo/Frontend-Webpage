import { API_URL } from '@/config/env';
import { AuthStorage } from '@/utils/authStorage';
import { setClient, type Client } from '@/store/clientSlice';

export async function completeLoginWithToken(
  token: string,
  dispatch: any,
): Promise<Client | null> {
  try {
    AuthStorage.storeToken(token);

    const profileRes = await fetch(`${API_URL}customers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileRes.ok) {
      console.warn('Failed to fetch profile after token login');
      return null;
    }

    const profile = await profileRes.json();

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
