import React from 'react';

interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  price: string;
}

interface DeliveryOptionsProps {
  selectedCountry: string;
  onDeliveryOptionSelect: (option: string) => void;
  isMobile?: boolean;
}

export const DeliveryOptionsSection: React.FC<DeliveryOptionsProps> = ({
  selectedCountry,
  onDeliveryOptionSelect,
  isMobile = false,
}) => {
  const deliveryOptions =
    selectedCountry === 'Bolivia'
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
      : [
          {
            id: 'dhl',
            title: 'Envío por DHL',
            description: 'Tiempo determinado por DHL',
            price: 'Costo determinado por DHL cuando lo recibas',
          },
        ];

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
        onClick={() => onDeliveryOptionSelect(option.title)}
        className={className}
        style={containerStyle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
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
            <div
              className="font-bold"
              style={{ fontSize: '1rem', color: '#374151' }}
            >
              {option.price}
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
    <div style={isMobile ? {} : { display: 'grid', gap: '1rem' }}>
      {deliveryOptions.map(renderDeliveryOption)}
    </div>
  );
};
