'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import buildProductSlug from '../utils/buildProductSlug';
import type { InterestItem } from '../hooks/useInterestRecommendations';
import FireIcon from './FireIcon';

type Cloth = {
  src: string;
  name: string;
  price: string;
};

const clothes: Cloth[] = [
  { src: '/clothes/clothe-1.png', name: 'Chaqueta Derby', price: 'Bs. 450' },
  { src: '/clothes/clothe-2.png', name: 'Pantalón Slim', price: 'Bs. 350' },
  { src: '/clothes/clothe-3.png', name: 'Suéter Lana', price: 'Bs. 400' },
  { src: '/clothes/clothe-4.png', name: 'Blusa Seda', price: 'Bs. 380' },
  { src: '/clothes/clothe-1.png', name: 'Chaqueta Derby', price: 'Bs. 450' },
  { src: '/clothes/clothe-2.png', name: 'Pantalón Slim', price: 'Bs. 350' },
  { src: '/clothes/clothe-3.png', name: 'Suéter Lana', price: 'Bs. 400' },
  { src: '/clothes/clothe-4.png', name: 'Blusa Seda', price: 'Bs. 380' },
];

type Props = {
  isMobile?: boolean;
  items?: (
    | InterestItem
    | {
        src?: string;
        image?: string;
        name: string;
        price: string;
        id?: string | number;
        discountPercent?: number;
      }
  )[];
};

type ItemEntry =
  | InterestItem
  | {
      src?: string;
      image?: string;
      name: string;
      price: string;
      id?: string | number;
      discountPercent?: number;
    };

export default function ClothesSlider({ isMobile = false, items }: Props) {
  const router = useRouter();
  const slideWidth = isMobile ? '40vw' : '16.666vw';
  const slideHeight = isMobile ? '60vw' : '25vw';

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 5);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isMobile]);

  const scrollBy = (delta: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const calcOneStep = () => {
    const el = containerRef.current;
    if (!el) return 0;
    const ul = el.querySelector('ul');
    const first = ul?.querySelector('li') as HTMLElement | null;
    if (!first) return 0;
    const liRect = first.getBoundingClientRect();
    const ulStyle = window.getComputedStyle(ul as Element);
    const gap = parseFloat(ulStyle.gap || ulStyle.columnGap || '0') || 0;
    return Math.round(liRect.width + gap);
  };

  const handlePrev = () => {
    const step = calcOneStep();
    if (!step) return;
    scrollBy(-step);
  };

  const handleNext = () => {
    const step = calcOneStep();
    if (!step) return;
    scrollBy(step);
  };

  return (
    <div className="w-full relative">
      {/* arrows only visible on desktop */}
      {!isMobile && canScrollLeft && (
        <button
          aria-label="Previous"
          onClick={handlePrev}
          className="hidden md:flex items-center justify-center"
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '9999px',
            color: '#000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 30,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div
        ref={containerRef}
        className="w-full overflow-x-auto hide-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <ul
          className="flex gap-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            minWidth: 'fit-content',
            overflow: 'hidden',
            paddingTop: '0.25rem',
          }}
        >
          {(items && items.length > 0 ? items : clothes).map(
            (c: ItemEntry, idx) => {
              let src = '';
              if ('image' in c && c.image) src = c.image;
              else if ('src' in c && c.src) src = c.src;
              const id = 'id' in c ? c.id : undefined;
              const discountPercent =
                'discountPercent' in c ? c.discountPercent ?? 0 : 0;
              const priceColor = discountPercent > 0 ? '#ff4d4f' : '#ffffff';
              return (
                <li
                  key={idx}
                  className="flex flex-col"
                  style={{ width: slideWidth, cursor: 'pointer' }}
                  onClick={() => {
                    try {
                      const slug = buildProductSlug(c.name, id);
                      if (!slug) return;
                      router.push(`/w/${slug}`);
                    } catch (err) {
                      void err;
                    }
                  }}
                >
                  <div
                    style={{ width: slideWidth, height: slideHeight }}
                    className="relative overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt={c.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes={isMobile ? '48vw' : '25vw'}
                    />
                  </div>
                  <div
                    className="mt-2 text-white"
                    style={{ paddingLeft: 4, paddingRight: 4 }}
                  >
                    <div
                      className="text-sm md:text-base"
                      style={{
                        opacity: 0.95,
                        marginTop: '0.5rem',
                        paddingLeft: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                    <div
                      className="text-base md:text-lg font-bold"
                      style={{
                        marginTop: 4,
                        paddingLeft: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: priceColor,
                      }}
                    >
                      <span>{c.price}</span>
                      {discountPercent > 0 && (
                        <span style={{ transform: 'translateY(-1px)' }}>
                          <FireIcon size={16} color="#ff4d4f" />
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            }
          )}
        </ul>
      </div>

      {!isMobile && canScrollRight && (
        <button
          aria-label="Next"
          onClick={handleNext}
          className="hidden md:flex items-center justify-center"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '9999px',
            background: '#fff',
            color: '#000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 30,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
