'use client';
import React, { useState } from 'react';

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

interface CheckoutCostSummaryProps {
  subtotal: number;
  selectedCountry: string;
  deliveryCost?: number;
  onExpandToggle?: (isExpanded: boolean) => void;
  repriceData?: RepriceData | null;
}

const CheckoutCostSummary: React.FC<CheckoutCostSummaryProps> = ({
  subtotal,
  selectedCountry,
  deliveryCost,
  onExpandToggle,
  repriceData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandToggle?.(newExpanded);
  };

  const formatPrice = (price: number) => {
    return `Bs. ${price.toFixed(2)}`;
  };

  const getDeliveryCostDisplay = () => {
    if (selectedCountry === 'Bolivia') {
      return '-'; // For now, will be replaced with selected option cost later
    } else {
      return 'DHL';
    }
  };

  // Calculate totals from reprice data
  const itemsSubtotal = repriceData
    ? repriceData.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      )
    : subtotal;

  // Calculate total discount based on the difference between subtotal and reprice total
  const totalDiscount = repriceData
    ? itemsSubtotal - parseFloat(repriceData.total)
    : 0;

  const subtotalAfterDiscount = repriceData
    ? parseFloat(repriceData.total)
    : itemsSubtotal;
  const total = subtotalAfterDiscount + (deliveryCost || 0);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t"
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '1rem',
        zIndex: 30,
      }}
    >
      {/* Expanded View */}
      {isExpanded && (
        <div style={{ marginBottom: '1rem' }}>
          {/* Subtotal */}
          <div
            className="flex justify-between items-center"
            style={{
              marginBottom: '0.75rem',
              fontSize: '1rem',
              color: '#374151',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Subtotal</span>
            <span>{formatPrice(subtotalAfterDiscount)}</span>
          </div>

          {/* Delivery Cost */}
          <div
            className="flex justify-between items-center"
            style={{
              marginBottom: '0.75rem',
              fontSize: '1rem',
              color: '#374151',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Costo de envío</span>
            <span>
              {deliveryCost
                ? formatPrice(deliveryCost)
                : getDeliveryCostDisplay()}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              marginBottom: '0.75rem',
            }}
          />
        </div>
      )}

      {/* Total Section */}
      <div className="flex justify-between items-center">
        <span
          className="font-semibold"
          style={{
            fontSize: '1.125rem',
            color: '#111827',
          }}
        >
          Total
        </span>
        <div className="flex items-center" style={{ gap: '0.5rem' }}>
          <span
            className="font-semibold"
            style={{
              fontSize: '1.125rem',
              color: '#111827',
            }}
          >
            {formatPrice(total)}
          </span>
          <button
            onClick={handleToggle}
            className="flex items-center justify-center hover:bg-gray-100 rounded-full"
            style={{
              width: '32px',
              height: '32px',
              transition: 'transform 0.2s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: '#374151' }}
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCostSummary;
