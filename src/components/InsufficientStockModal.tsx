import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';

interface InsufficientStockModalProps {
  isOpen: boolean;
  outOfStockItems: CartItem[];
  hasRemainingItems: boolean;
  onProceed: () => void;
  onGoHome: () => void;
}

export default function InsufficientStockModal({
  isOpen,
  outOfStockItems,
  hasRemainingItems,
  onProceed,
  onGoHome,
}: InsufficientStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-500 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Insufficient Stock</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <p className="text-gray-700 mb-4">
            {hasRemainingItems
              ? 'The following items are out of stock. Would you like to proceed without them?'
              : 'Unfortunately, all items in your cart are out of stock.'}
          </p>

          <div className="space-y-3">
            {outOfStockItems.map((item, index) => (
              <div
                key={`${item.variantId}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden relative">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <span>Size: {item.sizeName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>{item.colorName}</span>
                      {item.colorCode && (
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.colorCode }}
                          title={item.colorName}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {hasRemainingItems ? (
            <div className="flex gap-3">
              <button
                onClick={onGoHome}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Go to Homepage
              </button>
              <button
                onClick={onProceed}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Proceed Anyway
              </button>
            </div>
          ) : (
            <button
              onClick={onGoHome}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Homepage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
