'use client';
import PillsList from '@/components/PillsList';
import useIsMobile from '@/hooks/useIsMobile';
import React, { useEffect, useRef, useState } from 'react';
import ClothesGallery from './ClothesGallery';
import ClothesPageNavBar from './ClothesPageNavBar';

type Props = {
  gender: string;
  category: string;
};

const ClothesPageBody: React.FC<Props> = ({ gender, category }) => {
  return (
    <>
      <ClothesPageNavBar gender={gender} category={category} />
      <ClothesGallery />
    </>
  );
};

export default ClothesPageBody;
