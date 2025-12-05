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
import GenderCrossSellSection from '@/components/GenderCrossSellSection';
import SubscriptionSection from '@/components/SubscriptionSection';
import useInterestRecommendations from '@/hooks/useInterestRecommendations';
import useIsMobile from '@/hooks/useIsMobile';
import { FEATURE_FLAGS } from '@/config/features';

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

  // Map interaction state
  const [isMapInteracted, setIsMapInteracted] = React.useState(false);

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
      <div style={{ backgroundColor: 'var(--color-secondary)' }}>
        <CategorySliderWithImages gender={gender} />
      </div>
      <div
        className="w-full"
        style={{
          backgroundColor: 'var(--color-secondary)',
          paddingBottom: '0.17rem',
        }}
      >
        <SectionHeader
          title="MIRA LOS OUTFITS"
          subtitle="Hecha un vistazo a todos los outfits que preparamos para ti. Listos para cada ocasión, inspírate y encuentra tu estilo."
          fontColor="var(--color-primary)"
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
        style={{
          backgroundColor: 'var(--color-primary)',
          paddingTop: '0.17rem',
        }}
      >
        <SectionHeader
          title="TE PODRÍA INTERESAR"
          fontColor="var(--color-secondary)"
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
      {/* Gender Cross-Sell or Most Searched Section */}
      {FEATURE_FLAGS.WOMEN_ENABLED ? (
        // When women is enabled: show opposite gender
        <GenderCrossSellSection
          title={gender === FRONTEND_GENDERS.MEN ? 'MUJERES' : 'HOMBRES'}
          subtitle={
            gender === FRONTEND_GENDERS.MEN ? 'Moda Femenina' : 'Moda Másculina'
          }
          buttonText="Comprar"
          buttonUrl={`/${gender === FRONTEND_GENDERS.MEN ? 'women' : 'men'}`}
          mobileImage={
            gender === FRONTEND_GENDERS.MEN
              ? '/images/model-women-2.png'
              : '/images/model-man-4.png'
          }
          desktopImage1={
            gender === FRONTEND_GENDERS.MEN
              ? '/images/model-women-1.jpg'
              : '/images/model-man-4.png'
          }
          desktopImage2={
            gender === FRONTEND_GENDERS.MEN
              ? '/images/model-women-3.jpg'
              : '/images/model-man3.png'
          }
          isMobile={isMobile}
        />
      ) : (
        // When women is disabled: show most searched
        <GenderCrossSellSection
          title="LO MÁS BUSCADO"
          subtitle="Moda Másculina"
          buttonText="Comprar"
          buttonUrl="/men/results?search=most-searched"
          mobileImage="/images/monero-model-ver.jpg"
          desktopImage1="/images/monero-model-hor-1.jpg"
          desktopImage2="/images/monero-model-hor-2.jpg"
          isMobile={isMobile}
        />
      )}
      <SubscriptionSection isMobile={isMobile} />
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

      {/* Store Location Map Section */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#f9fafb',
          padding: isMobile ? '2rem 1rem' : '3rem 2rem',
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {/* Section Title */}
          <h2
            style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#111',
            }}
          >
            Encuéntranos
          </h2>

          {/* Map Container Wrapper */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Map Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '900px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e5e7eb',
              }}
              onMouseDown={() => setIsMapInteracted(true)}
              onTouchStart={() => setIsMapInteracted(true)}
              onWheel={() => setIsMapInteracted(true)}
            >
              {/* Google Maps Iframe */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d942.8948035900061!2d-65.24283895078571!3d-19.03825488718221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTnCsDAyJzE4LjEiUyA2NcKwMTQnMzMuOCJX!5e0!3m2!1ses!2sbo!4v1764953371157!5m2!1ses!2sbo"
                width="100%"
                height={isMobile ? '350' : '450'}
                style={{
                  border: 0,
                  display: 'block',
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Map Pin with Logo Overlay */}
              {!isMapInteracted && (
                <div
                  className="absolute"
                  style={{
                    top: 'calc(50% + 25px)',
                    left: 'calc(50% + 15px)',
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Pin Container */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {/* Circular Logo Container (Pin Head) */}
                    <div
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        padding: isMobile ? '0.15rem' : '0.4rem',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: isMobile ? '70px' : '90px',
                        height: isMobile ? '70px' : '90px',
                        border: '3px solid #e5e7eb',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <Image
                        src="/logos/Logo-Monero.png"
                        alt="Monero Logo"
                        width={isMobile ? 65 : 100}
                        height={isMobile ? 65 : 100}
                        style={{
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    {/* Pin Point */}
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: isMobile
                          ? '12px solid transparent'
                          : '18px solid transparent',
                        borderRight: isMobile
                          ? '12px solid transparent'
                          : '18px solid transparent',
                        borderTop: isMobile
                          ? '18px solid white'
                          : '24px solid white',
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
                        position: 'relative',
                        top: '-3px',
                        zIndex: 1,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              color: '#6b7280',
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#111' }}>Dirección:</strong> Destacamento
              317 N° 1110 (Frente al mundito)
            </p>
            <p>
              <strong style={{ color: '#111' }}>Horario:</strong> Lunes a
              Sábado, 9:00 AM - 7:00 PM
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PageContainer;
