'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Props = {
  src: string;
  productId?: string | number;
  isMobile?: boolean;
};

const OutfitsGalleryItem: React.FC<Props> = ({
  src,
  productId,
  isMobile = false,
}) => {
  const imgWidth = isMobile ? '49vw' : '100%';

  // Use a fixed aspect ratio so height scales with width. Choose a ratio
  // that keeps the image taller than wide (approx height/width ~ 1.4).
  // aspect-ratio accepts width / height, so 5 / 7 gives height ~= 1.4 * width.
  const aspect = '5 / 7';

  const router = useRouter();
  const outfitParam =
    productId !== undefined && productId !== null ? productId.toString() : '1';

  const handleNavigation = () => {
    router.push(`/w/outfits?outfit=${encodeURIComponent(outfitParam)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleNavigation}
      className="relative overflow-hidden bg-white"
      style={{
        width: imgWidth,
        minWidth: imgWidth,
        marginTop: '0.1rem',
        cursor: 'pointer',
      }}
    >
      {/* aspect-ratio ensures height is derived from width so it always keeps the same relation */}
      <div className="relative" style={{ width: '100%', aspectRatio: aspect }}>
        <Image
          src={src}
          alt={`Outfit ${productId || ''}`}
          fill
          style={{ objectFit: 'cover' }}
        />

        {/* Group icon in top right corner */}
        <div
          className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
          style={{
            width: '24px',
            height: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            {/* Two overlapping squares */}
            <rect
              x="2"
              y="4"
              width="8"
              height="8"
              rx="1"
              fill="#059669"
              opacity="0.5"
            />
            <rect x="6" y="2" width="8" height="8" rx="1" fill="#059669" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OutfitsGalleryItem;
