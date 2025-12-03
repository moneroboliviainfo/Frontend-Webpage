'use client';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import GalleryTile from '@/components/GalleryTile';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import { FiMonitor, FiTruck, FiSmile } from 'react-icons/fi';
import { useSlidersData } from '@/hooks/useGenderPageData';
import { CLOTHING_API_CONSTANTS } from '@/services/clothingService';
import type { RootState } from '@/store/store';

// Inline QR SVG icon (replaces FiCreditCard). Uses currentColor so it follows surrounding styles.
const QrIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    aria-hidden="true"
    role="img"
    fill="currentColor"
  >
    <path d="M8,21H4a1,1,0,0,1-1-1V16a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H8a1,1,0,0,0,0-2Zm14-6a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H16a1,1,0,0,0,0,2h4a3,3,0,0,0,3-3V16A1,1,0,0,0,22,15ZM20,1H16a1,1,0,0,0,0,2h4a1,1,0,0,1,1,1V8a1,1,0,0,0,2,0V4A3,3,0,0,0,20,1ZM2,9A1,1,0,0,0,3,8V4A1,1,0,0,1,4,3H8A1,1,0,0,0,8,1H4A3,3,0,0,0,1,4V8A1,1,0,0,0,2,9Zm8-4H6A1,1,0,0,0,5,6v4a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V6A1,1,0,0,0,10,5ZM9,9H7V7H9Zm5,2h4a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1H14a1,1,0,0,0-1,1v4A1,1,0,0,0,14,11Zm1-4h2V9H15Zm-5,6H6a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,17H7V15H9Zm5-1a1,1,0,0,0,1-1,1,1,0,0,0,0-2H14a1,1,0,0,0-1,1v1A1,1,0,0,0,14,16Zm4-3a1,1,0,0,0-1,1v3a1,1,0,0,0,0,2h1a1,1,0,0,0,1-1V14A1,1,0,0,0,18,13Zm-4,4a1,1,0,1,0,1,1A1,1,0,0,0,14,17Z" />
  </svg>
);

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import CategorySliderWithImages from '@/components/CategorySliderWithImages';
import ClothesSlider from '@/components/ClothesSlider';
import useInterestRecommendations from '@/hooks/useInterestRecommendations';
import useIsMobile from '@/hooks/useIsMobile';

// Frontend gender constants to match route parameters
const FRONTEND_GENDERS = {
  MEN: 'men' as const,
  WOMEN: 'women' as const,
} as const;

type PageContainerProps = {
  gender?: string;
};

const PageContainer: React.FC<PageContainerProps> = ({ gender = 'women' }) => {
  // Responsive: use vertical slides for mobile, horizontal for desktop
  const isMobile = useIsMobile();

  // Get outfits from Redux store
  const allOutfits = useSelector((state: RootState) => state.clothing.outfits);

  // Convert gender string to API format (moved up so it's available for gallery filtering)
  const apiGender: 'male' | 'female' =
    gender === FRONTEND_GENDERS.MEN
      ? CLOTHING_API_CONSTANTS.GENDERS.MALE
      : CLOTHING_API_CONSTANTS.GENDERS.FEMALE;

  // Get last 3 outfits for gallery, filtered by page gender (the API now returns outfit.gender)
  const galleryOutfits = useMemo(() => {
    const filtered = allOutfits.filter(
      (outfit) =>
        (outfit as unknown as { gender?: string }).gender === apiGender
    );
    return filtered
      .slice(-3) // Get last 3 outfits for the gallery
      .map((outfit) => ({
        src:
          outfit.images && outfit.images.length > 0
            ? outfit.images[0]
            : '/images/default-outfit.jpg',
        label: outfit.name,
        href: `/w/outfits?outfit=${encodeURIComponent(
          `${outfit.name}-${outfit.id}`
        )}`,
        id: outfit.id,
      }));
  }, [allOutfits, apiGender]);

  // Get sliders data (no loading logic needed, handled by Suspense)
  const { desktopSliders, mobileSliders } = useSlidersData(apiGender);

  // Use API sliders based on viewport
  const currentSlides = isMobile ? mobileSliders : desktopSliders;

  // Determine the outfits URL based on gender
  const outfitsUrl = `/w/outfits/${gender}`;

  // Recommendations for "Te podría interesar"
  const { items: interestItems } = useInterestRecommendations(apiGender);

  return (
    <React.Fragment>
      <div className="w-full flex flex-col" style={{ height: '85vh' }}>
        {/* Top 85% - Primary color with slider */}
        <div style={{ height: '100%' }} className="relative">
          <div className="absolute inset-0">
            {currentSlides.length > 0 ? (
              <ImageSlider
                direction="horizontal"
                slidesData={currentSlides}
                autoplayDelay={3500}
                showNews={true}
              />
            ) : (
              // No data available
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-center">
                  No hay sliders disponibles para esta sección
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <CategorySliderWithImages gender={gender} />
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
            {galleryOutfits.map((outfit, idx) => (
              <GalleryTile
                key={outfit.id}
                src={outfit.src}
                label={outfit.label}
                isMobile={isMobile}
                idx={idx}
                priority={idx === 0}
                href={outfit.href}
              />
            ))}

            {/* Static "Ver todos" tile */}
            <GalleryTile
              key="ver-todos"
              src={
                gender === FRONTEND_GENDERS.MEN
                  ? '/categories/Outfits-men.jpg'
                  : '/categories/all-outfits.jpg'
              }
              label="Ver todos"
              isMobile={isMobile}
              priority={false}
              href={outfitsUrl}
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
          {/* Te podría interesar: recommendations based on page gender */}
          <ClothesSlider
            isMobile={isMobile}
            items={interestItems.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              discountPercent: i.discountPercent || 0,
              image: i.image || '/clothes/clothe-1.png',
            }))}
          />
        </div>
      </div>
      <div
        className="w-full"
        style={{ backgroundColor: 'black', paddingTop: '0.17rem' }}
      >
        <SectionHeader
          title={gender === FRONTEND_GENDERS.MEN ? 'MUJERES' : 'HOMBRES'}
          fontColor="white"
          isMobile={isMobile}
        />
        <div className="w-full" style={{ marginTop: '0.17rem' }}>
          {/* unified relative wrapper so the overlay sits centered for both mobile and desktop */}
          <div className="relative w-full" style={{ height: '80vh' }}>
            {isMobile ? (
              <div className="absolute inset-0">
                <Image
                  src={
                    gender === FRONTEND_GENDERS.MEN
                      ? '/images/model-women-2.png'
                      : '/images/model-man-4.png'
                  }
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
                    src={
                      gender === FRONTEND_GENDERS.MEN
                        ? '/images/model-women-1.jpg'
                        : '/images/model-man-4.png'
                    }
                    alt="Model"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="50vw"
                  />
                </div>
                <div className="relative" style={{ flex: '1 1 0' }}>
                  <Image
                    src={
                      gender === FRONTEND_GENDERS.MEN
                        ? '/images/model-women-3.jpg'
                        : '/images/model-man3.png'
                    }
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
                {gender === FRONTEND_GENDERS.MEN
                  ? 'Moda Femenina'
                  : 'Moda Másculina'}
              </h2>
              <button
                type="button"
                onClick={() =>
                  (window.location.href = `/${
                    gender === FRONTEND_GENDERS.MEN ? 'women' : 'men'
                  }`)
                }
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
        style={{
          backgroundColor: 'white',
          paddingTop: '0.17rem',
          marginBottom: '1rem',
        }}
      >
        <div className="mx-auto w-full" style={{ padding: '1rem' }}>
          <div
            className={
              isMobile
                ? 'grid grid-cols-2 gap-4'
                : 'flex flex-wrap justify-center gap-6 w-full'
            }
          >
            {[
              { Icon: FiMonitor, label: 'Ordena en línea' },
              { Icon: FiTruck, label: 'Entregas a todo el país' },
              { Icon: QrIcon, label: 'Paga con QR' },
              { Icon: FiSmile, label: 'Clientes Satisfechos' },
            ].map(({ Icon, label }, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg"
                style={{
                  width: isMobile ? '100%' : '220px',
                  borderWidth: 1,
                  padding: '1rem',
                  borderColor: 'gray',
                }}
              >
                <Icon
                  style={{
                    width: 36,
                    height: 36,
                    color: '#111',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    color: '#111',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PageContainer;
