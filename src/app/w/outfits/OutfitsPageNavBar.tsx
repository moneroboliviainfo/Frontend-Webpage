'use client';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useEffect, useRef, useState } from 'react';
import '../../[gender]/clothes/clothes.css';

const OutfitsPageNavBar: React.FC = () => {
  const isMobile = useIsMobile();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height ?? 0;
      setHeaderHeight(Math.ceil(h));
    };
    // measure after mount
    measure();
    window.addEventListener('resize', measure);
    // also re-measure a bit after fonts/images load
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [isMobile]);

  // hide on scroll down / show on scroll up (mobile only)
  useEffect(() => {
    lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;
    const THRESHOLD = 10;
    const onScroll = () => {
      const current = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = current - lastScrollY.current;
          if (Math.abs(delta) > THRESHOLD) {
            if (delta > 0 && current > 50) {
              setShowHeader(false);
            } else {
              setShowHeader(true);
            }
            lastScrollY.current = current;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  // keep a CSS variable on :root so spacer and CSS can use it
  useEffect(() => {
    try {
      document.documentElement.style.setProperty(
        '--header-height',
        `${headerHeight}px`
      );
    } catch {}
  }, [headerHeight]);

  return (
    <>
      {/* fixed header: title + subtitle + divider */}
      <div
        ref={headerRef}
        className={`clothes-header ${
          showHeader ? '' : 'clothes-header--hidden'
        }`}
        style={{
          zIndex: 1,
        }}
      >
        {/* title */}
        <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          <h1
            className="clothes-header__title"
            style={{
              fontSize: isMobile ? '1.1rem' : '1.5rem',
              textAlign: 'left',
            }}
          >
            Obtén el estilo
          </h1>
        </div>

        {/* subtitle */}
        <div
          style={{
            textAlign: 'left',
            paddingLeft: '1rem',
            paddingRight: '1rem',
          }}
        >
          <p
            style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              color: '#6b7280',
              margin: 0,
            }}
          >
            Toma inspiración de los outfits que preparamos para tí
          </p>
        </div>

        <div
          className="w-full clothes-header__divider"
          aria-hidden="true"
          style={{ marginTop: '0.75rem' }}
        />
      </div>

      {/* spacer to avoid content being hidden behind fixed header; collapses when header is hidden */}
      <div className="clothes-header__spacer" aria-hidden />
    </>
  );
};

export default OutfitsPageNavBar;
