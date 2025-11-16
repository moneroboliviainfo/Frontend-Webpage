'use client';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import React, { useRef, useState } from 'react';

type ProductDetails = {
  multimedia: Array<{ image: string; label: string }>;
  productId: number;
  name: string;
  price: number;
  colorsWithSizes: Array<{
    color: string;
    sizes: Array<{ size: string; availability: number }>;
  }>;
  isNew: boolean;
  discount: number;
  finalPrice: number;
  description: string;
  slug?: string;
};

type Props = {
  productDetails: ProductDetails;
  allProducts?: ProductDetails[]; // Array of all products for swiping
  currentProductIndex?: number; // Current product index
  onProductChange?: (index: number) => void; // Callback when product changes
};

const ProductPageMobile: React.FC<Props> = ({
  productDetails,
  allProducts = [productDetails],
  currentProductIndex = 0,
  onProductChange,
}) => {
  // Helper function to check if a color has any available sizes
  const isColorAvailable = (colorIndex: number) => {
    return (
      productDetails.colorsWithSizes[colorIndex]?.sizes.some(
        (sizeInfo) => sizeInfo.availability > 0
      ) || false
    );
  };

  // Get sizes for currently selected color
  const getCurrentSizes = () => {
    return productDetails.colorsWithSizes[selectedColorIndex]?.sizes || [];
  };

  // selected color index (first color selected by default)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  // selected size index (no size selected by default)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(
    null
  );

  const bottomSheetRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Swipe detection states
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(
    null
  );
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe start
  const handleSwipeStart = (clientX: number, clientY: number) => {
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
    setIsHorizontalSwipe(null); // Reset direction detection
  };

  // Handle swipe move
  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!isDragging || startX === null || startY === null) return;

    const diffX = clientX - startX;
    const diffY = clientY - startY;

    // Determine swipe direction on first significant movement
    if (
      isHorizontalSwipe === null &&
      (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)
    ) {
      const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      setIsHorizontalSwipe(isHorizontal);

      // If it's a vertical swipe, don't handle horizontal movement
      if (!isHorizontal) {
        return;
      }
    }

    // Only process horizontal swipes
    if (isHorizontalSwipe === false) {
      return;
    }

    // Only allow swipe if not at boundaries
    if (
      (diffX > 0 && currentProductIndex === 0) ||
      (diffX < 0 && currentProductIndex === allProducts.length - 1)
    ) {
      return;
    }

    setTranslateX(diffX);
  };

  // Handle swipe end
  const handleSwipeEnd = () => {
    if (!isDragging || startX === null) return;

    // Only process swipe if it was determined to be horizontal
    if (isHorizontalSwipe === true) {
      const swipeThreshold = 100;

      if (Math.abs(translateX) > swipeThreshold) {
        const direction = translateX > 0 ? -1 : 1; // Right swipe = -1 (previous), Left swipe = 1 (next)
        const newIndex = currentProductIndex + direction;

        if (newIndex >= 0 && newIndex < allProducts.length && onProductChange) {
          // Add a slight delay for smooth transition
          setTimeout(() => {
            onProductChange(newIndex);
            // Reset selections for new product
            setSelectedColorIndex(0);
            setSelectedSizeIndex(null);
            // Collapse bottom sheet
            bottomSheetRef.current?.collapse();
          }, 100);
        }
      }
    }

    // Reset swipe state
    setTranslateX(0);
    setStartX(null);
    setStartY(null);
    setIsDragging(false);
    setIsHorizontalSwipe(null);
  };

  return (
    <div
      className="w-full"
      style={{
        height: '80vh',
      }}
      ref={containerRef}
      onTouchStart={(e) =>
        handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchMove={(e) =>
        handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={handleSwipeEnd}
      onMouseDown={(e) => handleSwipeStart(e.clientX, e.clientY)}
      onMouseMove={(e) =>
        e.buttons === 1 && handleSwipeMove(e.clientX, e.clientY)
      }
      onMouseUp={handleSwipeEnd}
      onMouseLeave={handleSwipeEnd}
    >
      {/* Top 85% - Primary color with slider */}
      <div style={{ height: '100%' }} className="relative">
        <div
          className="absolute inset-0"
          style={{
            opacity: 1,
            transform: `translateX(${translateX}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 300ms ease, opacity 200ms ease',
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
            slidesData={productDetails.multimedia}
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
            height: sheetExpanded ? '31vh' : '20vh',
            paddingTop: '0.1rem',
            paddingLeft: '0.7rem',
            paddingRight: '0.7rem',
            background: 'white',
          }}
        >
          {/* first row: name left, price right */}
          <div className="flex justify-between items-center">
            <h2
              className="font-semibold"
              style={{
                fontSize: '1rem',
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {productDetails.name}
            </h2>
            <div className="flex items-center gap-2">
              {productDetails.discount > 0 && (
                <div
                  style={{
                    padding: '2px 4px',
                    borderRadius: 4,
                    border: '1px solid #dc2626',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  - {productDetails.discount}%
                </div>
              )}
              <div
                className="font-bold"
                style={{
                  fontSize: '1rem',
                  color: productDetails.discount > 0 ? '#dc2626' : '#000',
                  position: 'relative',
                }}
              >
                {productDetails.discount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-0.8rem',
                      right: 0,
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: '#6b7280',
                      textDecoration: 'line-through',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Bs. {productDetails.price}
                  </span>
                )}
                Bs. {productDetails.finalPrice}
              </div>
            </div>
          </div>

          {/* second row: centered color swatches */}
          <div
            className="flex items-center"
            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
          >
            <div className="flex">
              {productDetails.colorsWithSizes.map((colorData, i) => {
                const isSelected = i === selectedColorIndex;
                return (
                  <div
                    key={colorData.color + i}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedColorIndex(i);
                      // Reset size selection when color changes
                      setSelectedSizeIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedColorIndex(i);
                        setSelectedSizeIndex(null);
                      }
                    }}
                    style={{
                      // outer circle slightly bigger than inner color circle (inner:28)
                      width: 36,
                      height: 36,
                      marginRight:
                        i < productDetails.colorsWithSizes.length - 1 ? 6 : 0,
                      background: '#fff',
                      borderRadius: 9999,
                      boxSizing: 'border-box',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // border is black when selected, white when not
                      border: isSelected ? '1px solid #000' : '1px solid #fff',
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
                        background: colorData.color,
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* description section - only visible when sheet is expanded */}
          {sheetExpanded && (
            <div
              className="flex items-center justify-center"
              style={{
                marginTop: '1rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
              }}
            >
              <div className="flex items-center">
                {/* Info icon */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 8,
                    borderRadius: '50%',
                    border: '1.5px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  i
                </div>
                {/* Description text */}
                <span
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400',
                    display: 'block',
                    maxHeight: 'calc(2 * 1.2em)', // 2 lines with line-height
                    lineHeight: '1.2em',
                    overflowY: 'hidden',
                  }}
                >
                  {productDetails.description}
                </span>
              </div>
            </div>
          )}

          {/* size guide labels - only visible when sheet is expanded */}
          {sheetExpanded && (
            <div
              className="flex justify-between items-center"
              style={{ marginTop: '1rem' }}
            >
              <div className="flex items-center">
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: 'blue',
                    fontWeight: '500',
                  }}
                >
                  Guía de tallas {'>'}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  style={{
                    fontSize: '14px',
                    color: 'blue',
                    fontWeight: '500',
                  }}
                >
                  Cómo medirme {'>'}
                </span>
              </div>
            </div>
          )}

          {/* size selection - only visible when sheet is expanded */}
          {sheetExpanded && (
            <div
              className="flex items-center justify-center"
              style={{ marginTop: '1rem' }}
            >
              <div className="flex">
                {getCurrentSizes().map((sizeData, i) => {
                  const isSelected = i === selectedSizeIndex;
                  const isAvailable = sizeData.availability > 0;
                  return (
                    <div
                      key={sizeData.size}
                      role="button"
                      tabIndex={isAvailable ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSizeIndex(i);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          isAvailable &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          setSelectedSizeIndex(i);
                        }
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        marginRight: i < getCurrentSizes().length - 1 ? 8 : 0,
                        background: isSelected
                          ? '#000'
                          : isAvailable
                          ? '#fff'
                          : '#f3f4f6',
                        color: isSelected
                          ? '#fff'
                          : isAvailable
                          ? '#000'
                          : '#9ca3af',
                        borderRadius: 6,
                        border: `1px solid ${
                          isAvailable ? '#e5e7eb' : '#d1d5db'
                        }`,
                        boxSizing: 'border-box',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.6,
                      }}
                    >
                      {sizeData.size}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* size availability - only visible when sheet is expanded and size is selected */}
          {sheetExpanded && (
            <div
              className="flex items-center justify-center"
              style={{
                marginTop: '0.75rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#dc2626', // red color
                  fontWeight: '400',
                  display: 'block',
                  maxHeight: 'calc(2 * 1.1em)', // 2 lines with line-height
                  lineHeight: '1.1em',
                }}
              >
                {!isColorAvailable(selectedColorIndex)
                  ? '¡COLOR AGOTADO!'
                  : selectedSizeIndex !== null
                  ? `Disponibles: ${
                      getCurrentSizes()[selectedSizeIndex]?.availability || 0
                    }`
                  : ''}
              </span>
            </div>
          )}

          {/* third row: centered CTA button */}
          <div className="flex justify-center" style={{ marginTop: '1rem' }}>
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
                ELEGIR TALLA
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProductPageMobile;
