'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import SkeletonLoader from '@/components/SkeletonLoader';
import sortSizes from '@/utils/sizeSorter';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BasketConfirmation from '@/components/BasketConfirmation';
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
    sizes?: Array<{
      id?: number;
      variantId?: number;
      size: string;
      availability: number;
    }>;
    multimedia?: Array<{ image: string; label?: string }>;
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

type ArrowSide = 'left' | 'right';

const ArrowButton: React.FC<{
  side: ArrowSide;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ side, onClick }) => {
  const posStyle = side === 'left' ? { left: 12 } : { right: 12 };
  return (
    <button
      aria-label={side === 'left' ? 'Anterior' : 'Siguiente'}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        position: 'absolute',
        ...posStyle,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        background: 'rgba(255,255,255,0.8)',
        border: 'none',
        borderRadius: '9999px',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {side === 'left' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

const OutfitPageDesktop: React.FC<Props> = ({ outfitDetails }) => {
  const router = useRouter();
  const sliderControlsRef = useRef<{
    next: () => void;
    prev: () => void;
    slideTo: (index: number) => void;
  } | null>(null);
  const [showSizePopup, setShowSizePopup] = useState<number | null>(null);
  const [sizeSelected, setSizeSelected] = useState<{
    [key: string]: boolean;
  }>({});
  const [basketConfirmation, setBasketConfirmation] = useState<{
    show: boolean;
    cartItem: CartItem;
  } | null>(null);

  // Small helper component to handle image loading + skeleton
  const ItemImage: React.FC<{
    src?: string | null;
    alt?: string;
    sizes?: string;
  }> = ({ src, alt, sizes }) => {
    const [loaded, setLoaded] = useState(false);
    return (
      <>
        {!loaded && (
          <div className="absolute inset-0">
            <SkeletonLoader variant="shimmer" showIcon={false} />
          </div>
        )}
        {src ? (
          <Image
            src={src}
            alt={alt || ''}
            fill
            style={{
              objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}
            sizes={sizes}
            onLoadingComplete={() => setLoaded(true)}
          />
        ) : null}
      </>
    );
  };

  return (
    <div className="w-full h-screen flex">
      {/* Left side - Image Slider (50% width) */}
      <div
        className="w-1/2 h-full flex items-center justify-center"
        style={{ padding: '2rem' }}
      >
        <div style={{ width: '80%', height: '100%' }}>
          <div className="relative w-full h-full">
            <ImageSlider
              direction="horizontal"
              slidesData={outfitDetails.multimedia}
              autoplayDelay={0}
              showNews={false}
              controlsRef={sliderControlsRef}
            />

            {/* Left / Right navigation buttons (only when multiple slides) */}
            {Array.isArray(outfitDetails.multimedia) &&
              outfitDetails.multimedia.length > 1 && (
                <>
                  <ArrowButton
                    side="left"
                    onClick={(e) => {
                      e.preventDefault();
                      sliderControlsRef.current?.prev();
                    }}
                  />

                  <ArrowButton
                    side="right"
                    onClick={(e) => {
                      e.preventDefault();
                      sliderControlsRef.current?.next();
                    }}
                  />
                </>
              )}
          </div>
        </div>
      </div>

      {/* Right side - Clothing Items (50% width) */}
      <div className="w-1/2 h-full flex flex-col" style={{ padding: '2rem' }}>
        {/* Title */}
        <h1
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: '#000', marginBottom: '3rem' }}
        >
          Obtén el estilo
        </h1>

        {/* Clothing Items Grid */}
        <div
          className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto"
          style={{ paddingRight: '1rem' }}
        >
          {outfitDetails.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col cursor-pointer"
              onClick={() => {
                const id = item.productId ?? item.id ?? 101 + idx;
                const slug = buildProductSlug(item.name, id);
                router.push(`/w/${slug}`);
              }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden rounded-lg mb-3"
                style={{ aspectRatio: '3/4', width: '100%' }}
              >
                {item.multimedia &&
                item.multimedia.length > 0 &&
                item.multimedia[0].image ? (
                  <ItemImage
                    src={item.multimedia[0].image}
                    alt={item.name}
                    sizes="25vw"
                  />
                ) : (
                  <div className="absolute inset-0">
                    <SkeletonLoader variant="shimmer" showIcon={false} />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex flex-col">
                {/* Name */}
                <div
                  className="text-sm font-medium mb-1"
                  style={{
                    color: '#000',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </div>

                {/* Price */}
                <div
                  className="text-lg font-bold mb-3"
                  style={{
                    color:
                      item.discount && item.discount > 0 ? '#dc2626' : '#000',
                  }}
                >
                  Bs. {item.finalPrice ?? item.price}
                </div>

                {/* Size selector - same as mobile */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSizePopup(idx);
                      }}
                      disabled={
                        sizeSelected[idx] ||
                        !item.sizes.some((s) => s.availability > 0)
                      }
                      className="px-3 py-1 text-xs font-medium w-full"
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Size Selection Popup - same as mobile */}
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
              {sortSizes(outfitDetails.items[showSizePopup]?.sizes || []).map(
                (sizeObj) => {
                  const isAvailable = sizeObj.availability > 0;
                  return (
                    <button
                      key={sizeObj.size + String(sizeObj.id)}
                      onClick={() => {
                        if (isAvailable) {
                          const selectedItem =
                            outfitDetails.items[showSizePopup];
                          const firstImage =
                            selectedItem.multimedia?.[0]?.image ||
                            outfitDetails.multimedia[0]?.image ||
                            '';

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
                },
              )}
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
          isMobile={false}
        />
      )}
    </div>
  );
};

export default OutfitPageDesktop;
