'use client';
import React from 'react';

interface OrderStatusDisplayProps {
  status: string;
  description: string;
}

const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  status,
  description,
}) => {
  return (
    <div
      style={{
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <div
        className="font-semibold"
        style={{
          fontSize: '1.125rem',
          color: '#111827',
          marginBottom: '0.5rem',
        }}
      >
        Estado: {status}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: '#10b981',
          fontWeight: '500',
        }}
      >
        {description}
      </div>
    </div>
  );
};

export default OrderStatusDisplay;
