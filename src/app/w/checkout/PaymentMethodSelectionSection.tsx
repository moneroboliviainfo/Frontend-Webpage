import React from 'react';

export type PaymentMethodId = 'qr' | 'card';

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  icon: React.ReactNode;
}

interface PaymentMethodSelectionSectionProps {
  onSelect: (method: PaymentMethodId) => void;
  isMobile?: boolean;
}

const QrIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
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
);

const CardIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { id: 'qr', label: 'Código QR', icon: <QrIcon /> },
  { id: 'card', label: 'Tarjeta', icon: <CardIcon /> },
];

export const PaymentMethodSelectionSection: React.FC<
  PaymentMethodSelectionSectionProps
> = ({ onSelect, isMobile = false }) => {
  return (
    <div className={isMobile ? 'payment-method-list' : 'payment-method-grid'}>
      {PAYMENT_METHOD_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className="payment-method-option"
        >
          <span className="payment-method-option__label">{option.label}</span>
          <span className="payment-method-option__actions">
            <span className="payment-method-option__icon">{option.icon}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodSelectionSection;
