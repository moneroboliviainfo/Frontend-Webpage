'use client';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OutfitPageMobile from './OutfitPageMobile';
import OutfitPageDesktop from './OutfitPageDesktop';

const outfitDetails = {
  multimedia: [
    { image: '/images/ver-slide-1.png', label: '' },
    { image: '/images/ver-slide-2.png', label: '' },
  ],
  outfitId: 101,
  name: 'Outfit Casual Elegante',
  items: [
    {
      name: 'Chaqueta Derby',
      price: 129,
      sizes: [
        { size: 'S', availability: 3 },
        { size: 'M', availability: 1 },
        { size: 'L', availability: 0 },
        { size: 'XL', availability: 2 },
      ],
    },
    {
      name: 'Blusa Elegante',
      price: 89,
      sizes: [
        { size: 'XS', availability: 2 },
        { size: 'S', availability: 4 },
        { size: 'M', availability: 0 },
        { size: 'L', availability: 1 },
      ],
    },
    {
      name: 'Pantalón Slim',
      price: 79,
      sizes: [
        { size: '28', availability: 1 },
        { size: '30', availability: 3 },
        { size: '32', availability: 0 },
        { size: '34', availability: 2 },
      ],
    },
  ],
  totalPrice: 297,
  description: 'Combina elegancia y comodidad para cualquier ocasión',
  slug: 'outfit-casual-elegante-101',
};

// Mock additional outfits for demonstration
const allOutfitsData = [
  {
    ...outfitDetails,
    slug: 'outfit-casual-elegante-101',
  },
  {
    ...outfitDetails,
    outfitId: 102,
    name: 'Outfit Deportivo',
    items: [
      {
        name: 'Sudadera Oversize',
        price: 99,
        sizes: [
          { size: 'S', availability: 2 },
          { size: 'M', availability: 0 },
          { size: 'L', availability: 4 },
          { size: 'XL', availability: 3 },
          { size: 'XXL', availability: 1 },
        ],
      },
      {
        name: 'Joggers Premium',
        price: 69,
        sizes: [
          { size: 'XS', availability: 1 },
          { size: 'S', availability: 2 },
          { size: 'M', availability: 0 },
          { size: 'L', availability: 3 },
        ],
      },
    ],
    totalPrice: 168,
    description: 'Perfecto para un look casual y cómodo',
    slug: 'outfit-deportivo-102',
    multimedia: [
      { image: '/images/ver-slide-1.png', label: '' },
      { image: '/images/ver-slide-2.png', label: '' },
    ],
  },
  {
    ...outfitDetails,
    outfitId: 103,
    name: 'Outfit Formal',
    items: [
      {
        name: 'Blazer Clásico',
        price: 189,
        sizes: [
          { size: 'S', availability: 1 },
          { size: 'M', availability: 2 },
          { size: 'L', availability: 0 },
          { size: 'XL', availability: 3 },
        ],
      },
      {
        name: 'Camisa Formal',
        price: 79,
        sizes: [
          { size: '38', availability: 2 },
          { size: '40', availability: 0 },
          { size: '42', availability: 1 },
          { size: '44', availability: 4 },
        ],
      },
      {
        name: 'Pantalón de Vestir',
        price: 129,
        sizes: [
          { size: '30', availability: 3 },
          { size: '32', availability: 2 },
          { size: '34', availability: 0 },
          { size: '36', availability: 1 },
        ],
      },
    ],
    totalPrice: 397,
    description: 'Ideal para ocasiones especiales y eventos formales',
    slug: 'outfit-formal-103',
    multimedia: [
      { image: '/images/ver-slide-1.png', label: '' },
      { image: '/images/ver-slide-2.png', label: '' },
    ],
  },
];

const OutfitsPageContent = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current outfit ID from URL query parameter
  const currentOutfitId = searchParams?.get('outfit') || '101';

  // Find current outfit index based on URL parameter (same logic as product page)
  const getCurrentOutfitIndex = () => {
    const index = allOutfitsData.findIndex(
      (outfit) =>
        currentOutfitId.includes(outfit.outfitId.toString()) ||
        outfit.slug === currentOutfitId
    );
    return index >= 0 ? index : 0;
  };

  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(() =>
    getCurrentOutfitIndex()
  );
  const currentOutfit = allOutfitsData[currentOutfitIndex];

  // Update URL when outfit changes (same logic as product page)
  const handleOutfitChange = (newIndex: number) => {
    const newOutfit = allOutfitsData[newIndex];
    if (newOutfit) {
      setCurrentOutfitIndex(newIndex);
      // Use the outfit ID for query parameter
      router.replace(`/w/outfits?outfit=${newOutfit.outfitId}`, {
        scroll: false,
      });
    }
  };

  // Sync state with URL changes (same logic as product page)
  useEffect(() => {
    const index = allOutfitsData.findIndex(
      (outfit) =>
        currentOutfitId.includes(outfit.outfitId.toString()) ||
        outfit.slug === currentOutfitId
    );
    const newIndex = index >= 0 ? index : 0;
    setCurrentOutfitIndex(newIndex);
  }, [currentOutfitId]);

  return (
    <>
      <NavBar dynamicTransparent={isMobile} />
      {isMobile ? (
        <OutfitPageMobile
          outfitDetails={currentOutfit}
          allOutfits={allOutfitsData}
          currentOutfitIndex={currentOutfitIndex}
          onOutfitChange={handleOutfitChange}
        />
      ) : (
        <OutfitPageDesktop outfitDetails={currentOutfit} />
      )}
    </>
  );
};

const OutfitsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando outfits...</p>
          </div>
        </div>
      }
    >
      <OutfitsPageContent />
    </Suspense>
  );
};

export default OutfitsPage;
