'use client';
import Footer from '@/components/Footer';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import NavBar from '@/components/nav/NavBar';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const verSlides = [
  { image: '/images/ver-slide-1.png', label: '' },
  { image: '/images/ver-slide-2.png', label: '' },
];

const ProductPage = () => {
  const isMobile = useIsMobile();
  const params = useParams();
  const rawProductParam = params?.product;
  const productParam = Array.isArray(rawProductParam)
    ? rawProductParam[0]
    : rawProductParam ?? '';
  // parse slug like "104-blusa-seda" -> id:104 name: Blusa Seda
  const parts = productParam ? productParam.split('-') : [];
  const maybeId =
    parts.length > 0 && /^\d+$/.test(parts[0]) ? parts[0] : undefined;
  const nameParts = maybeId ? parts.slice(1) : parts;
  const rawName = nameParts.length ? nameParts.join(' ') : 'Producto';
  const productName = rawName
    .split(' ')
    .map((w: string) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
  const priceDisplay = 'Bs. 0'; // placeholder — replace with real data fetch if available
  const colors = ['#111827', '#f97316', '#e53e3e'];

  // selected color index (first color selected by default)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  const bottomSheetRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  return (
    <>
      <NavBar dynamicTransparent={isMobile} />
      {isMobile ? (
        <div className="w-full" style={{ height: '80vh' }}>
          {/* Top 85% - Primary color with slider */}
          <div style={{ height: '100%' }} className="relative">
            <div
              className="absolute inset-0"
              style={{
                transition: 'opacity 200ms ease',
                opacity: 1,
              }}
              id="product-slider-container"
              onClick={() => {
                // if bottom sheet is expanded, collapse it when the slider area is clicked
                if (sheetExpanded) {
                  bottomSheetRef.current?.collapse();
                }
              }}
            >
              <ImageSlider
                direction="vertical"
                slidesData={verSlides}
                autoplayDelay={0}
                showNews={false}
                onSlide={() => {
                  // collapse the bottom sheet when the user slides the image carousel
                  bottomSheetRef.current?.collapse();
                }}
              />
            </div>
          </div>

          {/* BottomSheet contains the product quick info and starts collapsed at 18vh */}
          {/* track expanded state to dim the slider */}
          <BottomSheet
            ref={bottomSheetRef}
            initialHeightVh={21}
            expandedHeightVh={40}
            onExpandedChange={(expanded) => {
              setSheetExpanded(expanded);
              const el = document.getElementById('product-slider-container');
              if (el) {
                // darken the slider when expanded (reduce brightness) instead of lowering opacity
                el.style.transition = 'filter 200ms ease';
                el.style.filter = expanded ? 'brightness(0.80)' : 'none';
              }
            }}
          >
            <div
              className="w-full"
              style={{
                height: '15vh',
                paddingTop: '0.1rem',
                paddingLeft: '0.7rem',
                paddingRight: '0.7rem',
                background: 'white',
              }}
            >
              {/* first row: name left, price right */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold" style={{ fontSize: '1rem' }}>
                  {productName}
                </h2>
                <div
                  className="font-bold text-black"
                  style={{ fontSize: '1rem' }}
                >
                  {priceDisplay}
                </div>
              </div>

              {/* second row: centered color swatches */}
              <div
                className="flex items-center"
                style={{ marginTop: '0.5rem', justifyContent: 'center' }}
              >
                <div className="flex">
                  {colors.map((c, i) => {
                    const isSelected = i === selectedColorIndex;
                    return (
                      <div
                        key={c + i}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedColorIndex(i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedColorIndex(i);
                          }
                        }}
                        style={{
                          // outer circle slightly bigger than inner color circle (inner:28)
                          width: 36,
                          height: 36,
                          marginRight: i < colors.length - 1 ? 6 : 0,
                          background: '#ffffff',
                          borderRadius: 9999,
                          boxSizing: 'border-box',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          // border is black when selected, white when not
                          border: isSelected
                            ? '1px solid #000'
                            : '1px solid #fff',
                          // subtle shadow so white border is visible on white backgrounds if needed
                          boxShadow: isSelected
                            ? '0 0 0 0 rgba(0,0,0,0)'
                            : '0 0 0 0 rgba(0,0,0,0)',
                        }}
                      >
                        <div
                          aria-hidden
                          style={{
                            width: 28,
                            height: 28,
                            background: c,
                            borderRadius: 9999,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* third row: centered CTA button */}
              <div
                className="flex justify-center"
                style={{ marginTop: '1rem' }}
              >
                {!sheetExpanded && (
                  <button
                    type="button"
                    className="font-bold"
                    style={{
                      backgroundColor: '#000',
                      color: 'white',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      paddingLeft: '0.6rem',
                      paddingRight: '0.6rem',
                      borderRadius: '0.375rem',
                    }}
                    onClick={() => bottomSheetRef.current?.expand()}
                  >
                    TALLAS
                  </button>
                )}
              </div>
            </div>
          </BottomSheet>
        </div>
      ) : (
        <div className="w-full flex flex-col" style={{ height: '70vh' }}>
          {/* Top 70% - Primary color with slider */}
          <div style={{ height: '100%' }} className="relative">
            <div className="absolute inset-0">
              {/* <ImageSlider
                direction="horizontal"
                slidesData={horSlides}
                autoplayDelay={3500}
                showNews={false}
              /> */}
            </div>
          </div>
        </div>
      )}
      {!isMobile && <Footer />}
    </>
  );
};

export default ProductPage;
