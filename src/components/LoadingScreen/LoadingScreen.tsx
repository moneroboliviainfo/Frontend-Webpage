'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import './LoadingScreen.css';

interface LoadingScreenProps {
  /**
   * Message to display below the loader
   * @default "Cargando..."
   */
  message?: string;
  /**
   * Custom className for additional styling
   */
  className?: string;
  /**
   * Background color override
   * @default "white"
   */
  backgroundColor?: string;
  /**
   * Logo size override
   * @default { width: 120, height: 120 }
   */
  logoSize?: {
    width: number;
    height: number;
  };
  /**
   * Whether to show the loading screen (for transition control)
   * @default true
   */
  isVisible?: boolean;
  /**
   * Callback when fade-out animation completes
   */
  onFadeComplete?: () => void;
  /**
   * Fade transition duration in milliseconds
   * @default 600
   */
  fadeDuration?: number;
  /**
   * Enable enhanced spinner with multiple rings
   * @default false
   */
  enhancedSpinner?: boolean;
  /**
   * Enable logo pulse effect
   * @default false
   */
  logoPulse?: boolean;
}

/**
 * Reusable full-screen loading component with Monero logo, circular spinner, and fade-out transition
 * Follows Single Responsibility Principle - displays loading state only
 * Follows Open/Closed Principle - extensible via props without modification
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando...',
  className = '',
  backgroundColor = 'white',
  logoSize = { width: 120, height: 120 },
  isVisible = true,
  onFadeComplete,
  fadeDuration = 600,
  enhancedSpinner = false,
  logoPulse = false,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [isEntering, setIsEntering] = useState(true);

  // Handle entrance animation
  useEffect(() => {
    if (isVisible && isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isEntering]);

  // Handle visibility changes with fade-out animation
  useEffect(() => {
    if (!isVisible && !isAnimatingOut) {
      // Start fade-out animation
      setIsAnimatingOut(true);

      // Remove component after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
        onFadeComplete?.();
      }, fadeDuration);

      return () => clearTimeout(timer);
    } else if (isVisible) {
      // Reset states when becoming visible
      setIsAnimatingOut(false);
      setShouldRender(true);
      setIsEntering(true);
    }
  }, [isVisible, isAnimatingOut, onFadeComplete, fadeDuration]);

  // Don't render if animation completed
  if (!shouldRender) {
    return null;
  }

  // Generate CSS classes
  const containerClasses = [
    'loading-screen',
    isEntering && isVisible ? 'loading-screen--entering' : '',
    isAnimatingOut ? 'loading-screen--fade-out' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerClasses = [
    'loading-screen__spinner',
    enhancedSpinner ? 'loading-screen__spinner--multi-ring' : '',
    isAnimatingOut ? 'loading-screen__spinner--stopping' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const logoClasses = [
    'loading-screen__logo',
    logoPulse && !isAnimatingOut ? 'loading-screen__logo--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      style={
        {
          backgroundColor,
          '--fade-duration': `${fadeDuration}ms`,
        } as React.CSSProperties
      }
    >
      {/* Logo with circular spinner around it */}
      <div className="loading-screen__logo-container">
        {/* Circular spinner track */}
        <div
          className="loading-screen__spinner-track"
          style={{
            width: logoSize.width + 40,
            height: logoSize.height + 40,
            left: -20,
            top: -20,
          }}
        />

        {/* Animated spinner */}
        <div
          className={spinnerClasses}
          style={{
            width: logoSize.width + 40,
            height: logoSize.height + 40,
            left: -20,
            top: -20,
          }}
        />

        {/* Logo in the center */}
        <Image
          src="/logos/Logo-Monero.png"
          alt="Monero"
          width={logoSize.width}
          height={logoSize.height}
          className={logoClasses}
          priority
        />
      </div>

      {/* Loading message */}
      <p className="loading-screen__message">{message}</p>
    </div>
  );
};

export default LoadingScreen;
