'use client';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductPageMobile from './ProductPageMobile';
import ProductPageDesktop from './ProductPageDesktop';

const productDetails = {
  multimedia: [
    { image: '/images/ver-slide-1.png', label: '' },
    { image: '/images/ver-slide-2.png', label: '' },
  ],
  productId: 101,
  name: 'Chaqueta Derby',
  price: 129,
  colorsWithSizes: [
    {
      color: '#111827',
      sizes: [
        { size: 'XS', availability: 0 },
        { size: 'S', availability: 3 },
        { size: 'M', availability: 5 },
        { size: 'L', availability: 2 },
        { size: 'XL', availability: 1 },
      ],
    },
    {
      color: '#f97316',
      sizes: [
        { size: 'XS', availability: 2 },
        { size: 'S', availability: 0 },
        { size: 'M', availability: 8 },
        { size: 'L', availability: 0 },
        { size: 'XL', availability: 3 },
      ],
    },
    {
      color: '#e53e3e',
      sizes: [
        { size: 'XS', availability: 0 },
        { size: 'S', availability: 0 },
        { size: 'M', availability: 0 },
        { size: 'L', availability: 0 },
        { size: 'XL', availability: 0 },
      ],
    },
  ],
  isNew: true,
  discount: 10,
  finalPrice: 116,
  description: 'Model height: 178 cm - Size S',
  slug: 'chaqueta-derby-101',
};

// Mock additional products for demonstration
const allProductsData = [
  {
    ...productDetails,
    slug: 'chaqueta-derby-101',
  },
  {
    ...productDetails,
    productId: 102,
    name: 'Blusa Elegante',
    price: 89,
    finalPrice: 79,
    discount: 11,
    description: 'Model height: 175 cm - Size M',
    slug: 'blusa-elegante-102',
    multimedia: [
      { image: '/images/ver-slide-1.png', label: '' },
      { image: '/images/ver-slide-2.png', label: '' },
    ],
  },
  {
    ...productDetails,
    productId: 103,
    name: 'Vestido Casual',
    price: 159,
    finalPrice: 139,
    discount: 13,
    description: 'Model height: 180 cm - Size L',
    slug: 'vestido-casual-103',
    multimedia: [
      { image: '/images/ver-slide-1.png', label: '' },
      { image: '/images/ver-slide-2.png', label: '' },
    ],
  },
];

const ProductPage = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const params = useParams();

  // Get current product slug from URL
  const currentSlug = Array.isArray(params?.product)
    ? params.product[0]
    : params?.product || '';

  // Find current product index based on URL slug
  const getCurrentProductIndex = () => {
    const index = allProductsData.findIndex(
      (product) =>
        currentSlug.includes(product.productId.toString()) ||
        product.slug === currentSlug
    );
    return index >= 0 ? index : 0;
  };

  const [currentProductIndex, setCurrentProductIndex] = useState(() =>
    getCurrentProductIndex()
  );
  const currentProduct = allProductsData[currentProductIndex];

  // Update URL when product changes
  const handleProductChange = (newIndex: number) => {
    const newProduct = allProductsData[newIndex];
    if (newProduct) {
      setCurrentProductIndex(newIndex);
      // Use the product slug or fallback to a generated slug
      const newSlug =
        newProduct.slug ||
        `${newProduct.name.toLowerCase().replace(/\s+/g, '-')}-${
          newProduct.productId
        }`;
      router.replace(`/w/${newSlug}`, { scroll: false });
    }
  };

  // Sync state with URL changes
  useEffect(() => {
    const index = allProductsData.findIndex(
      (product) =>
        currentSlug.includes(product.productId.toString()) ||
        product.slug === currentSlug
    );
    const newIndex = index >= 0 ? index : 0;
    setCurrentProductIndex(newIndex);
  }, [currentSlug]);

  return (
    <>
      <NavBar dynamicTransparent={isMobile} />
      {isMobile ? (
        <ProductPageMobile
          productDetails={currentProduct}
          allProducts={allProductsData}
          currentProductIndex={currentProductIndex}
          onProductChange={handleProductChange}
        />
      ) : (
        <ProductPageDesktop productDetails={currentProduct} />
      )}
    </>
  );
};

export default ProductPage;
