'use client';
import BasketConfirmation from '@/components/BasketConfirmation';
import AccessoriesSlider from '@/components/AccessoriesSlider';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
  gender?: 'male' | 'female';
};

type Props = {
  productDetails: ProductDetails;
  initialColorCode?: string;
};

const ProductPageDesktop: React.FC<Props> = ({
  productDetails,
  initialColorCode,
}) => {
  // Find initial color index based on colorCode prop
  const getInitialColorIndex = () => {
    if (initialColorCode && productDetails.colorsWithSizes.length > 0) {
      const index = productDetails.colorsWithSizes.findIndex(
        (colorData) => colorData.color === initialColorCode
      );
      return index >= 0 ? index : 0;
    }
    return 0;
  };

  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(() =>
    getInitialColorIndex()
  );
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | null>(
    null
  );
  const [basketConfirmation, setBasketConfirmation] = useState<{
    show: boolean;
    cartItem: CartItem;
  } | null>(null);

  const [showVideo, setShowVideo] = useState(false);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const accessoriesFetchedRef = useRef(false);

  // Description modal + overflow detection
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descOverflow, setDescOverflow] = useState(false);
  const descRef = useRef<HTMLDivElement | null>(null);
  const detailsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      setDescOverflow(el.scrollHeight > el.clientHeight);
    }, 0);
    return () => clearTimeout(t);
  }, [productDetails.description]);

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

  // Scroll to the correct image when initial color code is provided
  useEffect(() => {
    if (initialColorCode) {
      const colorIndex = productDetails.colorsWithSizes.findIndex(
        (colorData) => colorData.color === initialColorCode
      );
      if (colorIndex >= 0) {
        const index =
          productDetails.colorsWithSizes[colorIndex]?.firstMultimediaIndex;
        if (typeof index === 'number') {
          // Delay to ensure DOM is ready
          setTimeout(() => {
            try {
              const el = document.getElementById(`product-image-${index}`);
              if (el) {
                el.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }
            } catch {
              // ignore
            }
          }, 300);
        }
      }
    }
  }, [initialColorCode, productDetails.colorsWithSizes]);

  const isColorAvailable = (colorIndex: number) => {
    return (
      productDetails.colorsWithSizes[colorIndex]?.sizes.some(
        (sizeInfo) => sizeInfo.availability > 0
      ) || false
    );
  };

  const getCurrentSizes = () => {
    return productDetails.colorsWithSizes[selectedColorIndex]?.sizes || [];
  };

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
    imageUrl: string
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
    <>
      <div
        className="w-full flex"
        style={{
          height: 'calc(100vh - var(--nav-height, 64px))',
          marginTop: 'var(--nav-height, 64px)',
          overflow: 'hidden',
        }}
      >
        {/* Left section: Image Gallery (66% width) */}
        <div
          className="overflow-y-auto"
          style={{
            width: '66%',
            height: '100%',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1px 1fr',
              gap: '0',
            }}
          >
            {(() => {
              const images = productDetails.multimedia || [];
              const rows = Math.ceil(images.length / 2) || 0;
              return Array.from({ length: rows }).map((_, rowIndex) => {
                const leftImageIndex = rowIndex * 2;
                const rightImageIndex = leftImageIndex + 1;

                return (
                  <React.Fragment key={rowIndex}>
                    {images[leftImageIndex] && (
                      <div
                        className="relative"
                        id={`product-image-${leftImageIndex}`}
                        style={{
                          aspectRatio: '1 / 1.35',
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #fff',
                        }}
                      >
                        <Image
                          src={images[leftImageIndex].image}
                          alt={
                            images[leftImageIndex].label ||
                            `Product image ${leftImageIndex + 1}`
                          }
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      </div>
                    )}

                    <div
                      style={{
                        backgroundColor: '#fff',
                        width: '1px',
                        borderBottom: '1px solid #fff',
                      }}
                    />

                    {images[rightImageIndex] && (
                      <div
                        className="relative"
                        id={`product-image-${rightImageIndex}`}
                        style={{
                          aspectRatio: '1 / 1.35',
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #fff',
                        }}
                      >
                        <Image
                          src={images[rightImageIndex].image}
                          alt={
                            images[rightImageIndex].label ||
                            `Product image ${rightImageIndex + 1}`
                          }
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </div>
        </div>

        {/* Video modal (desktop: vertical/right modal) */}
        {showVideo && productDetails.sizeGuideVideo && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 60,
            }}
            onClick={() => setShowVideo(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                right: 0,
                top: '8vh',
                bottom: '8vh',
                width: '36%',
                background: '#fff',
                boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowVideo(false)}
                  aria-label="Cerrar video"
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <video
                  src={productDetails.sizeGuideVideo}
                  controls
                  autoPlay
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right section: Product Details (34% width) */}
        <div
          ref={detailsSectionRef}
          className="fixed right-0 bottom-0 bg-white details-section"
          style={{
            width: '34%',
            padding: '2rem',
            overflowY: 'auto',
            borderLeft: '1px solid #e5e7eb',
            top: 'var(--nav-height, 64px)',
          }}
        >
          {/* Product name */}
          <h1
            className="font-bold"
            style={{
              fontSize: '1.5rem',
              lineHeight: '1.3',
              marginBottom: '2rem',
            }}
          >
            {productDetails.name}
          </h1>

          {/* Price section */}
          <div
            className="flex items-center gap-3"
            style={{ marginBottom: '2rem' }}
          >
            {productDetails.discount > 0 && (
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  color: '#6b7280',
                  textDecoration: 'line-through',
                }}
              >
                Bs. {productDetails.price}
              </span>
            )}
            <div
              className="font-bold"
              style={{
                fontSize: '1.25rem',
                color: productDetails.discount > 0 ? '#dc2626' : '#000',
              }}
            >
              Bs. {productDetails.finalPrice}
            </div>
            {productDetails.discount > 0 && (
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #dc2626',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                -{productDetails.discount}%
              </div>
            )}
          </div>

          {/* Colors section */}
          <div style={{ marginBottom: '2rem' }}>
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
                      setSelectedSizeIndex(null);
                      // Scroll to the first multimedia of this color if available
                      const index =
                        productDetails.colorsWithSizes[i]?.firstMultimediaIndex;
                      if (typeof index === 'number') {
                        try {
                          const el = document.getElementById(
                            `product-image-${index}`
                          );
                          if (el)
                            el.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedColorIndex(i);
                        setSelectedSizeIndex(null);
                      }
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      marginRight:
                        i < productDetails.colorsWithSizes.length - 1 ? 8 : 0,
                      background: '#fff',
                      borderRadius: 9999,
                      boxSizing: 'border-box',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '1px solid #000' : '1px solid #fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 32,
                        height: 32,
                        background: colorData.color,
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Horizontal separator */}
          <div
            style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              width: '100%',
              marginBottom: '2rem',
            }}
          />

          {/* Size selection title */}
          <h3
            className="font-semibold"
            style={{ fontSize: '1rem', marginBottom: '1.5rem' }}
          >
            Selecciona la talla
          </h3>

          {/* Size selection */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex flex-wrap gap-2">
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
                        // Scroll to bottom to show "Añadir al carrito" button
                        setTimeout(() => {
                          if (detailsSectionRef.current) {
                            detailsSectionRef.current.scrollTo({
                              top: detailsSectionRef.current.scrollHeight,
                              behavior: 'smooth',
                            });
                          }
                        }, 100);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedSizeIndex(i);
                        // Scroll to bottom to show "Añadir al carrito" button
                        setTimeout(() => {
                          if (detailsSectionRef.current) {
                            detailsSectionRef.current.scrollTo({
                              top: detailsSectionRef.current.scrollHeight,
                              behavior: 'smooth',
                            });
                          }
                        }, 100);
                      }
                    }}
                    style={{
                      width: 48,
                      height: 48,
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

            {/* Size availability info */}
            <div className="mt-2">
              <span
                style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  fontWeight: '400',
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
          </div>

          {/* Accessories Slider */}
          {accessories.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <AccessoriesSlider
                products={accessories}
                onAddToCart={handleAddAccessoryToCart}
              />
            </div>
          )}

          {/* Description section */}
          <div
            style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              marginBottom: '2rem',
            }}
          >
            <div className="flex items-start">
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

              {/* Clickable truncated description for desktop (6 lines) */}
              <div style={{ position: 'relative', width: '100%' }}>
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
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textAlign: 'left',
                    cursor: 'pointer',
                    paddingRight: 60,
                    lineHeight: '1.4em',
                  }}
                >
                  {productDetails.description}
                </div>

                {descOverflow && (
                  <button
                    type="button"
                    onClick={() => setShowDescriptionModal(true)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      background: 'white',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      cursor: 'pointer',
                      paddingLeft: 6,
                    }}
                    aria-hidden={false}
                  >
                    ver más...
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Size guide labels */}
          <div
            className="flex justify-between items-center"
            style={{ marginBottom: '2rem' }}
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

          {/* Add to cart button */}
          <button
            type="button"
            className="w-full font-bold"
            onClick={() => {
              if (selectedSizeIndex !== null) {
                const selectedSize = getCurrentSizes()[selectedSizeIndex];
                const selectedColor =
                  productDetails.colorsWithSizes[selectedColorIndex];
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
                  variantId: selectedSize.variantId ?? 0,
                  price: productDetails.price,
                  discount: productDetails.discount,
                  finalPrice: productDetails.finalPrice,
                  sizeName: selectedSize.size,
                  sizeId: selectedSize.id ?? undefined,
                  colorName: selectedColor.colorName ?? 'Color',
                  colorCode: selectedColor.color,
                  imageUrl: firstImage || '',
                });

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
            disabled={
              selectedSizeIndex === null ||
              !isColorAvailable(selectedColorIndex)
            }
            style={{
              backgroundColor:
                selectedSizeIndex !== null &&
                isColorAvailable(selectedColorIndex)
                  ? '#000'
                  : '#9ca3af',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              cursor:
                selectedSizeIndex !== null &&
                isColorAvailable(selectedColorIndex)
                  ? 'pointer'
                  : 'not-allowed',
              border: 'none',
              opacity:
                selectedSizeIndex !== null &&
                isColorAvailable(selectedColorIndex)
                  ? 1
                  : 0.6,
            }}
          >
            {selectedSizeIndex === null
              ? 'SELECCIONAR TALLA'
              : 'AÑADIR AL CARRITO'}
          </button>
        </div>
      </div>

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

      {/* Description modal */}
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
              maxWidth: 720,
              width: '90%',
              maxHeight: '80vh',
              background: '#fff',
              borderRadius: 8,
              padding: '1.25rem',
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
    </>
  );
};

export default ProductPageDesktop;
