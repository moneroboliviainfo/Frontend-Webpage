import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setClient, type Client } from '@/store/clientSlice';
import { API_URL } from '@/config/env';
import { AuthStorage } from '@/utils/authStorage';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthStorage.getToken();

      if (!token) return;

      try {
        // Call the customers/me endpoint to verify token and fetch profile
        const response = await fetch(`${API_URL}customers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const profile = await response.json();
          const client: Client = {
            clientId: String(profile.id ?? ''),
            name: profile.name ?? '',
            email: profile.email ?? '',
            address: Array.isArray(profile.address)
              ? profile.address
              : undefined,
            phone: profile.phone ?? undefined,
            orders: Array.isArray(profile.orders) ? profile.orders : undefined,
          };
          dispatch(setClient(client));
        } else {
          // Token invalid — clear it
          AuthStorage.clearToken();
        }
      } catch (err) {
        console.error('Error verifying token/profile:', err);
        AuthStorage.clearToken();
      }
    };

    initializeAuth();
  }, [dispatch]);
};
