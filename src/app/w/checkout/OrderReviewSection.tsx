'use client';
import React from 'react';

interface OrderReviewSectionProps {
  selectedDeliveryMethod: string;
  selectedCountry: string;
  formData: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    departamento: string;
    cityProvince: string;
    detailedAddress: string;
    city: string;
    streetNumber: string;
    postalCode: string;
  };
  onConfirmOrder?: () => void;
  onBackToDelivery?: () => void;
  showBackButton?: boolean;
  showConfirmButton?: boolean;
  showSectionTitles?: boolean;
  showPaymentMethod?: boolean;
  showTerms?: boolean;
  hasAcceptedTerms?: boolean;
  onTermsChange?: (accepted: boolean) => void;
}

const OrderReviewSection: React.FC<OrderReviewSectionProps> = ({
  selectedDeliveryMethod,
  selectedCountry,
  formData,
  onConfirmOrder,
  onBackToDelivery,
  showBackButton = true,
  showConfirmButton = true,
  showSectionTitles = true,
  showPaymentMethod = false,
  showTerms = false,
  hasAcceptedTerms = false,
  onTermsChange,
}) => {
  const formatDeliveryDetails = () => {
    if (selectedCountry === 'Bolivia') {
      switch (selectedDeliveryMethod) {
        case 'Envío a terminal':
          return 'Recibelo en 24 horas - Bs. 30';
        case 'Envío a domicilio':
          return 'Recibelo en 48 horas - Bs. 50';
        case 'Envío a provincia':
          return 'Recibelo en 72 horas - Bs. 50';
        case 'Envío por avión':
          return 'Recibelo lo más pronto posible hasta su domicilio - Bs. 60';
        default:
          return '';
      }
    } else {
      return 'Tiempo y costo determinado por DHL';
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
        selectedCountry
      );
    } else {
      addressParts.push(
        formData.streetNumber || '',
        formData.city || '',
        formData.postalCode || '',
        selectedCountry
      );
    }

    return addressParts.filter((part) => part.trim() !== '').join('\n');
  };

  return (
    <>
      {/* Selected Delivery Method Display */}
      {selectedDeliveryMethod && (
        <div
          className="border-b"
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          {showSectionTitles && (
            <h3
              className="font-medium"
              style={{
                fontSize: '1rem',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: 'bold',
              }}
            >
              Método de envío seleccionado:
            </h3>
          )}
          <div
            className="font-semibold"
            style={{
              fontSize: '1rem',
              color: '#111827',
              marginBottom: '0.5rem',
            }}
          >
            {selectedDeliveryMethod}
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            {formatDeliveryDetails()}
          </div>
        </div>
      )}

      {/* Delivery Address Display */}
      <div
        className="border-b"
        style={{
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {showSectionTitles && (
          <h3
            className="font-medium"
            style={{
              fontSize: '1rem',
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: 'bold',
            }}
          >
            Dirección de entrega:
          </h3>
        )}
        <div
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            whiteSpace: 'pre-line',
            lineHeight: '1.5',
          }}
        >
          {formatAddress()}
        </div>
      </div>

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
              <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Condiciones de Compra
              </span>{' '}
              y entiendo la información sobre el uso de mis datos personales
              explicada en la{' '}
              <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Política de Privacidad
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Order Button */}
      {showConfirmButton && onConfirmOrder && (
        <button
          onClick={onConfirmOrder}
          disabled={showTerms && !hasAcceptedTerms}
          className="w-full font-bold"
          style={{
            backgroundColor:
              showTerms && !hasAcceptedTerms ? '#d1d5db' : '#000',
            color: showTerms && !hasAcceptedTerms ? '#9ca3af' : 'white',
            padding: '1rem',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor: showTerms && !hasAcceptedTerms ? 'not-allowed' : 'pointer',
            border: 'none',
            marginBottom: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          Confirmar pedido
        </button>
      )}

      {/* Back Button */}
      {showBackButton && onBackToDelivery && (
        <button
          onClick={onBackToDelivery}
          className="text-gray-600 hover:text-black transition-colors"
          style={{
            fontSize: '0.875rem',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'block',
            margin: '0 auto',
          }}
        >
          ← Volver a método de envío
        </button>
      )}
    </>
  );
};

export default OrderReviewSection;
