'use client';
import React from 'react';
import Image from 'next/image';

type BasketConfirmationProps = {
  show: boolean;
  item: {
    name: string;
    price: number;
    sizes?: Array<{ size: string; availability: number }>;
  };
  size: string;
  itemIndex: number;
  onClose: () => void;
  onProceedToCheckout: () => void;
  isMobile?: boolean;
};

const BasketConfirmation: React.FC<BasketConfirmationProps> = ({
  show,
  item,
  size,
  itemIndex,
  onClose,
  onProceedToCheckout,
  isMobile = false,
}) => {
  if (!show) return null;

  const containerStyle = isMobile
    ? {
        position: 'fixed' as const,
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        width: '90vw',
        maxWidth: '320px',
        border: '1px solid #e5e7eb',
      }
    : {
        position: 'fixed' as const,
        top: '20px',
        right: '20px',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        width: '320px',
        border: '1px solid #e5e7eb',
      };

  return (
    <div style={containerStyle}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '5px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '28px',
          cursor: 'pointer',
          color: '#6B7280',
        }}
      >
        ×
      </button>

      {/* Added to basket header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}
        >
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
            ✓
          </span>
        </div>
        <span style={{ fontWeight: '600', fontSize: '14px', color: '#000' }}>
          Añadido al carrito
        </span>
      </div>

      {/* Product details */}
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        {/* Product image */}
        <div
          style={{
            width: '60px',
            height: '80px',
            marginRight: '12px',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Image
            src={`/clothes/clothe-${(itemIndex % 4) + 1}.png`}
            alt={item.name}
            width={60}
            height={80}
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Product info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#000',
              marginBottom: '4px',
            }}
          >
            {item.price} €
          </div>
          <div style={{ fontSize: '14px', color: '#000', marginBottom: '8px' }}>
            {item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Size {size}
            </div>
            {/* Color indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  border: '1px solid #e5e7eb',
                }}
              ></div>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Black</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button
          onClick={onProceedToCheckout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          PROCESAR ORDEN
        </button>
      </div>
    </div>
  );
};

export default BasketConfirmation;
