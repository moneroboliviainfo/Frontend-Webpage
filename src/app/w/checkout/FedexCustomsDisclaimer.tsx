import React from 'react';

interface FedexCustomsDisclaimerProps {
  position?: 'fixed' | 'inline';
}

const FedexCustomsDisclaimer: React.FC<FedexCustomsDisclaimerProps> = ({
  position = 'inline',
}) => (
  <div
    role="note"
    style={{
      ...(position === 'fixed'
        ? {
            position: 'fixed',
            left: '50%',
            bottom: '1rem',
            transform: 'translateX(-50%)',
            width: 'min(740px, calc(100vw - 2rem))',
            zIndex: 35,
          }
        : {}),
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      boxSizing: 'border-box',
      padding: '0.875rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      color: '#6b7280',
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{ flex: '0 0 18px', marginTop: '1px' }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
    <p style={{ margin: 0 }}>
      <strong style={{ color: '#374151' }}>
        Nota sobre aduanas e importación:
      </strong>{' '}
      La tarifa seleccionada cubre exclusivamente el transporte internacional
      hasta el país de destino. No incluye aranceles aduaneros, tarifas de
      importación ni impuestos locales que puedan ser determinados y cobrados
      por las autoridades aduaneras pertinentes al ingresar el paquete.
    </p>
  </div>
);

export default FedexCustomsDisclaimer;
