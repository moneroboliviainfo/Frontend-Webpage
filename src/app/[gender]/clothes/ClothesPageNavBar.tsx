import PillsList from '@/components/PillsList';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useEffect, useRef, useState } from 'react';
import './clothes.css';

type Props = {
  gender: string;
  category: string;
  subcategories: { id: number; name: string }[];
  selectedSubcategoryId: number | null;
  onSelectSubcategory: (id: number | null) => void;
};

const ClothesPageNavBar: React.FC<Props> = ({
  gender,
  category,
  subcategories,
  selectedSubcategoryId,
  onSelectSubcategory,
}) => {
  const isMobile = useIsMobile();

  const formatLabel = (s: string) => {
    if (!s) return s;
    // remove trailing number (category id) with optional space/dash
    const cleaned = s
      .replace(/([\s-]?\d+)$|([_]+\d+$)/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    // capitalize only the first character and lowercase the rest
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

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
      {/* fixed header: title + pills + divider */}
      <div
        ref={headerRef}
        className={`clothes-header ${
          showHeader ? '' : 'clothes-header--hidden'
        }`}
      >
        {/* title */}
        <div>
          <h1
            className="clothes-header__title"
            style={{ fontSize: isMobile ? '1.1rem' : '1.5rem' }}
          >
            {category
              ? formatLabel(category)
              : `${formatLabel(gender)} - Colección`}
          </h1>
        </div>

        {/* pills */}
        <div className="w-full">
          <PillsList
            subcategories={subcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelectSubcategory={onSelectSubcategory}
          />
        </div>

        <div className="w-full clothes-header__divider" aria-hidden="true" />
      </div>

      {/* spacer to avoid content being hidden behind fixed header; collapses when header is hidden */}
      <div className="clothes-header__spacer" aria-hidden />
    </>
  );
};

export default ClothesPageNavBar;
