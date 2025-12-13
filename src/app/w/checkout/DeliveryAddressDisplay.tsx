'use client';
import React from 'react';

interface DeliveryAddressDisplayProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    departamento?: string;
    cityProvince?: string;
    detailedAddress?: string;
    city?: string;
    streetNumber?: string;
    postalCode?: string;
  };
  country: string;
  showTitle?: boolean;
}

const DeliveryAddressDisplay: React.FC<DeliveryAddressDisplayProps> = ({
  formData,
  country,
  showTitle = true,
}) => {
  const formatAddress = () => {
    const addressParts = [
      formData.name,
      formData.phone ? `${formData.countryCode} ${formData.phone}` : '',
      formData.email,
      '', // Empty line for spacing
    ];

    if (country === 'Bolivia') {
      addressParts.push(
        formData.detailedAddress || '',
        formData.cityProvince || '',
        formData.departamento || '',
        country
      );
    } else {
      addressParts.push(
        formData.streetNumber || '',
        formData.city || '',
        formData.postalCode || '',
        country
      );
    }

    return addressParts.filter((part) => part.trim() !== '').join('\n');
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
  );
};

export default DeliveryAddressDisplay;
