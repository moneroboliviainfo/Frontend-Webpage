import React from 'react';
import './OrderProgressIndicator.css';

interface OrderProgressIndicatorProps {
  status: string;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactElement;
  isActive: (status: string) => boolean;
}

const OrderProgressIndicator: React.FC<OrderProgressIndicatorProps> = ({
  status,
}) => {
  const steps: ProgressStep[] = [
    {
      id: 'ordered',
      label: 'Pedido',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      isActive: () => true, // Always active
    },
    {
      id: 'paid',
      label: 'Pagado',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      isActive: (status: string) => status === 'paid' || status === 'sent',
    },
    {
      id: 'sent',
      label: 'Enviado',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      isActive: (status: string) => status === 'sent',
    },
  ];

  const isLineActive = (stepIndex: number): boolean => {
    if (stepIndex >= steps.length - 1) return false;
    return steps[stepIndex + 1].isActive(status);
  };

  return (
    <div className="order-progress-container">
      <div className="order-progress-wrapper">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="order-progress-step">
              <div
                className={`order-progress-icon ${
                  step.isActive(status) ? 'active' : 'inactive'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`order-progress-label ${
                  step.isActive(status) ? 'active' : 'inactive'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`order-progress-line ${
                  isLineActive(index) ? 'active' : 'inactive'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressIndicator;
