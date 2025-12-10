'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setClient, type Client } from '@/store/clientSlice';
import { AuthStorage } from '@/utils/authStorage';
import { GoogleAuthService } from '@/services/googleAuth';
import { API_URL } from '@/config/env';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        const redirectUrl = AuthStorage.getAndClearRedirectUrl();
        router.push(redirectUrl);
        return;
      }

      if (code) {
        try {
          const data = await GoogleAuthService.exchangeCodeForTokens(code);

          // Store the token in localStorage
          if (data.token) {
            AuthStorage.storeToken(data.token);

            // Fetch user profile using the token
            try {
              const profileRes = await fetch(`${API_URL}customers/me`, {
                headers: { Authorization: `Bearer ${data.token}` },
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                // Map API profile to local Client shape
                const client: Client = {
                  clientId: String(profile.id ?? ''),
                  name: profile.name ?? '',
                  email: profile.email ?? '',
                  address: Array.isArray(profile.address)
                    ? profile.address
                    : undefined,
                  phone: profile.phone ?? undefined,
                  orders: Array.isArray(profile.orders)
                    ? profile.orders
                    : undefined,
                };
                // Store client details in Redux
                dispatch(setClient(client));
              } else {
                console.warn('Failed to fetch profile after token exchange');
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
            }
          }

          // Redirect to the original page
          const redirectUrl = AuthStorage.getAndClearRedirectUrl();
          router.push(redirectUrl);
        } catch (error) {
          console.error('Error during token exchange:', error);
          const redirectUrl = AuthStorage.getAndClearRedirectUrl();
          router.push(redirectUrl);
        }
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
