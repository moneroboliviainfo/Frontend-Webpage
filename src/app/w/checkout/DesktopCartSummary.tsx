'use client';
import React from 'react';
import Link from 'next/link';

interface DesktopCartSummaryProps {
  selectedCountry: string;
  selectedDeliveryMethod?: string;
}

const DesktopCartSummary: React.FC<DesktopCartSummaryProps> = ({
  selectedCountry,
  selectedDeliveryMethod,
}) => {
  // Mock cart items - in real app would come from Redux store
  const cartItems = [
    {
      id: 1,
      name: 'Cropped denim jacket',
      size: 'XS',
      color: 'Light blue',
      price: 29.99,
      image: '/clothes/jacket-1.jpg',
    },
    {
      id: 2,
      name: 'Low-rise boot-cut trousers',
      size: '36 Regular',
      color: 'Black',
      price: 29.99,
      image: '/clothes/pants-1.jpg',
    },
    {
      id: 3,
      name: 'Kitten heel slingback shoes',
      size: '35',
      color: 'BLACK',
      price: 29.99,
      image: '/clothes/shoes-1.jpg',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const deliveryCost =
    selectedDeliveryMethod === 'Envío a terminal'
      ? 30
      : selectedCountry === 'Bolivia'
      ? 0
      : 30;
  const total = subtotal + (selectedDeliveryMethod ? deliveryCost : 0);

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
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex"
            style={{
              marginBottom: '1.5rem',
              gap: '1rem',
            }}
          >
            {/* Item Image */}
            <div
              className="bg-gray-200 rounded flex items-center justify-center flex-shrink-0"
              style={{
                width: '60px',
                height: '80px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center',
                }}
              >
                IMG
              </div>
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
                {item.name}
              </Link>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {item.size} {item.color}
              </div>
              <div
                className="font-semibold"
                style={{
                  fontSize: '0.875rem',
                  color: '#111827',
                }}
              >
                Bs. {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
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
          <span style={{ color: '#111827' }}>Bs. {subtotal.toFixed(2)}</span>
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
          <span style={{ color: '#111827' }}>Bs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default DesktopCartSummary;
