'use client';
import React, { useEffect, useState } from 'react';

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import NewsRoulette from '@/components/NewsRoulette';

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
        <h2>Nueva Colección</h2>
        <p>Explora las últimas tendencias en moda femenina.</p>
      </div>
    </React.Fragment>
  );
};

export default PageContainer;
