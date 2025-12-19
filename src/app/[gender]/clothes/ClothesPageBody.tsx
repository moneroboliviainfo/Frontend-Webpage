'use client';
import React from 'react';
import ClothesGallery from './ClothesGallery';

type Props = {
  gender: string;
  category: string;
};

const ClothesPageBody: React.FC<Props> = ({ gender, category }) => {
  // ClothesGallery now renders ClothesPageNavBar internally, so only render ClothesGallery here
  return <ClothesGallery />;
};

export default ClothesPageBody;
