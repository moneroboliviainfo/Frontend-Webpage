'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenderStorage } from '@/utils/genderStorage';
import { API_URL, PAYMENT_VERIFICATION_INTERVAL } from '@/config/env';
import { clearCart } from '@/utils/cartStorage';
import './QRPaymentModal.css';

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
  const DURATION_SECONDS = 10 * 60; // 10 minutes
  const [timeLeft, setTimeLeft] = useState<number>(DURATION_SECONDS);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  // Initialize end timestamp when modal opens (or orderId changes).
  useEffect(() => {
    if (!isOpen) {
      setEndTimestamp(null);
      setTimeLeft(DURATION_SECONDS);
      return;
    }

    // Set a new end timestamp for the countdown
    const now = Date.now();
    setEndTimestamp(now + DURATION_SECONDS * 1000);
    // Also set immediate timeLeft based on now
    setTimeLeft(DURATION_SECONDS);
  }, [isOpen, orderId]);

  // QR countdown timer effect that compares current time to the end timestamp.
  useEffect(() => {
    if (!isOpen || !endTimestamp) return;

    const tick = () => {
      const secs = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
      setTimeLeft(secs);
    };

    // run immediately and then every second — using Date.now keeps it accurate
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, endTimestamp]);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const verifyPayment = async () => {
      try {
        const url = `${API_URL}payments/verify/${orderId}`;

        const response = await fetch(url);

        if (!response.ok) {
          console.error(
            'Payment verification failed:',
            response.status,
            response.statusText,
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
      PAYMENT_VERIFICATION_INTERVAL,
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

  const router = useRouter();

  // Redirect to last gender page when timer expires
  useEffect(() => {
    if (!isOpen) return;
    if (timeLeft <= 0) {
      const lastGender = GenderStorage.getGender();
      try {
        router.push(`/${lastGender}`);
      } catch (e) {
        // ignore
      }
    }
  }, [timeLeft, isOpen, router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* QR Code Image */}
        <div className="flex justify-center" style={{ marginBottom: '1rem' }}>
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

        {/* Download button (web) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <button
            aria-label="Descargar código QR"
            className="qr-payment-modal__download-btn"
            onClick={() => {
              try {
                const base64 = qrImageBase64;
                if (!base64) return;
                const binary = atob(base64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([bytes.buffer], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `qr-${orderId || Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);

                // Show local success toast (cannot detect actual OS download success)
                setShowDownloadToast(true);
                setTimeout(() => setShowDownloadToast(false), 3000);
              } catch (e) {
                console.error('Download error', e);
              }
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginRight: '0.5rem',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
              aria-hidden="true"
            >
              <path
                d="M12 5v10"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11l4 4 4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 19h14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Descargar QR
          </button>
        </div>

        {/* Gloss - if provided */}
        {gloss && gloss.trim() && (
          <div
            className="text-center"
            style={{
              marginBottom: '1rem',
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
        <div className="text-center" style={{ marginBottom: '1rem' }}>
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

        {/* Instructions + loader (adapted from native layout) */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="qr-payment-modal__block">
            <div className="qr-payment-modal__info">
              <div className="qr-payment-modal__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
                    stroke="#0ea5a4"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 8v5l3 3"
                    stroke="#0ea5a4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="qr-payment-modal__text">
                Escanea el código QR desde tu Banco de confianza para completar
                el pago
              </div>
            </div>

            <div className="qr-payment-modal__progress">
              <div className="qr-payment-modal__track">
                <div className="qr-payment-modal__bar" />
              </div>
              <div className="qr-payment-modal__caption">
                Esperando confirmación de pago...
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Download success toast */}
      {showDownloadToast && (
        <div className="qr-payment-modal__toast">
          <span className="text-sm">Imagen descargada</span>
        </div>
      )}
    </div>
  );
};

export default QRPaymentModal;
