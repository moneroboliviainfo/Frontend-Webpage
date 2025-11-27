'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { createClient } from '@/store/clientSlice';
import { AuthStorage } from '@/utils/authStorage';
import { GoogleAuthService } from '@/services/googleAuth';

export default function AuthCallback() {
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
          }

          // Update Redux state with user data
          if (data.user) {
            dispatch(createClient.fulfilled(data.user, '', data.user));
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
