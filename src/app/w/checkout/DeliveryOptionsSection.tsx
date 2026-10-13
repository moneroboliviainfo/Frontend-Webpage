import React from 'react';
import { formatBs } from '@/shared/lib/formatCurrency';
import Image from 'next/image';
import type { FedexService } from '@/store/checkoutSlice';
import { formatFedexArrivalEstimate } from '@/utils/fedexArrivalEstimate';
import FedexCustomsDisclaimer from './FedexCustomsDisclaimer';

interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  price: string;
  arrivalEstimate?: string;
}

interface Shipment {
  id: number;
  name: string;
  price: string;
  enabled: boolean;
}

interface DeliveryOptionsProps {
  selectedCountry: string;
  onDeliveryOptionSelect: (shipmentId: number, shipmentName: string) => void;
  isMobile?: boolean;
  shipments?: Shipment[];
  fedexServices?: FedexService[];
  onFedexServiceSelect?: (service: FedexService) => void;
}

export const DeliveryOptionsSection: React.FC<DeliveryOptionsProps> = ({
  selectedCountry,
  onDeliveryOptionSelect,
  isMobile = false,
  shipments = [],
  fedexServices = [],
  onFedexServiceSelect,
}) => {
  const isBolivia = selectedCountry === 'Bolivia';

  // Use API shipments if available, otherwise use fallback options
  const deliveryOptions =
    isBolivia && shipments.length > 0
      ? shipments
          .filter((shipment) => shipment.enabled)
          .map((shipment) => ({
            id: shipment.id.toString(),
            title: shipment.name,
            description: 'Disponible',
            price: formatBs(shipment.price),
          }))
      : isBolivia
        ? [
            {
              id: 'terminal',
              title: 'Envío a terminal',
              description: 'Recibelo en 24 horas',
              price: 'Bs. 30',
            },
            {
              id: 'domicilio',
              title: 'Envío a domicilio',
              description: 'Recibelo en 48 horas',
              price: 'Bs. 50',
            },
            {
              id: 'provincia',
              title: 'Envío a provincia',
              description: 'Recibelo en 72 horas',
              price: 'Bs. 50',
            },
            {
              id: 'avion',
              title: 'Envío por avión',
              description: 'Recibelo lo más pronto posible hasta su domicilio',
              price: 'Bs. 60',
            },
          ]
        : fedexServices.length > 0
          ? fedexServices.map((service) => ({
              id: service.code,
              title: service.serviceName,
              description: service.description,
              price: formatBs(service.amountBOB, 2),
              arrivalEstimate: formatFedexArrivalEstimate(service),
            }))
          : [
              {
                id: 'fedex',
                title: 'Envío internacional (FedEx)',
                description:
                  'Tiempo estimado por FedEx (costo calculado; pagado por adelantado; no incluye impuestos ni aranceles)',
                price: 'Costo calculado por FedEx (pagado por adelantado)',
              },
            ];

  const handleOptionSelect = (option: DeliveryOption) => {
    if (!isBolivia && fedexServices.length > 0) {
      const service = fedexServices.find((s) => s.code === option.id);
      if (service) {
        onFedexServiceSelect?.(service);
      }
      return;
    }
    onDeliveryOptionSelect(Number(option.id), option.title);
  };

  const renderDeliveryOption = (option: DeliveryOption) => {
    const Component = isMobile ? 'div' : 'button';
    const baseStyles = {
      padding: '1rem',
      border: '1px solid #e5e7eb',
      marginBottom: isMobile ? '1rem' : '0',
    };

    const className = isMobile
      ? 'border rounded-lg hover:bg-gray-50 cursor-pointer'
      : 'w-full border rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer';

    const containerStyle = isMobile
      ? baseStyles
      : { ...baseStyles, marginBottom: '0' };

    return (
      <Component
        key={option.id}
        onClick={() => handleOptionSelect(option)}
        className={className}
        style={containerStyle}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-start"
            style={{ gap: '1rem', minWidth: 0 }}
          >
            {!isBolivia && (
              <div
                style={{
                  width: '68px',
                  height: '40px',
                  flex: '0 0 68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid #fed7aa',
                  borderRadius: '4px',
                  backgroundColor: '#fffaf5',
                }}
              >
                <Image
                  src="/logos/Fedex-logo.png"
                  alt="FedEx"
                  width={120}
                  height={48}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div
                className="font-bold"
                style={{
                  fontSize: '1rem',
                  color: '#374151',
                  marginBottom: '0.25rem',
                }}
              >
                {option.title}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {option.description}
              </div>
              {option.arrivalEstimate && (
                <div
                  className="flex items-center"
                  style={{
                    gap: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#00856a',
                    marginBottom: '0.25rem',
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
                  <span>{option.arrivalEstimate}</span>
                </div>
              )}
              <div
                className="font-bold"
                style={{ fontSize: '1rem', color: '#374151' }}
              >
                {option.price}
              </div>
            </div>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: '#9ca3af' }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Component>
    );
  };

  return (
    <>
      <div style={isMobile ? {} : { display: 'grid', gap: '1rem' }}>
        {deliveryOptions.map(renderDeliveryOption)}
      </div>
      {!isMobile && !isBolivia && fedexServices.length > 0 && (
        <FedexCustomsDisclaimer position="fixed" />
      )}
    </>
  );
};
