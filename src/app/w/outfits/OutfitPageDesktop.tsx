'use client';
import React from 'react';

type OutfitDetails = {
  multimedia: Array<{ image: string; label: string }>;
  outfitId: number;
  name: string;
  items: Array<{ name: string; price: number }>;
  totalPrice: number;
  description: string;
  slug?: string;
};

type Props = {
  outfitDetails: OutfitDetails;
};

const OutfitPageDesktop: React.FC<Props> = ({ outfitDetails }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-gray-600 mb-4">
          {outfitDetails.name}
        </h1>
        <p className="text-gray-500 mb-6">
          Desktop outfit view will be different - coming soon...
        </p>
        <div className="text-sm text-gray-400">
          <p>Outfit ID: {outfitDetails.outfitId}</p>
          <p>Items: {outfitDetails.items.length}</p>
          <p>Total: Bs. {outfitDetails.totalPrice}</p>
          <p className="mt-2 italic">{outfitDetails.description}</p>
        </div>
      </div>
    </div>
  );
};

export default OutfitPageDesktop;
