'use client';
import Image from 'next/image';

import NewsRoulette from '@/components/NewsRoulette';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ImageSlider.css';

interface ImageSliderProps {
  direction?: 'horizontal' | 'vertical';
  slidesData?: { image: string; label: string }[];
  autoplayDelay?: number;
  showNews?: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  direction = 'horizontal',
  slidesData = [],
  autoplayDelay = 3500,
  showNews = false,
}) => {
  return (
    <div className="relative w-full h-full">
      <Swiper
        direction={direction}
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          type: 'bullets',
        }}
        autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
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
