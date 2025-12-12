'use client';

import React, { useEffect, useState } from 'react';
import { API_URL, PAYMENT_VERIFICATION_INTERVAL } from '@/config/env';
import { clearCart } from '@/utils/cartStorage';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrImageBase64: string;
  orderId: number;
  onPaymentConfirmed: () => void;
  gloss?: string;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  qrImageBase64,
  orderId,
  onPaymentConfirmed,
  gloss,
}) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // QR countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onClose();
          // TODO: Handle timeout - cancel order
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  // Payment verification polling effect
  useEffect(() => {
    if (!isOpen || !orderId) {
      return;
    }

    const verifyPayment = async () => {
      try {
        const url = `${API_URL}payments/verify/${orderId}`;

        const response = await fetch(url);

        if (!response.ok) {
          console.error(
            'Payment verification failed:',
            response.status,
            response.statusText
          );
          return;
        }

        const data = await response.json();

        // Check if payment is complete (API returns true/false)
        if (data === true) {
          clearCart(); // Clear cart when payment is confirmed
          onPaymentConfirmed();
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    };

    // Call immediately
    verifyPayment();

    // Set up polling interval
    const pollingInterval = setInterval(
      verifyPayment,
      PAYMENT_VERIFICATION_INTERVAL
    );

    // Cleanup
    return () => {
      clearInterval(pollingInterval);
    };
  }, [isOpen, orderId, onPaymentConfirmed]);

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="bg-white rounded-lg relative"
        style={{
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-gray-100 rounded-full"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

        {/* Title */}
        <h2
          className="font-bold text-center"
          style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
        >
          Escanea el código QR
        </h2>

        {/* QR Code Image */}
        <div className="flex justify-center" style={{ marginBottom: '1.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${qrImageBase64}`}
            alt="QR Code"
            style={{
              width: '300px',
              height: '300px',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
        </div>

        {/* Gloss - if provided */}
        {gloss && gloss.trim() && (
          <div
            className="text-center"
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
            }}
          >
            <p
              style={{
                color: '#374151',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {gloss}
            </p>
          </div>
        )}

        {/* Timer */}
        <div className="text-center" style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Tiempo restante
          </p>
          <p
            className="font-bold"
            style={{
              fontSize: '1.5rem',
              color: timeLeft < 60 ? '#ef4444' : '#000',
            }}
          >
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Instructions */}
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <p
            className="font-medium"
            style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
          >
            Instrucciones:
          </p>
          <ol style={{ fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>
              Abre tu aplicación de banca
            </li>
            <li style={{ marginBottom: '0.25rem' }}>Escanea este código QR</li>
            <li style={{ marginBottom: '0.25rem' }}>Confirma el pago</li>
            <li>Espera la confirmación automática</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRPaymentModal;
