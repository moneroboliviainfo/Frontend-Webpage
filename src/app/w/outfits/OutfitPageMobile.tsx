'use client';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import BasketConfirmation from '@/components/BasketConfirmation';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import buildProductSlug from '@/utils/buildProductSlug';
import { addToCart } from '@/utils/cartStorage';
import type { CartItem } from '@/types/cart';

type OutfitDetails = {
  multimedia: Array<{ image: string; label: string }>;
  outfitId: number;
  name: string;
  items: Array<{
    id?: number;
    productId?: number;
    name: string;
    price: number;
    discount?: number;
    finalPrice?: number;
    colorName?: string;
    colorCode?: string;
    multimedia?: Array<{ image: string; label: string }>;
    sizes?: Array<{
      id?: number;
      variantId?: number;
      size: string;
      availability: number;
    }>;
  }>;
  totalPrice: number;
  description: string;
  slug?: string;
};

type Props = {
  outfitDetails: OutfitDetails;
  allOutfits?: OutfitDetails[]; // Array of all outfits for swiping
  currentOutfitIndex?: number; // Current outfit index
  onOutfitChange?: (index: number) => void; // Callback when outfit changes
};

// OutfitItemsCarousel component
type OutfitItemsCarouselProps = {
  items: Array<{
    id?: number;
    productId?: number;
    name: string;
    price: number;
    discount?: number;
    finalPrice?: number;
    colorName?: string;
    colorCode?: string;
    multimedia?: Array<{ image: string; label: string }>;
    sizes?: Array<{
      id?: number;
      variantId?: number;
      size: string;
      availability: number;
    }>;
  }>;
  showSizePopup: number | null;
  setShowSizePopup: (value: number | null) => void;
  setBasketConfirmation: (
    value: {
      show: boolean;
      cartItem: CartItem;
    } | null,
  ) => void;
};

const OutfitItemsCarousel: React.FC<OutfitItemsCarouselProps> = ({
  items,
  showSizePopup,
  setShowSizePopup,
  setBasketConfirmation,
}) => {
  const router = useRouter();
  const slideWidth = '34vw';
  const slideHeight = '50vw';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [sizeSelected, setSizeSelected] = useState<{
    [key: number]: boolean;
  }>({});

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ul
          className="flex gap-2"
          style={{
            WebkitOverflowScrolling: 'touch',
            minWidth: 'fit-content',
            paddingTop: '0.25rem',
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex flex-col"
              style={{ width: slideWidth, cursor: 'pointer' }}
              onClick={() => {
                // Navigate to product page using productId (or id)
                const id = item.productId ?? item.id ?? 101 + idx;
                const slug = buildProductSlug(item.name, id);
                router.push(`/w/${slug}`);
              }}
            >
              <div
                style={{ width: slideWidth, height: slideHeight }}
                className="relative overflow-hidden rounded-lg"
              >
                {item.multimedia && item.multimedia.length > 0 ? (
                  <Image
                    src={item.multimedia[0].image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="35vw"
                  />
                ) : (
                  <div className="absolute inset-0">
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg,#f0f0f0 0%,#e0e0e0 20%,#f0f0f0 40%)',
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ paddingLeft: 4, paddingRight: 4 }}>
                <div
                  className="text-sm"
                  style={{
                    color: '#000',
                    opacity: 0.95,
                    marginTop: '0.25rem',
                    paddingLeft: '0.25rem',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </div>
                <div
                  className="text-base font-bold"
                  style={{
                    marginTop: 2,
                    paddingLeft: '0.25rem',
                    color:
                      item.discount && item.discount > 0 ? '#dc2626' : '#000',
                  }}
                >
                  Bs. {item.finalPrice ?? item.price}
                </div>
              </div>

              {/* Size selector - similar to product page */}
              {item.sizes && item.sizes.length > 0 && (
                <div
                  className="flex items-center justify-center"
                  style={{ paddingLeft: '0.3rem', paddingRight: '0.3rem' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSizePopup(idx);
                    }}
                    disabled={
                      sizeSelected[idx] ||
                      !item.sizes.some((s) => s.availability > 0)
                    }
                    className="px-3 py-1 text-xs font-medium w-100"
                    style={{
                      backgroundColor: sizeSelected[idx] ? '#6B7280' : '#000',
                      color: '#fff',
                      borderRadius: 4,
                      border: 'none',
                      cursor:
                        sizeSelected[idx] ||
                        !item.sizes.some((s) => s.availability > 0)
                          ? 'default'
                          : 'pointer',
                      opacity:
                        sizeSelected[idx] ||
                        !item.sizes.some((s) => s.availability > 0)
                          ? 0.7
                          : 1,
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    {sizeSelected[idx] ? 'En Carrito' : 'Talla'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Size Selection Popup */}
      {showSizePopup !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowSizePopup(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: '20px',
              maxWidth: '300px',
              width: '80vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Selecciona tu talla
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              {items[showSizePopup]?.sizes?.map((sizeObj) => {
                const isAvailable = sizeObj.availability > 0;
                return (
                  <button
                    key={sizeObj.size}
                    onClick={() => {
                      if (isAvailable) {
                        const selectedItem = items[showSizePopup];
                        const firstImage =
                          selectedItem.multimedia?.[0]?.image || '';

                        // Add to cart storage
                        const cartItem = addToCart({
                          productId: selectedItem.productId ?? 0,
                          productName: selectedItem.name,
                          variantId: sizeObj.variantId ?? 0,
                          price: selectedItem.price,
                          discount: selectedItem.discount ?? 0,
                          finalPrice:
                            selectedItem.finalPrice ?? selectedItem.price,
                          sizeName: sizeObj.size,
                          sizeId: sizeObj.id,
                          colorName: selectedItem.colorName ?? 'Color',
                          colorCode: selectedItem.colorCode ?? '#000000',
                          imageUrl: firstImage,
                        });

                        setSizeSelected((prev) => ({
                          ...prev,
                          [showSizePopup]: true,
                        }));
                        setBasketConfirmation({
                          show: true,
                          cartItem,
                        });
                        setShowSizePopup(null);

                        // Auto-hide after 5 seconds
                        setTimeout(() => {
                          setBasketConfirmation(null);
                        }, 5000);
                      }
                    }}
                    disabled={!isAvailable}
                    style={{
                      padding: '12px',
                      border: `1px solid ${
                        isAvailable ? '#e5e7eb' : '#d1d5db'
                      }`,
                      borderRadius: 4,
                      backgroundColor: isAvailable ? '#fff' : '#f3f4f6',
                      color: isAvailable ? '#000' : '#9ca3af',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: isAvailable ? 1 : 0.6,
                    }}
                  >
                    {sizeObj.size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const OutfitPageMobile: React.FC<Props> = ({
  outfitDetails,
  allOutfits = [outfitDetails],
  currentOutfitIndex = 0,
  onOutfitChange,
}) => {
  const bottomSheetRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState<number | null>(null);
  const [basketConfirmation, setBasketConfirmation] = useState<{
    show: boolean;
    cartItem: CartItem;
  } | null>(null);

  // Auto-close size popup when bottom sheet collapses
  useEffect(() => {
    if (!sheetExpanded && showSizePopup !== null) {
      setShowSizePopup(null);
    }
  }, [sheetExpanded, showSizePopup]);

  // Swipe detection states (same as ProductPageMobile)
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(
    null,
  );
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe start
  const handleSwipeStart = (clientX: number, clientY: number) => {
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
      (diffX > 0 && currentOutfitIndex === 0) ||
      (diffX < 0 && currentOutfitIndex === allOutfits.length - 1)
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
        const newIndex = currentOutfitIndex + direction;

        if (newIndex >= 0 && newIndex < allOutfits.length && onOutfitChange) {
          // Add a slight delay for smooth transition
          setTimeout(() => {
            onOutfitChange(newIndex);
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
    >
      {/* Top 85% - Primary color with slider (same as ProductPageMobile) */}
      <div
        style={{ height: '100%' }}
        className="relative"
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
        <div
          className="absolute inset-0"
          style={{
            opacity: 1,
            transform: `translateX(${translateX}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 300ms ease, opacity 200ms ease',
          }}
          id="outfit-slider-container"
          onClick={() => {
            // if bottom sheet is expanded, collapse it when the slider area is clicked
            if (sheetExpanded) {
              bottomSheetRef.current?.collapse();
            }
          }}
        >
          <ImageSlider
            direction="vertical"
            slidesData={outfitDetails.multimedia}
            autoplayDelay={0}
            showNews={false}
            onSlide={() => {
              // collapse the bottom sheet when the user slides the image carousel
              bottomSheetRef.current?.collapse();
            }}
          />
        </div>
      </div>

      {/* BottomSheet contains the outfit info (different content from product) */}
      <BottomSheet
        ref={bottomSheetRef}
        initialHeightVh={21}
        expandedHeightVh={55}
        onExpandedChange={(expanded) => {
          setSheetExpanded(expanded);
          const el = document.getElementById('outfit-slider-container');
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
            height: sheetExpanded ? '38vh' : '20vh',
            paddingTop: '0.1rem',
            paddingLeft: '0.7rem',
            paddingRight: '0.7rem',
            background: 'white',
          }}
        >
          {/* First row: outfit name left, number of clothes right */}
          <div className="flex justify-between items-center">
            <h2
              className="font-semibold"
              style={{
                fontSize: '1rem',
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#000',
              }}
            >
              {outfitDetails.name}
            </h2>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (sheetExpanded) {
                  bottomSheetRef.current?.collapse();
                } else {
                  bottomSheetRef.current?.expand();
                }
              }}
            >
              <div
                className="font-bold"
                style={{
                  fontSize: '0.9rem',
                  color: '#000',
                }}
              >
                {outfitDetails.items.length}{' '}
                {outfitDetails.items.length === 1 ? 'prenda' : 'prendas'}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  marginLeft: '0.25rem',
                  transform: sheetExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 200ms ease',
                }}
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Carousel section - always visible */}
          <div style={{ marginTop: '1rem' }}>
            <OutfitItemsCarousel
              items={outfitDetails.items}
              showSizePopup={showSizePopup}
              setShowSizePopup={setShowSizePopup}
              setBasketConfirmation={setBasketConfirmation}
            />
          </div>
        </div>
      </BottomSheet>

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

export default OutfitPageMobile;
