import React from 'react';

interface OrderTotalDisplayProps {
  subtotal: number;
  deliveryCost: number;
  total: number;
  showDeliveryCostMessage?: boolean;
  deliveryCostMessage?: string;
}

const OrderTotalDisplay: React.FC<OrderTotalDisplayProps> = ({
  subtotal,
  deliveryCost,
  total,
  showDeliveryCostMessage = false,
  deliveryCostMessage = '',
}) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Subtotal */}
      <div
        className="flex justify-between"
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
        }}
      >
        <span>Subtotal:</span>
        <span>Bs. {subtotal.toFixed(2)}</span>
      </div>

      {/* Delivery Cost */}
      <div
        className="flex justify-between"
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
        }}
      >
        <span>Costo de envío:</span>
        {showDeliveryCostMessage ? (
          <span style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
            {deliveryCostMessage}
          </span>
        ) : (
          <span>Bs. {deliveryCost.toFixed(2)}</span>
        )}
      </div>

      {/* Total */}
      <div
        className="flex justify-between font-bold"
        style={{
          fontSize: '1rem',
          color: '#111827',
          paddingTop: '0.5rem',
          borderTop: '1px solid #e5e7eb',
          marginTop: '0.5rem',
        }}
      >
        <span>Total:</span>
        {showDeliveryCostMessage ? (
          <span style={{ fontSize: '0.875rem' }}>Por determinar</span>
        ) : (
          <span>Bs. {total.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};

export default OrderTotalDisplay;
