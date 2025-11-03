'use client';
import PillsList from '@/components/PillsList';
import useIsMobile from '@/hooks/useIsMobile';
import React from 'react';
import ClothesGallery from './ClothesGallery';

type Props = {
  gender: string;
  category: string;
};

const ClothesPageBody: React.FC<Props> = ({ gender, category }) => {
  const isMobile = useIsMobile();

  const formatLabel = (s: string) => {
    if (!s) return s;
    // replace hyphens/underscores with spaces
    const spaced = s.toString().replace(/[-_]+/g, ' ').trim();
    // capitalize only the first character and lowercase the rest
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  };

  return (
    <>
      {/* title */}
      <div style={{ marginTop: '3.5rem' }}>
        <h1
          style={{
            paddingLeft: '1rem',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
          }}
        >
          {category
            ? formatLabel(category)
            : `${formatLabel(gender)} - Colección`}
        </h1>
      </div>
      {/* pills */}
      <div className="w-full">
        <PillsList />
      </div>
      <div
        className="w-full h-px"
        style={{ backgroundColor: 'red' }}
        aria-hidden="true"
      />
      <ClothesGallery />
    </>
  );
};

export default ClothesPageBody;
