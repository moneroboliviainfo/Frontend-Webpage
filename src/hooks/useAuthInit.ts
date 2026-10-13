import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setClient, type Client } from '@/store/clientSlice';
import { apiFetch } from '@/shared/api/client';
import { AuthStorage } from '@/utils/authStorage';

type CustomerProfile = {
  id?: number | string;
  name?: string;
  email?: string;
  address?: unknown;
  phone?: string;
  orders?: unknown;
};

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      // Don't run on auth callback page - let the callback handle it
      if (
        typeof window !== 'undefined' &&
        window.location.pathname === '/auth/callback'
      ) {
        return;
      }

      const token = AuthStorage.getToken();

      if (!token) return;

      try {
        // customers/me doubles as the token check: a rejected token throws here
        const profile = await apiFetch<CustomerProfile>('customers/me', {
          auth: true,
        });

        const client: Client = {
          clientId: String(profile.id ?? ''),
          name: profile.name ?? '',
          email: profile.email ?? '',
          address: Array.isArray(profile.address) ? profile.address : undefined,
          phone: profile.phone ?? undefined,
          orders: Array.isArray(profile.orders) ? profile.orders : undefined,
        };
        dispatch(setClient(client));
      } catch (err) {
        console.error('Error verifying token/profile:', err);
        AuthStorage.clearToken();
      }
    };

    initializeAuth();
  }, [dispatch]);
};
