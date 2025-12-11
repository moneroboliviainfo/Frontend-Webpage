'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/components/ProductsGallery';
import { API_URL } from '@/config/env';
import buildProductSlug from '@/utils/buildProductSlug';
import './AccessoriesSlider.css';

interface AccessoriesSliderProps {
  products: Product[];
  onAddToCart: (
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
  ) => void;
}

type VariantSize = {
  size: {
    id: number;
    name: string;
  };
  availableStock: number;
  id: number;
};

type ProductColorWithSizes = {
  id: number;
  color: {
    id: number;
    name: string;
    code: string;
  };
  multimedia: string[];
  variants: VariantSize[];
};

type ProductWithSizes = {
  id: number;
  name: string;
  price: string;
  discount: {
    id: number;
    value: number;
    isActive: boolean;
  } | null;
  productColors: ProductColorWithSizes[];
};

export default function AccessoriesSlider({
  products,
  onAddToCart,
}: AccessoriesSliderProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [productWithSizes, setProductWithSizes] =
    useState<ProductWithSizes | null>(null);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300; // pixels to scroll
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setSelectedColorIndex(0);
    setLoadingSizes(true);

    try {
      // Fetch full product details with sizes
      const response = await fetch(`${API_URL}products/${product.id}`);
      if (response.ok) {
        const data: ProductWithSizes = await response.json();
        setProductWithSizes(data);
      }
    } catch (error) {
      console.error('Error fetching product sizes:', error);
    } finally {
      setLoadingSizes(false);
    }
  };

  const handleSizeSelect = (sizeId: number) => {
    if (!selectedProduct || !productWithSizes) return;
    const selectedColor = productWithSizes.productColors[selectedColorIndex];
    const selectedSize = selectedColor?.variants.find(
      (v) => v.size.id === sizeId
    );
    if (!selectedColor || !selectedSize) return;

    const price = parseFloat(productWithSizes.price);
    const discount = productWithSizes.discount;
    const discountValue =
      discount && discount.isActive && discount.value > 0 ? discount.value : 0;
    const finalPrice =
      discountValue > 0 ? price - (price * discountValue) / 100 : price;

    onAddToCart(
      selectedProduct.id,
      selectedProduct.name,
      selectedColor.id,
      selectedColor.color.code,
      selectedColor.color.name,
      selectedSize.size.id,
      selectedSize.size.name,
      price,
      discountValue,
      finalPrice,
      selectedColor.multimedia?.[0] || ''
    );
    setSelectedProduct(null);
    setProductWithSizes(null);
    setSelectedColorIndex(0);
  };

  return (
    <>
      <div className="accessories-slider-container">
        <div className="accessories-slider-wrapper">
          <h3 className="accessories-slider-title">Complementa tu compra</h3>
          <div className="accessories-slider-with-controls">
            <button
              className="accessories-slider-nav-button accessories-slider-nav-left"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <div
              ref={scrollContainerRef}
              className="accessories-slider-scroll"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <div className="accessories-slider-items">
                {products.map((product) => {
                  const firstColor = product.productColors[0];
                  const imageUrl = firstColor?.multimedia?.[0] || '';
                  const price = parseFloat(product.price);
                  const discount = product.discount;
                  const hasDiscount =
                    discount && discount.isActive && discount.value > 0;
                  const finalPrice = hasDiscount
                    ? price - (price * (discount?.value || 0)) / 100
                    : price;

                  const handleImageClick = () => {
                    const slug = buildProductSlug(product.name, product.id);
                    router.push(`/w/${slug}`);
                  };

                  return (
                    <div key={product.id} className="accessory-card">
                      <div className="accessory-card-inner">
                        {/* Image */}
                        <div
                          className="accessory-image-container"
                          onClick={handleImageClick}
                          style={{ cursor: 'pointer' }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleImageClick();
                            }
                          }}
                        >
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="140px"
                            />
                          )}
                          {hasDiscount && (
                            <div className="accessory-discount-badge">
                              -{discount?.value}%
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="accessory-info">
                          <h4 className="accessory-name">{product.name}</h4>
                          <div className="accessory-price-container">
                            {hasDiscount ? (
                              <>
                                <p className="accessory-price">
                                  Bs. {finalPrice.toFixed(2)}
                                </p>
                                <p className="accessory-original-price">
                                  Bs. {price.toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="accessory-price">
                                Bs. {price.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleProductClick(product)}
                            className="accessory-size-button"
                          >
                            Talla
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              className="accessories-slider-nav-button accessories-slider-nav-right"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Size Selection Modal */}
      {selectedProduct && (
        <div
          className="accessories-modal-overlay"
          onClick={() => {
            setSelectedProduct(null);
            setProductWithSizes(null);
          }}
        >
          <div
            className="accessories-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="accessories-modal-header">
              <div className="accessories-modal-header-content">
                <h2 className="accessories-modal-title">
                  Selecciona una talla
                </h2>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductWithSizes(null);
                  }}
                  className="accessories-modal-close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="accessories-modal-content">
              <div className="accessories-modal-product-name">
                <h3 className="accessories-modal-product-title">
                  {selectedProduct.name}
                </h3>
              </div>

              {loadingSizes ? (
                <div className="accessories-modal-loading">
                  <div className="accessories-modal-loading-text">
                    Cargando tallas...
                  </div>
                </div>
              ) : productWithSizes ? (
                <>
                  {/* Color Selection */}
                  {productWithSizes.productColors.length > 1 && (
                    <div className="accessories-color-section">
                      <label className="accessories-color-label">Color</label>
                      <div className="accessories-color-options">
                        {productWithSizes.productColors.map(
                          (colorData, index) => (
                            <button
                              key={colorData.id}
                              onClick={() => setSelectedColorIndex(index)}
                              className={`accessories-color-button ${
                                selectedColorIndex === index ? 'selected' : ''
                              }`}
                              style={{
                                backgroundColor: colorData.color.code,
                              }}
                              title={colorData.color.name}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  <div className="accessories-size-section">
                    <label className="accessories-size-label">Talla</label>
                    <div className="accessories-size-grid">
                      {productWithSizes.productColors[
                        selectedColorIndex
                      ]?.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleSizeSelect(variant.size.id)}
                          disabled={variant.availableStock <= 0}
                          className={`accessories-size-option ${
                            variant.availableStock <= 0
                              ? 'unavailable'
                              : 'available'
                          }`}
                        >
                          {variant.size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="accessories-modal-error">
                  <div className="accessories-modal-error-text">
                    No se pudieron cargar las tallas
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
