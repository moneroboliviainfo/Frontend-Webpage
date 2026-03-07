import React from 'react';
import Image from 'next/image';
import { AuthStorage } from '@/utils/authStorage';
import { GoogleAuthService } from '@/services/googleAuth';
import './GoogleLoginButton.css';

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
      // Store current URL for post-login redirect
      AuthStorage.storeRedirectUrl(window.location.href);

      // Generate callback URL
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
      className={`google-login-button ${className}`}
      style={style}
      onClick={handleGoogleLogin}
    >
      <Image
        src="/logos/google-icon.svg"
        alt="Google"
        width={20}
        height={20}
        className="google-login-button__icon"
      />
      {text}
    </button>
  );
};

export default GoogleLoginButton;
