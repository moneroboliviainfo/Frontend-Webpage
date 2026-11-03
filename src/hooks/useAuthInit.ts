import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setClient } from '@/store/clientSlice';
import { AuthStorage } from '@/shared/storage/authStorage';
import { isApiStatus } from '@/shared/api/client';
import { fetchCustomerProfile, toClient } from '@/services/customerProfile';

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
        // This doubles as the token check: a rejected token throws here.
        const profile = await fetchCustomerProfile();
        dispatch(setClient(toClient(profile)));
      } catch (err) {
        console.error('Error verifying token/profile:', err);
        // Only an actually rejected token ends the session. A network blip, a
        // 500 or a timeout must leave it alone — dropping it there logs the
        // customer out for something that was never their session's fault, and
        // there is no refresh token, so getting back in means logging in again.
        if (isApiStatus(err, 401)) {
          AuthStorage.clearToken();
        }
      }
    };

    initializeAuth();
  }, [dispatch]);
};
