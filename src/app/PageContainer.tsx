'use client';
import React, { useEffect, useState } from 'react';

import { FiArrowRight } from 'react-icons/fi';
import GalleryTile from '@/components/GalleryTile';
import SectionHeader from '@/components/SectionHeader';

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import CategorySliderWithImages from '@/components/CategorySliderWithImages';

// Slides for each mode
const horSlides = [
  { image: '/images/hor-slide-1-white.png', label: '' },
  { image: '/images/Portadas_web-01-2.jpg', label: '' },
  { image: '/images/Portadas_web-02-2.jpg', label: '' },
];
const verSlides = [
  { image: '/images/ver-slide-1.png', label: '' },
  { image: '/images/ver-slide-2.png', label: '' },
];

const galleryImages = [
  { src: '/images/ver-slide-1.png', label: 'Outfit 1' },
  { src: '/images/ver-slide-2.png', label: 'Outfit 2' },
  { src: '/images/ver-slide-2.png', label: 'Outfit 3' },
];

const PageContainer: React.FC = () => {
  // Responsive: use vertical slides for mobile, horizontal for desktop
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <React.Fragment>
      <div className="w-full flex flex-col" style={{ height: '85vh' }}>
        {/* Top 85% - Primary color with slider */}
        <div style={{ height: '100%' }} className="relative">
          <div className="absolute inset-0">
            <ImageSlider
              direction="horizontal"
              slidesData={isMobile ? verSlides : horSlides}
              autoplayDelay={3500}
              showNews={true}
            />
          </div>
        </div>
      </div>
      <div>
        <CategorySliderWithImages />
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: 'white', paddingBottom: '0.17rem' }}
      >
        <SectionHeader
          title="MIRA LOS OUTFITS"
          subtitle="Hecha un vistazo a todos los outfits que preparamos para ti. Listos para cada ocasión, inspírate y encuentra tu estilo."
          fontColor="#374151"
          isMobile={isMobile}
        />
        <div className="w-full">
          <div
            className={
              isMobile
                ? 'grid grid-cols-2 gap-1 w-full'
                : 'flex flex-row gap-1 w-full'
            }
            style={{
              marginTop: isMobile ? '1rem' : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {galleryImages.map((img, idx) => (
              <GalleryTile
                key={idx}
                src={img.src}
                label={img.label}
                isMobile={isMobile}
                idx={idx}
                priority={idx === 0}
              />
            ))}

            {/* Static "Ver todos" tile */}
            <GalleryTile
              key="ver-todos"
              src="/categories/all-categories.png"
              label="Ver todos"
              isMobile={isMobile}
              priority={false}
            />
          </div>
        </div>
      </div>
      <div className="w-full" style={{ backgroundColor: 'black' }}>
        <SectionHeader
          title="ROPA PARA HOMBRES"
          fontColor="white"
          isMobile={isMobile}
        />
        <div className="w-full"></div>
      </div>
    </React.Fragment>
  );
};

export default PageContainer;
