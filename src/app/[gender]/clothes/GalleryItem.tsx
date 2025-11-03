import React, { useState } from 'react';
import Image from 'next/image';

type Props = {
  src: string;
  name: string;
  price: number;
  isMobile?: boolean;
  colors?: string[];
  isNew?: boolean;
  discount?: number;
  finalPrice?: number;
};

const GalleryItem: React.FC<Props> = ({
  src,
  name,
  price,
  isMobile = false,
  colors = [],
  isNew = false,
  discount = 0,
  finalPrice,
}) => {
  const imgWidth = isMobile ? '49vw' : '100%';

  // Use a fixed aspect ratio so height scales with width. Choose a ratio
  // that keeps the image taller than wide (approx height/width ~ 1.4).
  // aspect-ratio accepts width / height, so 5 / 7 gives height ~= 1.4 * width.
  const aspect = '5 / 7';
  const hasDiscount = discount && discount > 0;

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
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
            zIndex: 40,
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
                -{discount}%
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* aspect-ratio ensures height is derived from width so it always keeps the same relation */}
      <div className="relative" style={{ width: '100%', aspectRatio: aspect }}>
        <Image src={src} alt={name} fill style={{ objectFit: 'cover' }} />
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
                  //   border: i === 0 ? '2px solid #000' : '1px solid #eee',
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
