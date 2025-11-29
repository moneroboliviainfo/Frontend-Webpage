'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type CategoryGalleryItemProps = {
  categoryId: string;
  src: string;
  name: string;
  isMobile: boolean;
  gender?: string;
};

const CategoryGalleryItem: React.FC<CategoryGalleryItemProps> = ({
  categoryId,
  src,
  name,
  isMobile,
  gender = 'women',
}) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to clothes page with category filter
    const categoryParam = encodeURIComponent(`${name}-${categoryId}`);
    router.push(`/${gender}/clothes?category=${categoryParam}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Category ${name}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0 group"
      style={{
        aspectRatio: isMobile ? '4/5' : '3/4',
        position: 'relative',
        overflow: 'hidden',
        borderColor: 'white',
        borderStyle: 'solid',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src && src.trim() ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={isMobile ? '50vw' : '25vw'}
        />
      ) : (
        <div
          aria-hidden
          className="transition-transform duration-300 group-hover:scale-105"
          style={{ position: 'absolute', inset: 0, backgroundColor: '#000' }}
        />
      )}

      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 2,
          textAlign: 'center',
          width: '90%',
        }}
      >
        {name}
      </span>
    </div>
  );
};

export default CategoryGalleryItem;
