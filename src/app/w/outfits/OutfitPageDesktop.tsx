'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BasketConfirmation from '@/components/BasketConfirmation';
import { useRouter } from 'next/navigation';

// Simple slug helper to build /w/{slug}-{id}
const slugify = (s: string | undefined | null) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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
    sizes?: Array<{ id?: number; size: string; availability: number }>;
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

const OutfitPageDesktop: React.FC<Props> = ({ outfitDetails }) => {
  const router = useRouter();
  const [showSizePopup, setShowSizePopup] = useState<number | null>(null);
  const [sizeSelected, setSizeSelected] = useState<{
    [key: string]: boolean;
  }>({});
  const [basketConfirmation, setBasketConfirmation] = useState<{
    show: boolean;
    item: {
      id?: number;
      productId?: number;
      name: string;
      price: number;
      sizes?: Array<{ id?: number; size: string; availability: number }>;
    };
    size: string;
    sizeId?: number;
  } | null>(null);

  return (
    <div className="w-full h-screen flex">
      {/* Left side - Image Slider (50% width) */}
      <div
        className="w-1/2 h-full flex items-center justify-center"
        style={{ padding: '2rem' }}
      >
        <div style={{ width: '80%', height: '100%' }}>
          <ImageSlider
            direction="horizontal"
            slidesData={outfitDetails.multimedia}
            autoplayDelay={0}
            showNews={false}
          />
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
                const slug = `${slugify(item.name)}-${id}`;
                router.push(`/w/${slug}`);
              }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden rounded-lg mb-3"
                style={{ aspectRatio: '3/4', width: '100%' }}
              >
                <Image
                  src={
                    item.multimedia && item.multimedia.length > 0
                      ? item.multimedia[0].image ||
                        `/clothes/clothe-${(idx % 4) + 1}.png`
                      : `/clothes/clothe-${(idx % 4) + 1}.png`
                  }
                  alt={item.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="25vw"
                />
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
                  Bs. {item.price}
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
              {outfitDetails.items[showSizePopup]?.sizes?.map((sizeObj) => {
                const isAvailable = sizeObj.availability > 0;
                return (
                  <button
                    key={sizeObj.size + String(sizeObj.id)}
                    onClick={() => {
                      if (isAvailable) {
                        const selectedItem = outfitDetails.items[showSizePopup];
                        setSizeSelected((prev) => ({
                          ...prev,
                          [showSizePopup]: true,
                        }));
                        setBasketConfirmation({
                          show: true,
                          item: selectedItem,
                          size: sizeObj.size,
                          sizeId: sizeObj.id,
                        });
                        setShowSizePopup(null);

                        // Auto-hide after 5 seconds
                        setTimeout(() => {
                          setBasketConfirmation(null);
                        }, 50000);
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
                    {isAvailable && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#6B7280',
                          marginTop: '2px',
                        }}
                      >
                        Disponible: {sizeObj.availability}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Basket Confirmation Popup */}
      <BasketConfirmation
        show={basketConfirmation !== null}
        item={basketConfirmation?.item || { name: '', price: 0 }}
        size={basketConfirmation?.size || ''}
        itemIndex={
          basketConfirmation
            ? outfitDetails.items.findIndex(
                (item) => item === basketConfirmation.item
              )
            : 0
        }
        onClose={() => setBasketConfirmation(null)}
        onProceedToCheckout={() => {
          window.location.href = '/w/checkout';
        }}
        isMobile={false}
      />
    </div>
  );
};

export default OutfitPageDesktop;
