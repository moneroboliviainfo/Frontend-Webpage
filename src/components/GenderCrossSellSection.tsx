'use client';
import React from 'react';
import Image from 'next/image';
import SectionHeader from './SectionHeader';

interface GenderCrossSellSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  mobileImage: string;
  desktopImage1: string;
  desktopImage2: string;
  isMobile: boolean;
}

const GenderCrossSellSection: React.FC<GenderCrossSellSectionProps> = ({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  mobileImage,
  desktopImage1,
  desktopImage2,
  isMobile,
}) => {
  return (
    <div
      className="w-full"
      style={{ backgroundColor: 'black', paddingTop: '0.17rem' }}
    >
      <SectionHeader title={title} fontColor="white" isMobile={isMobile} />
      <div className="w-full" style={{ marginTop: '0.17rem' }}>
        {/* unified relative wrapper so the overlay sits centered for both mobile and desktop */}
        <div className="relative w-full" style={{ height: '80vh' }}>
          {isMobile ? (
            <div className="absolute inset-0">
              <Image
                src={mobileImage}
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
                  src={desktopImage1}
                  alt="Model"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="50vw"
                />
              </div>
              <div className="relative" style={{ flex: '1 1 0' }}>
                <Image
                  src={desktopImage2}
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
              {subtitle}
            </h2>
            <button
              type="button"
              onClick={() => (window.location.href = buttonUrl)}
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
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderCrossSellSection;
