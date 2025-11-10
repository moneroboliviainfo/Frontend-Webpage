'use client';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';
import React from 'react';
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
};

const ProductPage = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <NavBar dynamicTransparent={isMobile} />
      {isMobile ? (
        <ProductPageMobile productDetails={productDetails} />
      ) : (
        <ProductPageDesktop productDetails={productDetails} />
      )}
    </>
  );
};

export default ProductPage;
