import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant?: 'shimmer' | 'pulse' | 'light' | 'dark';
  showIcon?: boolean;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'shimmer',
  showIcon = true,
  className = '',
}) => {
  const variantClass =
    variant === 'pulse'
      ? 'skeleton-pulse'
      : variant === 'light'
      ? 'skeleton-light'
      : variant === 'dark'
      ? 'skeleton-dark'
      : '';

  return (
    <div className={`skeleton-loader ${variantClass} ${className}`.trim()}>
      {showIcon && (
        <div className="skeleton-image">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;
