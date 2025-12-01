'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import NewsRoulette from '@/components/NewsRoulette';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ImageSlider.css';

// Support both legacy and new API slider data
interface LegacySlide {
  image: string;
  label: string;
}

interface ApiSlide {
  id: number;
  name: string;
  image: string;
  button_text: string;
  url: string;
  slider_type: 'desktop' | 'mobile';
  gender: 'male' | 'female';
}

type SlideData = LegacySlide | ApiSlide;

// Type guard to check if slide is from API
const isApiSlide = (slide: SlideData): slide is ApiSlide => {
  return 'name' in slide && 'button_text' in slide && 'url' in slide;
};

interface ImageSliderProps {
  direction?: 'horizontal' | 'vertical';
  slidesData?: SlideData[];
  autoplayDelay?: number;
  showNews?: boolean;
  // optional callback invoked when the active slide changes
  onSlide?: ((activeIndex: number) => void) | null;
  // optional ref to expose next/prev controls to parent
  controlsRef?: React.MutableRefObject<{
    next: () => void;
    prev: () => void;
  } | null>;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  direction = 'horizontal',
  slidesData = [],
  autoplayDelay = 3500,
  showNews = false,
  onSlide = null,
  controlsRef = undefined,
}) => {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const progressContent = useRef<HTMLSpanElement | null>(null);
  const router = useRouter();

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

  // Handle slide click for navigation
  const handleSlideClick = (slide: SlideData) => {
    if (isApiSlide(slide)) {
      // Navigate to base domain + slider URL
      // Example: domain.com/women + slider.url: "women/clothes?category=new"
      // Result: domain.com/women/clothes?category=new
      router.push(`/${slide.url}`);
    }
  };

  // Get current active slide for displaying labels
  const [activeSlide, setActiveSlide] = React.useState(0);
  // Keep reference to swiper instance to expose controls
  const swiperRef = React.useRef<SwiperType | null>(null);

  // Safely get current slide with bounds checking
  const getCurrentSlide = () => {
    if (!slidesData.length) return null;
    const safeIndex = activeSlide % slidesData.length;
    return slidesData[safeIndex] || slidesData[0];
  };

  const currentSlide = getCurrentSlide();

  return (
    <div className="relative w-full h-full">
      <Swiper
        onSwiper={(s) => {
          swiperRef.current = s;
          if (controlsRef) {
            try {
              controlsRef.current = {
                next: () => s.slideNext(),
                prev: () => s.slidePrev(),
              };
            } catch {
              // ignore
            }
          }
        }}
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
            // Handle looped slides correctly
            const realIndex =
              s.realIndex !== undefined ? s.realIndex : s.activeIndex;
            setActiveSlide(realIndex);
            if (onSlide) onSlide(realIndex);
          } catch {
            // swallow errors from consumer callback to avoid breaking the slider
          }
        }}
        loop
        className="w-full h-full"
      >
        {slidesData.map((slide, idx) => (
          <SwiperSlide key={isApiSlide(slide) ? slide.id : idx}>
            <div
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              style={{ minHeight: 400 }}
              onClick={() => handleSlideClick(slide)}
            >
              <Image
                src={slide.image}
                alt={isApiSlide(slide) ? slide.name : slide.label}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />

              {/* Legacy label display */}
              {!isApiSlide(slide) && slide.label && (
                <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
                  <span className="text-white text-3xl font-bold drop-shadow-lg">
                    {slide.label}
                  </span>
                </div>
              )}
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

      {/* API Slider Labels - positioned above pagination dots */}
      {currentSlide && isApiSlide(currentSlide) && (
        <div className="absolute bottom-16 left-0 w-full flex flex-col items-center z-10 pointer-events-none">
          <div
            className="text-center max-w-lg"
            style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
          >
            {/* Button text - smaller, on top */}
            <div
              className="text-white text-sm md:text-lg lg:text-xl font-medium drop-shadow-lg mb-1 opacity-90"
              style={{ marginBottom: '1rem' }}
            >
              {currentSlide.button_text}
            </div>
            {/* Name - larger, below button text */}
            <div
              className="text-white text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold drop-shadow-lg leading-tight"
              style={{ marginBottom: '1rem' }}
            >
              {currentSlide.name}
            </div>
          </div>
        </div>
      )}

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
