'use client';
import Footer from '@/components/Footer';
import React from 'react';

type ProductDetails = {
  multimedia: Array<{ image: string; label: string }>;
  productId: number;
  name: string;
  price: number;
  colorsWithSizes: Array<{
    color: string;
    sizes: Array<{ size: string; availability: number }>;
  }>;
  isNew: boolean;
  discount: number;
  finalPrice: number;
  description: string;
};

type Props = {
  productDetails: ProductDetails;
};

const ProductPageDesktop: React.FC<Props> = ({ productDetails }) => {
  return (
    <>
      <div className="w-full flex flex-col" style={{ height: '70vh' }}>
        {/* Top 70% - Primary color with slider */}
        <div style={{ height: '100%' }} className="relative">
          <div className="absolute inset-0">
            {/* Desktop layout placeholder - to be implemented */}
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {productDetails.name}
                </h2>
                <p className="text-lg">Desktop layout coming soon...</p>
                <div className="mt-4">
                  <span className="text-xl font-bold">
                    Bs. {productDetails.finalPrice}
                  </span>
                  {productDetails.discount > 0 && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      Bs. {productDetails.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPageDesktop;
