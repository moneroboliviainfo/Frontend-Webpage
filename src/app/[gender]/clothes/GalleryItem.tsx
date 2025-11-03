import React from 'react';
import Image from 'next/image';

type Props = {
  src: string;
  name: string;
  price: string;
  isMobile?: boolean;
  colors?: string[];
  isNew?: boolean;
};

const GalleryItem: React.FC<Props> = ({
  src,
  name,
  price,
  isMobile = false,
  colors = [],
  isNew = false,
}) => {
  const imgWidth = isMobile ? '49vw' : '100%';

  // Use a fixed aspect ratio so height scales with width. Choose a ratio
  // that keeps the image taller than wide (approx height/width ~ 1.4).
  // aspect-ratio accepts width / height, so 5 / 7 gives height ~= 1.4 * width.
  const aspect = '5 / 7';

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
      {isNew && (
        <div
          aria-hidden={!isNew}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '2px 4px',
            borderRadius: 4,
            border: '1px solid #000',
            background: '#fff',
            color: '#000',
            fontSize: '0.65rem',
            fontWeight: 700,
            zIndex: 40,
            lineHeight: 1,
          }}
        >
          NUEVO
        </div>
      )}
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
        <div className="text-sm font-bold" style={{ marginTop: '0.2rem' }}>
          {price}
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
                className="flex items-center justify-center"
                style={{
                  width: '0.8rem',
                  height: '0.8rem',
                  borderRadius: '9999px',
                  background: c,
                  boxSizing: 'border-box',
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
