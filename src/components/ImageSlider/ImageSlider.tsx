'use client';
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ImageSlider.css';

// Example slides data
const slides = [
  {
    image: '/images/slide1.jpg',
    label: 'Accessories',
  },
  {
    image: '/images/slide2.jpg',
    label: 'Shoes',
  },
  {
    image: '/images/slide3.jpg',
    label: 'Bags',
  },
];

interface ImageSliderProps {
  direction?: 'horizontal' | 'vertical';
  slidesData?: { image: string; label: string }[];
  autoplayDelay?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  direction = 'horizontal',
  slidesData = slides,
  autoplayDelay = 3500,
}) => {
  return (
    <Swiper
      direction={direction}
      modules={[Pagination, Autoplay]}
      pagination={{
        clickable: true,
        type: 'bullets',
        // renderCustom: (swiper, current, total) => {
        //   let bullets = '';
        //   for (let i = 1; i <= total; i++) {
        //     bullets += `<span class="swiper-pagination-bullet${
        //       i === current ? ' swiper-pagination-bullet-active' : ''
        //     }" data-index="${i - 1}"></span>`;
        //   }
        //   return `<div class="swiper-pagination-custom">${bullets}</div>`;
        // },
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
  );
};

export default ImageSlider;
