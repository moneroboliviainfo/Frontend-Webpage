import { AuthStorage } from '@/shared/storage/authStorage';
import { setClient, type Client } from '@/store/clientSlice';
import { fetchCustomerProfile, toClient } from './customerProfile';

export async function completeLoginWithToken(
  token: string,
  dispatch: any,
): Promise<Client | null> {
  try {
    AuthStorage.storeToken(token);

    // The token was just stored, but pass it explicitly so this does not depend
    // on storage having settled.
    const client = toClient(await fetchCustomerProfile(token));

    dispatch(setClient(client));
    return client;
  } catch (err) {
    console.error('Error in completeLoginWithToken:', err);
    return null;
  }
}
