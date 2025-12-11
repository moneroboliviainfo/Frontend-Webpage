import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import './InsufficientStockModal.css';

interface InsufficientStockModalProps {
  isOpen: boolean;
  outOfStockItems: CartItem[];
  availableItems: CartItem[];
  hasRemainingItems: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export default function InsufficientStockModal({
  isOpen,
  outOfStockItems,
  availableItems,
  hasRemainingItems,
  onProceed,
  onCancel,
}: InsufficientStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="insufficient-stock-overlay">
      <div className="insufficient-stock-modal">
        {/* Header */}
        <div className="insufficient-stock-header">
          <h2 className="insufficient-stock-title">Productos no disponibles</h2>
        </div>

        {/* Content */}
        <div className="insufficient-stock-content">
          <p className="insufficient-stock-message">
            {hasRemainingItems
              ? 'Los siguientes productos no están disponibles:'
              : 'Lamentablemente, todos los productos en tu carrito no están disponibles.'}
          </p>

          {/* Out of Stock Items */}
          <div className="product-list">
            {outOfStockItems.map((item, index) => (
              <div
                key={`out-of-stock-${item.variantId}-${index}`}
                className="out-of-stock-item"
              >
                {/* Image */}
                <div className="product-image">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="70px"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="product-details">
                  <h3 className="product-name">{item.productName}</h3>
                  <div className="product-attributes">
                    <span>Talla: {item.sizeName}</span>
                    <span>•</span>
                    <div className="color-indicator">
                      <span>{item.colorName}</span>
                      {item.colorCode && (
                        <div
                          className="color-dot"
                          style={{ backgroundColor: item.colorCode }}
                          title={item.colorName}
                        />
                      )}
                    </div>
                  </div>
                  <p className="product-quantity">Cantidad: {item.quantity}</p>
                  <div className="availability-badge">
                    <svg
                      className="availability-badge-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
                      <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
                    </svg>
                    <span className="availability-badge-text">
                      No disponible
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Available Items */}
          {hasRemainingItems && (
            <div className="available-section">
              <div className="available-header">
                <svg
                  className="available-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="available-title">
                  Productos disponibles en tu carrito:
                </p>
              </div>
              <div className="product-list">
                {availableItems.map((item, index) => (
                  <div
                    key={`available-${item.variantId}-${index}`}
                    className="available-item"
                  >
                    {/* Image */}
                    <div className="product-image">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="70px"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="product-details">
                      <h3 className="product-name">{item.productName}</h3>
                      <div className="product-attributes">
                        <span>Talla: {item.sizeName}</span>
                        <span>•</span>
                        <div className="color-indicator">
                          <span>{item.colorName}</span>
                          {item.colorCode && (
                            <div
                              className="color-dot"
                              style={{ backgroundColor: item.colorCode }}
                              title={item.colorName}
                            />
                          )}
                        </div>
                      </div>
                      <p className="product-quantity">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="insufficient-stock-footer">
          {hasRemainingItems ? (
            <div className="button-group">
              <button onClick={onProceed} className="btn-primary">
                Continuar compra sin los productos agotados
              </button>
              <button onClick={onCancel} className="btn-secondary">
                Cancelar compra
              </button>
            </div>
          ) : (
            <button onClick={onCancel} className="btn-primary">
              Volver a la pantalla principal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
