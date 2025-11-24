'use client';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useState, useEffect } from 'react';
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
    { name: 'Chaqueta Derby', price: 129 },
    { name: 'Blusa Elegante', price: 89 },
    { name: 'Pantalón Slim', price: 79 },
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
      { name: 'Sudadera Oversize', price: 99 },
      { name: 'Joggers Premium', price: 69 },
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
      { name: 'Blazer Clásico', price: 189 },
      { name: 'Camisa Formal', price: 79 },
      { name: 'Pantalón de Vestir', price: 129 },
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

const OutfitsPage = () => {
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

export default OutfitsPage;
