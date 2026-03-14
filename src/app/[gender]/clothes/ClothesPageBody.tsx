'use client';
import React, { Suspense } from 'react';
import ClothesGallery from './ClothesGallery';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

type Props = {
  gender: string;
  category: string;
};

const ClothesPageBody: React.FC<Props> = ({ gender, category }) => {
  // Wrap ClothesGallery in Suspense as required by Next.js App Router when
  // a child component uses useSearchParams(). Without the boundary, Next.js
  // performs extraneous History.replaceState calls on back-navigation which
  // can trigger postMessage errors in third-party analytics scripts (Clarity).
  return (
    <Suspense fallback={<LoadingScreen message="Cargando productos..." />}>
      <ClothesGallery />
    </Suspense>
  );
};

export default ClothesPageBody;
