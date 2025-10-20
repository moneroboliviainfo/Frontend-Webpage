import React from 'react';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

type Props = {
  src: string;
  label: string;
  isMobile: boolean;
  idx?: number;
  priority?: boolean;
  // optional overrides
  height?: string;
  width?: string;
  fontSize?: string;
};

const GalleryTile: React.FC<Props> = ({
  src,
  label,
  isMobile,
  idx = 0,
  priority = false,
  height,
  width,
  fontSize,
}) => {
  const calcHeight = height ?? (isMobile ? '37vh' : '56vh');
  const calcWidth = width ?? (isMobile ? '49.5vw' : '27vw');
  const calcFont = fontSize ?? (isMobile ? '4.5vw' : '2vh');

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: calcHeight,
        width: calcWidth,
        marginLeft: isMobile && idx % 2 === 0 ? 0 : undefined,
        marginRight: isMobile && idx % 2 === 1 ? 0 : undefined,
      }}
    >
      <Image
        src={src}
        alt={label}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 48vw, 25vw"
        priority={priority}
      />

      <div
        className="absolute left-0 bottom-0 w-full flex items-center justify-between"
        style={{
          fontWeight: 'bold',
          color: '#fff',
          fontSize: calcFont,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            marginLeft: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginRight: '0.5rem',
          }}
          aria-hidden
        >
          <FiArrowRight
            style={{ fontSize: calcFont, color: '#fff', fontWeight: 'bolder' }}
          />
        </span>
      </div>
    </div>
  );
};

export default GalleryTile;
