'use client';
import React from 'react';

interface DeliveryMethodDisplayProps {
  deliveryMethod: string;
  country: string;
  price?: number;
  showTitle?: boolean;
  placeId?: number;
  serviceDescription?: string;
  arrivalEstimate?: string;
}

const DeliveryMethodDisplay: React.FC<DeliveryMethodDisplayProps> = ({
  deliveryMethod,
  country,
  price,
  showTitle = true,
  placeId,
  serviceDescription,
  arrivalEstimate,
}) => {
  const getDeliveryDescription = () => {
    if (country === 'Bolivia') {
      switch (deliveryMethod) {
        case 'Envío a terminal':
          return 'Recíbelo en 24 horas';
        case 'Envío a domicilio':
          if (placeId === 4) {
            return 'Recíbelo hoy mismo';
          }
          return 'Recíbelo en 48 horas';
        case 'Envío a provincia':
          if (placeId === 4) {
            return 'Recíbelo en 24 horas';
          }
          return 'Recíbelo en 72 horas';
        case 'Envío por avión':
          return 'Recógelo lo más pronto posible hasta su domicilio';
        default:
          return '';
      }
    } else {
      // For international shipments, prefer an explicit service description
      if (serviceDescription) return serviceDescription;
      return 'Tiempo calculado por FedEx (envío pagado por adelantado; no incluye impuestos ni aranceles)';
    }
  };

  const getPriceDisplay = () => {
    if (price !== undefined) {
      return `Bs. ${price.toFixed(2)}`;
    }

    if (country === 'Bolivia') {
      switch (deliveryMethod) {
        case 'Envío a terminal':
          return '27.99 €';
        case 'Envío a domicilio':
          return 'Bs. 50';
        case 'Envío a provincia':
          return 'Bs. 50';
        case 'Envío por avión':
          return 'Bs. 60';
        default:
          return '';
      }
    } else {
      return 'Costo calculado por FedEx (pagado por adelantado; no incluye impuestos ni aranceles)';
    }
  };

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
        {deliveryMethod}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
        }}
      >
        {getDeliveryDescription()}
      </div>
      {arrivalEstimate && (
        <div
          className="flex items-center"
          style={{
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: '#00856a',
            marginTop: '0.5rem',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          <span>{arrivalEstimate}</span>
        </div>
      )}
      <div
        className="font-semibold"
        style={{
          fontSize: '1rem',
          color: '#111827',
          marginTop: '0.25rem',
        }}
      >
        {getPriceDisplay()}
      </div>
    </div>
  );
};

export default DeliveryMethodDisplay;
