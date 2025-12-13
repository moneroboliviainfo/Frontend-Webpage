'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  variantId?: number;
  id?: number;
  productId?: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  sizeName: string;
  colorName: string;
  finalPrice: number;
  price?: number;
}

interface OrderItemsListProps {
  items: OrderItem[];
  layout?: 'vertical' | 'horizontal';
  showTitle?: boolean;
  title?: string;
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({
  items,
  layout = 'vertical',
  showTitle = true,
  title = 'Resumen de la orden:',
}) => {
  if (layout === 'horizontal') {
    return (
      <div>
        {showTitle && (
          <div
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
            }}
          >
            {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
          </div>
        )}
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            marginBottom: '2rem',
            scrollSnapType: 'x mandatory',
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.variantId || item.id || index}
              className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: '120px',
                height: '120px',
                scrollSnapAlign: 'start',
                position: 'relative',
                backgroundColor: '#f3f4f6',
              }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '0.5rem',
                  }}
                >
                  {item.productName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-b"
      style={{
        paddingBottom: '1.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {showTitle && (
        <h3
          className="font-medium"
          style={{
            fontSize: '1rem',
            marginBottom: '1rem',
            color: '#374151',
            fontWeight: 'bold',
          }}
        >
          {title}
        </h3>
      )}

      <div style={{ marginBottom: '1rem' }}>
        {items.map((item, index) => (
          <div
            key={item.variantId || item.id || index}
            className="flex"
            style={{
              gap: '1rem',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            {/* Product Image */}
            <div
              style={{
                position: 'relative',
                width: '60px',
                height: '80px',
                flexShrink: 0,
                borderRadius: '0.375rem',
                overflow: 'hidden',
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
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                  }}
                >
                  Sin imagen
                </div>
              )}
            </div>

            {/* Product Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="font-medium"
                style={{
                  fontSize: '0.875rem',
                  color: '#111827',
                  marginBottom: '0.25rem',
                }}
              >
                {item.productName}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                Talla: {item.sizeName} | Color: {item.colorName}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                }}
              >
                Cantidad: {item.quantity}
              </div>
            </div>

            {/* Price */}
            <div
              className="font-medium"
              style={{
                fontSize: '0.875rem',
                color:
                  item.price && item.finalPrice < item.price
                    ? '#ef4444'
                    : '#111827',
                flexShrink: 0,
              }}
            >
              Bs. {item.finalPrice.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;
