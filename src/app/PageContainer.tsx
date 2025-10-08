'use client';
import React, { useEffect, useState } from 'react';

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import NewsRoulette from '@/components/NewsRoulette';
import CategorySliderWithImages from '@/components/CategorySliderWithImages';
import { FiArrowRight } from 'react-icons/fi';

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
      <div className="w-full flex flex-col" style={{ height: '85dvh' }}>
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
        style={
          isMobile
            ? { paddingTop: '0.5rem', paddingBottom: '0.5rem' }
            : { padding: '2rem 1rem' }
        }
      >
        <div className="flex flex-col md:flex-row items-start md:items-center w-full">
          {/* Title column */}
          <div className="flex items-center" style={{ paddingLeft: '0.3rem' }}>
            <h1
              className="font-bold flex items-center gap-2 whitespace-nowrap"
              style={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 'bold',
                lineHeight: 1.1,
              }}
            >
              <FiArrowRight
                style={
                  isMobile
                    ? { width: '2.5rem', height: '3rem', fontWeight: 'bold' }
                    : { width: '4rem', height: '3rem', fontWeight: 'bold' }
                }
              />
              MIRA LOS OUTFITS
            </h1>
          </div>
          {/* Subtitle column */}
          <div className="flex items-center" style={{ paddingLeft: '0.75rem' }}>
            <span
              className="text-base md:text-lg text-gray-700 font-normal mt-2 md:mt-0"
              style={{ lineHeight: 1.2 }}
            >
              Hecha un vistazo a todos los outfits que preparamos para ti.
              {isMobile ? (
                'Listos para cada ocasión, inspírate y encuentra tu estilo.'
              ) : (
                <>
                  <br />
                  Listos para cada ocasión, inspírate y encuentra tu estilo.
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PageContainer;
