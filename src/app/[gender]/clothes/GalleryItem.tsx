'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import buildProductSlug from '@/utils/buildProductSlug';
import { type ActiveDiscount, isDiscountActive } from '@/utils/price';
import Image from 'next/image';
import SkeletonLoader from '@/components/SkeletonLoader';

type Props = {
  src: string;
  name: string;
  price: number;
  productId?: string | number;
  isMobile?: boolean;
  colors?: string[];
  isNew?: boolean;
  discount?: ActiveDiscount | null;
  finalPrice?: number;
};

const GalleryItem: React.FC<Props> = ({
  src,
  name,
  price,
  productId,
  isMobile = false,
  colors = [],
  isNew = false,
  discount = null,
  finalPrice,
}) => {
  const imgWidth = isMobile ? '49vw' : '100%';

  // Use a fixed aspect ratio so height scales with width. Choose a ratio
  // that keeps the image taller than wide (approx height/width ~ 1.4).
  // aspect-ratio accepts width / height, so 5 / 7 gives height ~= 1.4 * width.
  const aspect = '5 / 7';
  const hasDiscount = isDiscountActive(discount);

  const [hovered, setHovered] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const slug = buildProductSlug(name, productId);

  const handleColorClick = (
    e: React.MouseEvent | React.KeyboardEvent,
    colorCode: string,
  ) => {
    e.stopPropagation();
    router.push(
      `/w/${encodeURIComponent(slug)}?colorCode=${encodeURIComponent(
        colorCode,
      )}`,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/w/${encodeURIComponent(slug)}`);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => router.push(`/w/${encodeURIComponent(slug)}`)}
      className="relative overflow-hidden bg-white"
      style={{
        width: imgWidth,
        minWidth: imgWidth,
        marginTop: '0.7rem',
        cursor: 'pointer',
      }}
    >
      {/* NUEVO badge */}
      {isNew || hasDiscount ? (
        <div
          aria-hidden={!isNew}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isNew && (
              <div
                style={{
                  padding: '2px 4px',
                  borderRadius: 4,
                  border: '1px solid #000',
                  background: '#fff',
                  color: '#000',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  textAlign: 'center',
                }}
              >
                NUEVO
              </div>
            )}
            {hasDiscount ? (
              <div
                style={{
                  padding: '2px 4px',
                  borderRadius: 4,
                  border: '1px solid #dc2626',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  textAlign: 'center',
                }}
              >
                - {discount?.value}%
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* aspect-ratio ensures height is derived from width so it always keeps the same relation */}
      <div className="relative" style={{ width: '100%', aspectRatio: aspect }}>
        {/* Skeleton loader - shown while image is loading */}
        {!imageLoaded && <SkeletonLoader variant="shimmer" showIcon={false} />}
        <Image
          src={src}
          alt={name}
          fill
          style={{
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onLoadingComplete={() => setImageLoaded(true)}
        />
      </div>

      <div
        style={{
          color: 'black',
          paddingLeft: '0.5rem',
        }}
      >
        <div className="text-sm" style={{ marginTop: '0.5rem' }}>
          {name}
        </div>
        <div style={{ marginTop: '0.2rem' }}>
          {hasDiscount && typeof finalPrice === 'number' ? (
            <>
              <span
                className="text-sm"
                style={{ textDecoration: 'line-through', color: '#6b7280' }}
              >
                {`Bs. ${price}`}
              </span>
              <span
                className="text-sm font-bold"
                style={{ marginLeft: 8, color: '#dc2626' }}
              >
                {`Bs. ${finalPrice}`}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">{`Bs. ${price}`}</span>
          )}
        </div>
        {/* color swatches row */}
        {colors && colors.length > 0 && (
          <div
            className="flex items-center gap-1"
            style={{ marginTop: '0.35rem' }}
          >
            {colors.map((c: string, i: number) => (
              <div
                key={c + i}
                role="button"
                tabIndex={0}
                onClick={(e) => handleColorClick(e, c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleColorClick(e, c);
                  }
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                className="flex items-center justify-center"
                style={{
                  width: '0.8rem',
                  height: '0.8rem',
                  borderRadius: '9999px',
                  background: c,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'opacity 120ms ease, transform 120ms ease',
                  opacity: hovered === i ? 0.6 : 1,
                  transform: hovered === i ? 'scale(0.98)' : 'none',
                  border: '1px solid #9ca3af',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryItem;
