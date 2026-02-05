'use client';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import BasketConfirmation from '@/components/BasketConfirmation';
import AccessoriesSlider from '@/components/AccessoriesSlider';
import React, { useRef, useState, useEffect } from 'react';
import styles from './ProductPageDesktop.module.css';
import { addToCart } from '@/utils/cartStorage';
import type { CartItem } from '@/types/cart';
import {
  extractProductsFromCategory,
  ACCESSORIES_CATEGORY_IDS,
  type CategoryResponse,
} from '@/utils/categoryProducts';
import { Product } from '@/components/ProductsGallery';
import { API_URL } from '@/config/env';

type ProductDetails = {
  multimedia: Array<{ image: string; label: string }>;
  productId: number;
  name: string;
  price: number;
  colorsWithSizes: Array<{
    color: string;
    colorName?: string;
    sizes: Array<{
      size: string;
      availability: number;
      id?: number | null;
      variantId?: number | null;
    }>;
    firstMultimediaIndex?: number;
  }>;
  isNew: boolean;
  discount: number;
  finalPrice: number;
  description: string;
  sizeGuidePdf?: string | null;
  sizeGuideVideo?: string | null;
  slug?: string;
  gender?: 'male' | 'female';
};

type Props = {
  productDetails: ProductDetails;
  allProducts?: ProductDetails[]; // Array of all products for swiping
  currentProductIndex?: number; // Current product index
  onProductChange?: (index: number) => void; // Callback when product changes
  enableSwipeNavigation?: boolean;
  initialColorCode?: string; // Color code from query parameter
};

const ProductPageMobile: React.FC<Props> = ({
  productDetails,
  allProducts = [productDetails],
  currentProductIndex = 0,
  onProductChange,
  enableSwipeNavigation = true,
  initialColorCode,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  // Helper function to check if a color has any available sizes
  const isColorAvailable = (colorIndex: number) => {
    return (
      productDetails.colorsWithSizes[colorIndex]?.sizes.some(
        (sizeInfo) => sizeInfo.availability > 0,
      ) || false
    );
  };

  // Get sizes for currently selected color
  const getCurrentSizes = () => {
    return productDetails.colorsWithSizes[selectedColorIndex]?.sizes || [];
  };

  // Find initial color index based on colorCode prop
  const getInitialColorIndex = () => {
    if (initialColorCode && productDetails.colorsWithSizes.length > 0) {
      const index = productDetails.colorsWithSizes.findIndex(
        (colorData) => colorData.color === initialColorCode,
      );
      return index >= 0 ? index : 0;
    }
    return 0;
  };

  // selected color index (first color or matched color selected by default)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(() =>
    getInitialColorIndex(),
  );
  // selected size index (no size selected by default)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(
    null,
  );
  // Mobile: visible tooltip index and timer
  const [visibleTooltipIndex, setVisibleTooltipIndex] = useState<number | null>(
    null,
  );
  const tooltipTimerRef = useRef<number | null>(null);

  // Clear tooltip timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        window.clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    };
  }, []);

  const bottomSheetRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  // controls ref for the ImageSlider so we can programmatically jump to slides
  const sliderControlsRef = useRef<{
    next: () => void;
    prev: () => void;
    slideTo: (index: number) => void;
  } | null>(null);
  // Description modal + overflow detection (mobile: clamp to 2 lines)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descOverflow, setDescOverflow] = useState(false);
  const descRef = useRef<HTMLDivElement | null>(null);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const accessoriesFetchedRef = useRef(false);
  const [basketConfirmation, setBasketConfirmation] = useState<{
    show: boolean;
    cartItem: CartItem;
  } | null>(null);

  // Swipe detection states
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(
    null,
  );
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe start
  const handleSwipeStart = (
    clientX: number,
    clientY: number,
    event?: TouchEvent | MouseEvent,
  ) => {
    // Check if touch started within AccessoriesSlider
    if (event) {
      const target = event.target as HTMLElement;
      const accessoriesSlider = target.closest('.accessories-slider-container');
      if (accessoriesSlider) {
        // Touch started in AccessoriesSlider, don't handle horizontal swipes
        return;
      }
    }

    // Check if touch is within BottomSheet area
    const containerHeight =
      containerRef.current?.offsetHeight || window.innerHeight * 0.8;
    const bottomSheetStartY = containerHeight * 0.79; // Approximately where BottomSheet starts

    if (clientY > bottomSheetStartY) {
      // Touch started in BottomSheet area, don't handle horizontal swipes
      return;
    }

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

        if (
          newIndex >= 0 &&
          newIndex < allProducts.length &&
          onProductChange &&
          enableSwipeNavigation
        ) {
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

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      setDescOverflow(el.scrollHeight > el.clientHeight);
    }, 0);
    return () => clearTimeout(t);
  }, [productDetails.description, sheetExpanded]);

  // Slide to the correct image when initial color code is provided
  useEffect(() => {
    if (initialColorCode && sliderControlsRef.current) {
      const colorIndex = productDetails.colorsWithSizes.findIndex(
        (colorData) => colorData.color === initialColorCode,
      );
      if (colorIndex >= 0) {
        const colorData = productDetails.colorsWithSizes[colorIndex];
        const slideIndex = colorData.firstMultimediaIndex ?? 0;
        // Small delay to ensure slider is ready
        setTimeout(() => {
          sliderControlsRef.current?.slideTo(slideIndex);
        }, 100);
      }
    }
  }, [initialColorCode, productDetails.colorsWithSizes]);

  // Fetch accessories based on product gender
  useEffect(() => {
    if (!productDetails.gender || accessoriesFetchedRef.current) return;

    const fetchAccessories = async () => {
      try {
        accessoriesFetchedRef.current = true;
        const categoryId =
          productDetails.gender === 'male'
            ? ACCESSORIES_CATEGORY_IDS.men
            : ACCESSORIES_CATEGORY_IDS.women;

        const response = await fetch(`${API_URL}categories/${categoryId}`);
        if (!response.ok) return;

        const categoryData: CategoryResponse = await response.json();
        const products = extractProductsFromCategory(categoryData);
        setAccessories(products);
      } catch (error) {
        console.error('Error fetching accessories:', error);
      }
    };

    fetchAccessories();
  }, [productDetails.gender]);

  const handleAddAccessoryToCart = (
    productId: number,
    productName: string,
    colorId: number,
    colorCode: string,
    colorName: string,
    sizeId: number,
    sizeName: string,
    price: number,
    discount: number,
    finalPrice: number,
    imageUrl: string,
  ) => {
    // Add to cart
    const cartItem = addToCart({
      productId,
      productName,
      variantId: colorId,
      sizeName,
      price,
      discount,
      finalPrice,
      imageUrl,
      colorCode,
      colorName,
    });

    // Show basket confirmation
    setBasketConfirmation({
      show: true,
      cartItem,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setBasketConfirmation(null);
    }, 5000);

    // Dispatch custom event to notify cart dialog to update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div
      className="w-full"
      style={{
        height: '80vh',
      }}
      ref={containerRef}
    >
      {/* Top 85% - Primary color with slider */}
      <div
        style={{ height: '100%' }}
        className="relative"
        onTouchStart={(e) =>
          handleSwipeStart(
            e.touches[0].clientX,
            e.touches[0].clientY,
            e.nativeEvent,
          )
        }
        onTouchMove={(e) =>
          handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleSwipeEnd}
        onMouseDown={(e) =>
          handleSwipeStart(e.clientX, e.clientY, e.nativeEvent)
        }
        onMouseMove={(e) =>
          e.buttons === 1 && handleSwipeMove(e.clientX, e.clientY)
        }
        onMouseUp={handleSwipeEnd}
        onMouseLeave={handleSwipeEnd}
      >
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
            controlsRef={sliderControlsRef}
          />
        </div>
      </div>

      {/* BottomSheet contains the product quick info and starts collapsed at 18vh */}
      {/* track expanded state to dim the slider */}
      <BottomSheet
        ref={bottomSheetRef}
        initialHeightVh={21}
        expandedHeightVh={80}
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
            height: sheetExpanded ? '80vh' : '20vh',
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
                    className={
                      visibleTooltipIndex === i
                        ? `${styles.colorSwatch} ${styles.showTooltip}`
                        : styles.colorSwatch
                    }
                    onClick={() => {
                      // Show tooltip on mobile for 3s (or until another color pressed)
                      setVisibleTooltipIndex(i);
                      if (tooltipTimerRef.current) {
                        window.clearTimeout(tooltipTimerRef.current);
                      }
                      tooltipTimerRef.current = window.setTimeout(() => {
                        setVisibleTooltipIndex(null);
                        tooltipTimerRef.current = null;
                      }, 3000);

                      setSelectedColorIndex(i);
                      // Reset size selection when color changes
                      setSelectedSizeIndex(null);
                      // Jump slider to first multimedia of this color if available
                      const index =
                        productDetails.colorsWithSizes[i]?.firstMultimediaIndex;
                      if (
                        typeof index === 'number' &&
                        sliderControlsRef.current
                      ) {
                        try {
                          sliderControlsRef.current.slideTo(index);
                        } catch {
                          // ignore
                        }
                      }
                      // collapse bottom sheet to reveal the slider
                      bottomSheetRef.current?.collapse();
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
                    <div className={styles.colorTooltip} aria-hidden>
                      {colorData.colorName ?? colorData.color}
                    </div>
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
              <div className="flex items-start" style={{ width: '100%' }}>
                {/* Info icon */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Información"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Información</title>
                    <path
                      fill="#2563eb"
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                    />
                  </svg>
                </div>

                <div style={{ width: '100%' }}>
                  <div
                    ref={descRef}
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowDescriptionModal(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowDescriptionModal(true);
                      }
                    }}
                    aria-label="Descripción del producto. Abrir para ver más"
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '400',
                      whiteSpace: 'pre-line',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: '1.2em',
                    }}
                  >
                    {productDetails.description}
                  </div>

                  {descOverflow && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowDescriptionModal(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontWeight: 400,
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '14px',
                          lineHeight: '1.2em',
                        }}
                        aria-hidden={false}
                      >
                        ver más...
                      </button>
                    </div>
                  )}
                </div>
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
                <button
                  type="button"
                  onClick={() => {
                    if (productDetails.sizeGuidePdf) {
                      window.open(productDetails.sizeGuidePdf, '_blank');
                    }
                  }}
                  disabled={!productDetails.sizeGuidePdf}
                  aria-disabled={!productDetails.sizeGuidePdf}
                  style={{
                    fontSize: '0.9rem',
                    color: productDetails.sizeGuidePdf ? 'blue' : '#9ca3af',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: productDetails.sizeGuidePdf
                      ? 'pointer'
                      : 'not-allowed',
                    opacity: productDetails.sizeGuidePdf ? 1 : 0.6,
                  }}
                >
                  Guía de tallas {'>'}
                </button>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (productDetails.sizeGuideVideo) setShowVideo(true);
                  }}
                  disabled={!productDetails.sizeGuideVideo}
                  aria-disabled={!productDetails.sizeGuideVideo}
                  style={{
                    fontSize: '14px',
                    color: productDetails.sizeGuideVideo ? 'blue' : '#9ca3af',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: productDetails.sizeGuideVideo
                      ? 'pointer'
                      : 'not-allowed',
                    opacity: productDetails.sizeGuideVideo ? 1 : 0.6,
                  }}
                >
                  Cómo medirme {'>'}
                </button>
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
                  const boxWidth = 40;
                  return (
                    <div
                      key={sizeData.size}
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginRight: i < getCurrentSizes().length - 1 ? 8 : 0,
                      }}
                    >
                      <div
                        role="button"
                        tabIndex={isAvailable ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSizeIndex(i);
                            const selectedColor =
                              productDetails.colorsWithSizes[
                                selectedColorIndex
                              ];
                            const firstImage =
                              selectedColor.firstMultimediaIndex !== undefined
                                ? productDetails.multimedia[
                                    selectedColor.firstMultimediaIndex
                                  ]?.image
                                : productDetails.multimedia[0]?.image;

                            // Add to cart storage
                            const cartItem = addToCart({
                              productId: productDetails.productId,
                              productName: productDetails.name,
                              variantId: sizeData.variantId ?? 0,
                              price: productDetails.price,
                              discount: productDetails.discount,
                              finalPrice: productDetails.finalPrice,
                              sizeName: sizeData.size,
                              sizeId: sizeData.id ?? undefined,
                              colorName: selectedColor.colorName || 'Color',
                              colorCode: selectedColor.color,
                              imageUrl: firstImage || '',
                            });

                            // Show basket confirmation
                            setBasketConfirmation({
                              show: true,
                              cartItem,
                            });

                            // Dispatch custom event to notify cart dialog to update
                            window.dispatchEvent(new Event('cartUpdated'));

                            // Auto-hide after 5 seconds
                            setTimeout(() => {
                              setBasketConfirmation(null);
                            }, 5000);
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
                          width: boxWidth,
                          height: boxWidth,
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

                      {!isAvailable && (
                        <div
                          aria-hidden
                          style={{
                            width: Math.max(boxWidth - 4, 28),
                            textAlign: 'center',
                            color: '#9ca3af',
                            fontSize: '10px',
                            marginTop: 4,
                            lineHeight: '1em',
                          }}
                        >
                          Agotado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accessories Slider - only visible when sheet is expanded */}
          {sheetExpanded && accessories.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <AccessoriesSlider
                products={accessories}
                onAddToCart={handleAddAccessoryToCart}
              />
            </div>
          )}

          {/* size availability - only visible when sheet is expanded and size is selected */}
          {/* {sheetExpanded && (
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
          )} */}

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

      {/* Video modal (mobile: full screen) */}
      {showVideo && productDetails.sizeGuideVideo && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowVideo(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }}
            >
              <button
                onClick={() => setShowVideo(false)}
                aria-label="Cerrar video"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <video
              src={productDetails.sizeGuideVideo}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

      {/* Description modal (mobile) */}
      {showDescriptionModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDescriptionModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '92%',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: 8,
              padding: '1rem',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDescriptionModal(false)}
                aria-label="Cerrar descripción"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-line', color: '#111827' }}>
              {productDetails.description}
            </div>
          </div>
        </div>
      )}

      {/* Basket Confirmation Popup */}
      {basketConfirmation && (
        <BasketConfirmation
          show={true}
          cartItem={basketConfirmation.cartItem}
          onClose={() => setBasketConfirmation(null)}
          onProceedToCheckout={() => {
            window.location.href = '/w/checkout';
          }}
          isMobile={true}
        />
      )}
    </div>
  );
};

export default ProductPageMobile;
