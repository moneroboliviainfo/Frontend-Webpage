'use client';
import React, { useRef } from 'react';
import Image from 'next/image';

import NewsRoulette from '@/components/NewsRoulette';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ImageSlider.css';

interface ImageSliderProps {
  direction?: 'horizontal' | 'vertical';
  slidesData?: { image: string; label: string }[];
  autoplayDelay?: number;
  showNews?: boolean;
  // optional callback invoked when the active slide changes
  onSlide?: ((activeIndex: number) => void) | null;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  direction = 'horizontal',
  slidesData = [],
  autoplayDelay = 3500,
  showNews = false,
  onSlide = null,
}) => {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const progressContent = useRef<HTMLSpanElement | null>(null);
  const onAutoplayTimeLeft = (
    s: SwiperType,
    time: number,
    progress: number
  ) => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty(
        '--progress',
        String(1 - progress)
      );
    }
    if (progressContent.current) {
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    }
  };

  return (
    <div className="relative w-full h-full">
      <Swiper
        direction={direction}
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          type: 'bullets',
        }}
        autoplay={
          autoplayDelay === 0
            ? false
            : { delay: autoplayDelay, disableOnInteraction: false }
        }
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        onSlideChange={(s) => {
          try {
            if (onSlide) onSlide(s.activeIndex);
          } catch {
            // swallow errors from consumer callback to avoid breaking the slider
          }
        }}
        loop
        className="w-full h-full"
      >
        {slidesData.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ minHeight: 400 }}
            >
              <Image
                src={slide.image}
                alt={slide.label}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />
              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
                <span className="text-white text-3xl font-bold drop-shadow-lg">
                  {slide.label}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div>
      </Swiper>
      {showNews && (
        <NewsRoulette
          messages={[
            '¡Prueba suerte en nuestra ruleta y gana descuentos exclusivos!',
          ]}
        />
      )}
    </div>
  );
};

export default ImageSlider;
