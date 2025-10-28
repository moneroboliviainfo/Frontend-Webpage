'use client';
import React, { useEffect, useState } from 'react';

import GalleryTile from '@/components/GalleryTile';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import CategorySliderWithImages from '@/components/CategorySliderWithImages';
import ClothesSlider from '@/components/ClothesSlider';

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
      <div
        className="w-full"
        style={{ backgroundColor: 'black', paddingTop: '0.17rem' }}
      >
        <SectionHeader
          title="TE PODRÍA INTERESAR"
          fontColor="white"
          isMobile={isMobile}
        />
        <div className="w-full" style={{ marginTop: '0.17rem' }}>
          <ClothesSlider isMobile={isMobile} />
        </div>
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: 'black', paddingTop: '0.17rem' }}
      >
        <SectionHeader title="HOMBRES" fontColor="white" isMobile={isMobile} />
        <div className="w-full" style={{ marginTop: '0.17rem' }}>
          {/* unified relative wrapper so the overlay sits centered for both mobile and desktop */}
          <div className="relative w-full" style={{ height: '80vh' }}>
            {isMobile ? (
              <div className="absolute inset-0">
                <Image
                  src="/images/model-man-4.png"
                  alt="Model"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                  priority
                />
              </div>
            ) : (
              <div className="absolute inset-0 w-full flex">
                <div className="relative" style={{ flex: '1 1 0' }}>
                  <Image
                    src="/images/model-man-4.png"
                    alt="Model"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="50vw"
                  />
                </div>
                <div className="relative" style={{ flex: '1 1 0' }}>
                  <Image
                    src="/images/model-man3.png"
                    alt="Model 2"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="50vw"
                  />
                </div>
              </div>
            )}

            {/* Centered overlay (same position in mobile & desktop) */}
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center text-center"
              style={{ width: isMobile ? '80%' : '50%' }}
            >
              <h2
                className="text-white"
                style={{
                  fontSize: isMobile ? '1.2rem' : '2.7rem',
                  fontWeight: 'bolder',
                }}
              >
                Moda Másculina
              </h2>
              <button
                type="button"
                style={{
                  background: '#fff',
                  color: '#000',
                  fontWeight: 'bolder',
                  borderRadius: 10,
                  padding: '0.5rem 2rem 0.5rem 2rem',
                  fontSize: isMobile ? '1rem' : '1.5rem',
                  marginTop: '0.2rem',
                  cursor: 'pointer',
                }}
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: 'white', paddingTop: '0.17rem' }}
      >
        <div
          className="w-full flex items-center justify-center"
          style={{ minHeight: isMobile ? '40vh' : '30vh' }}
        >
          <div
            className="flex flex-col items-center text-center"
            style={{
              gap: '1rem',
              width: '100%',
              maxWidth: 860,
              padding: '0 1rem',
            }}
          >
            {/* Title: same size as SectionHeader */}
            <h2
              style={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 800,
                margin: 0,
                color: '#111',
              }}
            >
              SUSCRÍBETE PARA RECIBIR OFERTAS
            </h2>

            {/* Subtitle: 4x smaller than title */}
            <p
              style={{
                fontSize: isMobile ? '0.85rem' : '1.1rem',
                margin: 0,
                color: '#374151',
                maxWidth: 720,
                lineHeight: 1.3,
              }}
            >
              Sé la primera en recibir las nuevas colecciones, promociones y
              mucho más
            </p>

            {/* Input + Button row */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.75rem',
              }}
            >
              <input
                aria-label="Ingresa tu correo"
                placeholder="Ingresa tu correo"
                type="email"
                className="bg-white"
                style={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  padding: isMobile ? '0.5rem 0.75rem' : '0.6rem 1rem',
                  width: isMobile ? '65%' : 420,
                  maxWidth: '100%',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                style={{
                  marginLeft: 12,
                  background: '#000',
                  color: '#fff',
                  borderRadius: 9999,
                  padding: isMobile ? '0.5rem 0.9rem' : '0.6rem 1.25rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Súscribete
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: 'white', paddingTop: '0.17rem' }}
      ></div>
    </React.Fragment>
  );
};

export default PageContainer;
