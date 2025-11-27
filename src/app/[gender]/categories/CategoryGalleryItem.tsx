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
    router.push(
      `/${gender}/clothes?category=${encodeURIComponent(categoryId)}`
    );
  };

  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      style={{
        aspectRatio: isMobile ? '4/5' : '3/4',
        backgroundColor: '#f9fafb',
      }}
      onClick={handleClick}
    >
      {/* Category Image */}
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes={isMobile ? '50vw' : '25vw'}
      />

      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Centered category name */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3
          className="text-white font-bold text-center uppercase tracking-wide"
          style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            padding: '0 1rem',
            lineHeight: '1.2',
          }}
        >
          {name}
        </h3>
      </div>

      {/* Bottom overlay with interaction button */}
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full">
          {/* Black background button - only visible on hover */}
          <button
            className="w-full py-3 px-4 bg-black text-white font-semibold text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors duration-200"
            style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            }}
          >
            EXPLORAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryGalleryItem;
