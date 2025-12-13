'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import {
  selectCheckoutCartItems,
  selectRepriceData,
} from '@/store/checkoutSlice';

interface RepriceData {
  items: Array<{
    variantId: number;
    quantity: number;
    unit_price: number;
    discountValue: number;
    totalPrice: string;
  }>;
  total: string;
}

interface DesktopCartSummaryProps {
  selectedCountry: string;
  selectedDeliveryMethod?: string;
  repriceData?: RepriceData | null;
  deliveryCost?: number;
}

const DesktopCartSummary: React.FC<DesktopCartSummaryProps> = ({
  selectedDeliveryMethod,
  repriceData: repriceDataProp,
  deliveryCost = 0,
}) => {
  // Use Redux state for cart items and reprice data
  const cartItems = useAppSelector(selectCheckoutCartItems);
  const repriceDataRedux = useAppSelector(selectRepriceData);

  // Use Redux data if available, otherwise fall back to prop
  const repriceData = repriceDataRedux || repriceDataProp;

  // Calculate totals
  const itemsSubtotal = repriceData
    ? repriceData.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      )
    : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate total discount based on the difference between subtotal and reprice total
  const totalDiscount = repriceData
    ? itemsSubtotal - parseFloat(repriceData.total)
    : 0;

  return (
    <div
      className="h-full bg-gray-50 border-l"
      style={{
        borderLeft: '1px solid #e5e7eb',
        padding: '2rem 1.5rem',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <h2
          className="font-semibold"
          style={{
            fontSize: '1.125rem',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Resumen de compra ({cartItems.length})
        </h2>
      </div>

      {/* Cart Items */}
      <div style={{ marginBottom: '2rem' }}>
        {cartItems.map((item) => {
          return (
            <div
              key={item.variantId}
              className="flex"
              style={{
                marginBottom: '1.5rem',
                gap: '1rem',
              }}
            >
              {/* Item Image */}
              <div
                className="rounded flex-shrink-0 relative overflow-hidden"
                style={{
                  width: '60px',
                  height: '80px',
                  backgroundColor: '#f3f4f6',
                }}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="60px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center h-full"
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    IMG
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <Link
                  href="/w/pantalón-slim-102"
                  className="font-medium hover:underline"
                  style={{
                    fontSize: '0.875rem',
                    color: '#3b82f6',
                    marginBottom: '0.25rem',
                    display: 'block',
                  }}
                >
                  {item.productName}
                </Link>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.sizeName} - {item.colorName}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Cantidad: {item.quantity}
                </div>
                <div
                  className="font-semibold"
                  style={{
                    fontSize: '0.875rem',
                    color: item.finalPrice < item.price ? '#ef4444' : '#111827',
                  }}
                >
                  Bs. {(item.finalPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        className="border-t"
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1.5rem',
        }}
      >
        {/* Subtotal */}
        <div
          className="flex justify-between"
          style={{
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          <span style={{ color: '#6b7280' }}>Subtotal</span>
          <span style={{ color: '#111827' }}>
            Bs.{' '}
            {(repriceData
              ? parseFloat(repriceData.total)
              : itemsSubtotal
            ).toFixed(2)}
          </span>
        </div>

        {/* Delivery Costs */}
        <div
          className="flex justify-between"
          style={{
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          <span style={{ color: '#6b7280' }}>Costos de envío</span>
          <span style={{ color: '#111827' }}>
            {!selectedDeliveryMethod
              ? '-'
              : deliveryCost > 0
              ? `Bs. ${deliveryCost.toFixed(2)}`
              : 'Gratis'}
          </span>
        </div>

        {/* Total */}
        <div
          className="flex justify-between border-t pt-4"
          style={{
            borderTop: '1px solid #e5e7eb',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          <span style={{ color: '#111827' }}>Total</span>
          <span style={{ color: '#111827' }}>
            Bs.{' '}
            {repriceData
              ? (parseFloat(repriceData.total) + deliveryCost).toFixed(2)
              : (itemsSubtotal + deliveryCost).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DesktopCartSummary;
