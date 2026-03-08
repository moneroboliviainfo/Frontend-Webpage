'use client';
import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import TermsAndConditions from '@/components/TermsAndConditions';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import DeliveryMethodDisplay from './DeliveryMethodDisplay';
import DeliveryAddressDisplay from './DeliveryAddressDisplay';
import OrderItemsList from './OrderItemsList';
import OrderTotalDisplay from './OrderTotalDisplay';
import {
  selectCheckoutCartItems,
  selectRepriceData,
  selectSelectedShipment,
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

interface OrderReviewSectionProps {
  selectedDeliveryMethod: string;
  selectedCountry: string;
  formData: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    departamento: string;
    cityProvince: string;
    detailedAddress: string;
    city: string;
    streetNumber: string;
    postalCode: string;
  };
  repriceData?: RepriceData | null;
  deliveryCost?: number;
  onConfirmOrder?: () => void;
  onBackToDelivery?: () => void;
  showBackButton?: boolean;
  showConfirmButton?: boolean;
  showSectionTitles?: boolean;
  showPaymentMethod?: boolean;
  showTerms?: boolean;
  hasAcceptedTerms?: boolean;
  onTermsChange?: (accepted: boolean) => void;
  isCreatingOrder?: boolean;
  orderError?: string;
}

const OrderReviewSection: React.FC<OrderReviewSectionProps> = ({
  selectedDeliveryMethod,
  selectedCountry,
  formData,
  repriceData: repriceDataProp,
  deliveryCost = 0,
  onConfirmOrder,
  onBackToDelivery,
  showBackButton = true,
  showConfirmButton = true,
  showSectionTitles = true,
  showPaymentMethod = false,
  showTerms = false,
  hasAcceptedTerms = false,
  onTermsChange,
  isCreatingOrder = false,
  orderError = '',
}) => {
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Use Redux state for cart items and reprice data
  const cartItems = useAppSelector(selectCheckoutCartItems);
  const repriceDataRedux = useAppSelector(selectRepriceData);
  const selectedShipment = useAppSelector(selectSelectedShipment);

  // Use Redux data if available, otherwise fall back to prop
  const repriceData = repriceDataRedux || repriceDataProp;
  const deliveryCostFromRedux = selectedShipment
    ? parseFloat(selectedShipment.price)
    : 0;
  const finalDeliveryCost = deliveryCostFromRedux || deliveryCost;
  const formatDeliveryDetails = () => {
    const price = selectedShipment ? parseFloat(selectedShipment.price) : 0;
    const priceText = price > 0 ? `Bs. ${price.toFixed(2)}` : '';

    if (selectedCountry === 'Bolivia') {
      switch (selectedDeliveryMethod) {
        case 'Envío a terminal':
          return `Recíbelo por encomienda${priceText ? ` - ${priceText}` : ''}`;
        case 'Envío a domicilio':
          return `Recíbelo en casa ${priceText ? ` - ${priceText}` : ''}`;
        case 'Envío a provincia':
          return `Recíbelo por encomienda${priceText ? ` - ${priceText}` : ''}`;
        case 'Envío por avión':
          return `Recógelo lo más pronto posible${
            priceText ? ` - ${priceText}` : ''
          }`;
        default:
          return priceText;
      }
    } else {
      return `Tiempo y costo determinado por DHL${
        priceText ? ` - ${priceText}` : ''
      }`;
    }
  };

  const formatAddress = () => {
    const addressParts = [
      formData.name,
      formData.phone ? `${formData.countryCode} ${formData.phone}` : '',
      formData.email,
      '', // Empty line for spacing
    ];

    if (selectedCountry === 'Bolivia') {
      addressParts.push(
        formData.detailedAddress || '',
        formData.cityProvince || '',
        formData.departamento || '',
        selectedCountry,
      );
    } else {
      addressParts.push(
        formData.streetNumber || '',
        formData.city || '',
        formData.postalCode || '',
        selectedCountry,
      );
    }

    return addressParts.filter((part) => part.trim() !== '').join('\n');
  };

  // Calculate pricing
  const itemsSubtotal = repriceData
    ? repriceData.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      )
    : 0;

  // Calculate total discount based on the difference between subtotal and reprice total
  const totalDiscount = repriceData
    ? itemsSubtotal - parseFloat(repriceData.total)
    : 0;

  const subtotalAfterDiscount = repriceData
    ? parseFloat(repriceData.total)
    : itemsSubtotal;
  const total = subtotalAfterDiscount + finalDeliveryCost;

  return (
    <>
      {/* Cart Summary Section */}
      {cartItems.length > 0 && repriceData && (
        <OrderItemsList
          items={cartItems}
          layout="vertical"
          showTitle={showSectionTitles}
          title="Resumen de la orden:"
        />
      )}

      {/* Cart Summary Section - Order Totals */}
      {cartItems.length > 0 && repriceData && (
        <div
          className="border-b"
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <OrderTotalDisplay
            subtotal={subtotalAfterDiscount}
            deliveryCost={finalDeliveryCost}
            total={total}
            showDeliveryCostMessage={selectedCountry !== 'Bolivia'}
            deliveryCostMessage="Costo determinado por DHL cuando lo recibas"
          />
        </div>
      )}

      {/* Selected Delivery Method Display */}
      {selectedDeliveryMethod && (
        <DeliveryMethodDisplay
          deliveryMethod={selectedDeliveryMethod}
          country={selectedCountry}
          price={finalDeliveryCost}
          showTitle={showSectionTitles}
        />
      )}

      {/* Delivery Address Display */}
      <DeliveryAddressDisplay
        formData={formData}
        country={selectedCountry}
        showTitle={showSectionTitles}
      />

      {/* Payment Method */}
      {showPaymentMethod && (
        <div
          className="border-b"
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div className="flex items-center" style={{ gap: '0.75rem' }}>
            <div
              className="flex items-center justify-center bg-blue-100 rounded"
              style={{
                width: '40px',
                height: '30px',
              }}
            >
              {/* QR Code Icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#3b82f6' }}
              >
                <rect x="3" y="3" width="5" height="5" />
                <rect x="3" y="16" width="5" height="5" />
                <rect x="16" y="3" width="5" height="5" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" />
                <path d="M12 3h.01" />
                <path d="M12 16v.01" />
                <path d="M16 12h1" />
                <path d="M21 12v.01" />
                <path d="M12 21v-1" />
              </svg>
            </div>
            <div>
              <div
                className="font-medium"
                style={{
                  fontSize: '1rem',
                  color: '#111827',
                }}
              >
                Pago por QR
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                }}
              >
                Se generará un código QR válido por 15 minutos. Si no se
                completa el pago en este tiempo, la orden será cancelada
                automáticamente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      {showTerms && onTermsChange && (
        <div
          style={{
            marginBottom: '2rem',
          }}
        >
          <div
            className="flex items-start"
            style={{
              gap: '0.75rem',
            }}
          >
            <button
              onClick={() => onTermsChange(!hasAcceptedTerms)}
              className="flex items-center justify-center border rounded"
              style={{
                width: '20px',
                height: '20px',
                border: hasAcceptedTerms
                  ? '2px solid #3b82f6'
                  : '2px solid #d1d5db',
                backgroundColor: hasAcceptedTerms ? '#3b82f6' : 'white',
                marginTop: '2px',
                flexShrink: 0,
              }}
            >
              {hasAcceptedTerms && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: '1.4',
              }}
            >
              He leído y acepto las{' '}
              <button
                onClick={() => setShowTermsModal(true)}
                style={{
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Condiciones de Compra
              </button>{' '}
              y entiendo la información sobre el uso de mis datos personales
              explicada en la{' '}
              <button
                onClick={() => setShowPrivacyModal(true)}
                style={{
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Política de Privacidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {orderError && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            marginBottom: '1rem',
            borderRadius: '0.375rem',
          }}
        >
          <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>{orderError}</p>
        </div>
      )}

      {/* Confirm Order Button */}
      {showConfirmButton && onConfirmOrder && (
        <button
          onClick={onConfirmOrder}
          disabled={(showTerms && !hasAcceptedTerms) || isCreatingOrder}
          className="w-full font-bold flex items-center justify-center"
          style={{
            backgroundColor:
              (showTerms && !hasAcceptedTerms) || isCreatingOrder
                ? '#d1d5db'
                : '#000',
            color:
              (showTerms && !hasAcceptedTerms) || isCreatingOrder
                ? '#9ca3af'
                : 'white',
            padding: '1rem',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor:
              (showTerms && !hasAcceptedTerms) || isCreatingOrder
                ? 'not-allowed'
                : 'pointer',
            border: 'none',
            marginBottom: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          {isCreatingOrder ? (
            <>
              <svg
                className="animate-spin"
                style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '0.5rem',
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando orden...
            </>
          ) : (
            'Generar QR y pagar orden'
          )}
        </button>
      )}

      {/* Back Button */}
      {showBackButton && onBackToDelivery && (
        <div className="flex justify-center" style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              if (
                typeof window !== 'undefined' &&
                window.history &&
                window.history.length > 0
              ) {
                window.history.back();
              } else if (onBackToDelivery) {
                onBackToDelivery();
              }
            }}
            className="flex items-center gap-2 hover:bg-gray-100 transition-all"
            style={{
              fontSize: '0.9rem',
              color: '#374151',
              background: 'white',
              border: '1.5px solid #d1d5db',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver a método de envío
          </button>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 70, padding: '1rem' }}
        >
          <div
            className="bg-white rounded-lg flex flex-col"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Términos y Condiciones de Compra
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex items-center justify-center hover:bg-gray-100 rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
              }}
            >
              <TermsAndConditions showTitle={false} compact={true} />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="font-semibold hover:bg-gray-100"
                style={{
                  backgroundColor: '#000',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 70, padding: '1rem' }}
        >
          <div
            className="bg-white rounded-lg flex flex-col"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Política de Privacidad
              </h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex items-center justify-center hover:bg-gray-100 rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
              }}
            >
              <PrivacyPolicy showTitle={false} compact={true} />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="font-semibold hover:bg-gray-100"
                style={{
                  backgroundColor: '#000',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderReviewSection;
