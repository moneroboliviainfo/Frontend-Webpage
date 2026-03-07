'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setClient, type Client } from '@/store/clientSlice';
import { AuthStorage } from '@/utils/authStorage';
import { GoogleAuthService } from '@/services/googleAuth';
import { API_URL } from '@/config/env';
import { completeLoginWithToken } from '@/services/sessionService';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Get stored redirect URL
      const redirectUrl = AuthStorage.getAndClearRedirectUrl();

      if (error) {
        console.error('OAuth error:', error);
        router.push(redirectUrl);
        return;
      }

      if (code) {
        try {
          const data = await GoogleAuthService.exchangeCodeForTokens(code);

          // Store the token in localStorage and complete session
          if (data.token) {
            try {
              await completeLoginWithToken(data.token, dispatch);
            } catch (err) {
              console.error('Error completing login with token:', err);
            }
            // After exchange is complete, redirect to the stored URL
            router.push(redirectUrl);
          } else {
            // No token received, redirect anyway
            router.push(redirectUrl);
          }
        } catch (error) {
          console.error('Error during token exchange:', error);
          router.push(redirectUrl);
        }
      } else {
        // No code parameter, redirect to stored URL or home
        router.push(redirectUrl);
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
