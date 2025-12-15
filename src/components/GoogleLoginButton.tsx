import React from 'react';
import Image from 'next/image';
import { AuthStorage } from '@/utils/authStorage';
import { GoogleAuthService } from '@/services/googleAuth';
import { getRawEncodedCart } from '@/utils/cartStorage';

interface GoogleLoginButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  text = 'Iniciar sesión con Google',
  className = '',
  style = {},
}) => {
  const handleGoogleLogin = async () => {
    try {
      // Store the current page URL for redirect after login
      AuthStorage.storeRedirectUrl(window.location.href);

      // Save current cart to sessionStorage to preserve across domain change
      const currentCart = getRawEncodedCart();
      if (currentCart) {
        AuthStorage.storePreAuthCart(currentCart);
      }

      // Generate callback URL and initiate Google login
      const callbackUrl = GoogleAuthService.generateCallbackUrl();
      GoogleAuthService.initiateLogin(callbackUrl);

      if (onClick) {
        onClick();
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
    }
  };

  return (
    <button
      className={`flex items-center rounded-lg border border-gray-300 text-gray-800 font-bold shadow transition hover:bg-gray-50 ${className}`}
      style={{
        background: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        gap: '12px',
        cursor: 'pointer',
        ...style,
      }}
      onClick={handleGoogleLogin}
    >
      <Image
        src="/logos/google-icon.svg"
        alt="Google"
        width={20}
        height={20}
        style={{ display: 'inline-block' }}
      />
      {text}
    </button>
  );
};

export default GoogleLoginButton;
