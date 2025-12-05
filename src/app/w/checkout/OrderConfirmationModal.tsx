'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import OrderReviewSection from './OrderReviewSection';
import { useAppSelector } from '@/store/hooks';
import {
  selectSelectedShipment,
  selectAddressId,
  selectCartToken,
  selectCheckoutCartItems,
  selectRepriceData,
} from '@/store/checkoutSlice';
import { createOrder, generateQR } from '@/utils/orderService';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToDelivery: () => void;
  selectedCountry: string;
  selectedDeliveryMethod: string;
  formData: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    departamento: string;
    cityProvince: string;
    detailedAddress: string;
    city: string;
    streetNumber: string;
    postalCode: string;
  };
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onBackToDelivery,
  selectedCountry,
  selectedDeliveryMethod,
  formData,
}) => {
  const selectedShipment = useAppSelector(selectSelectedShipment);
  const addressId = useAppSelector(selectAddressId);
  const cartToken = useAppSelector(selectCartToken);
  const cartItems = useAppSelector(selectCheckoutCartItems);
  const repriceData = useAppSelector(selectRepriceData);

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [qrImageBase64, setQrImageBase64] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  const handlePayOrder = async () => {
    if (!hasAcceptedTerms) return;
    if (!selectedShipment || !addressId || !cartToken) {
      setOrderError('Missing required order information. Please try again.');
      return;
    }

    try {
      setIsCreatingOrder(true);
      setOrderError('');

      // Step 1: Create the order
      const orderResponse = await createOrder({
        items: cartToken,
        shipment: selectedShipment.id,
        address: addressId,
      });

      // Step 2: Generate QR code
      const qrResponse = await generateQR(orderResponse.id);

      // Step 3: Show QR payment modal
      setQrImageBase64(qrResponse.qr);
      setShowQRPayment(true);
      setTimeLeft(15 * 60); // Reset timer to 15 minutes
    } catch (error) {
      console.error('Error creating order or generating QR:', error);
      setOrderError(
        error instanceof Error
          ? error.message
          : 'Unable to create order. Please try again.'
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Countdown timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showQRPayment && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setShowQRPayment(false);
            // TODO: Handle timeout - cancel order
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRPayment, timeLeft]);

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
      className="fixed inset-0 bg-white z-50 flex flex-col"
      style={{
        paddingTop: 'var(--nav-height, 60px)',
      }}
    >
      {/* Modal Top Bar */}
      <div
        className="fixed top-0 left-0 right-0 bg-white flex items-center border-b z-50"
        style={{
          height: 'var(--nav-height, 60px)',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 1rem',
        }}
      >
        {/* Back Arrow */}
        <button
          onClick={onBackToDelivery}
          className="flex items-center justify-center hover:bg-gray-100 rounded-full"
          style={{
            width: '40px',
            height: '40px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Title */}
        <h2
          className="font-semibold flex-1"
          style={{ fontSize: '1.1rem', marginLeft: '1rem' }}
        >
          Por favor revisa tu orden
        </h2>

        {/* Empty space for balance */}
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Modal Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '1.5rem', paddingBottom: '12rem' }}
      >
        {/* Items Count */}
        <div
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1rem',
          }}
        >
          {cartItems.length} prendas
        </div>

        {/* Cart Items - Horizontal Scrollable */}
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            marginBottom: '2rem',
            scrollSnapType: 'x mandatory',
          }}
        >
          {cartItems.map((item) => (
            <div
              key={item.variantId}
              className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: '120px',
                height: '120px',
                scrollSnapAlign: 'start',
                position: 'relative',
                backgroundColor: '#f3f4f6',
              }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '0.5rem',
                  }}
                >
                  {item.productName}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Review Section - Delivery Method and Address */}
        <OrderReviewSection
          selectedDeliveryMethod={selectedDeliveryMethod}
          selectedCountry={selectedCountry}
          formData={formData}
          showConfirmButton={false}
          showBackButton={false}
          showSectionTitles={false}
        />

        {/* Payment Method */}
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
      </div>

      {/* Fixed Bottom Section with Terms and Cost Summary */}
      {/* Fixed Bottom Section with Terms and Cost Summary */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white"
        style={{
          borderTop: '1px solid #e5e7eb',
          zIndex: 40,
        }}
      >
        {/* Terms and Conditions */}
        <div
          style={{
            padding: '1rem 1rem 0.5rem 1rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div
            className="flex items-start"
            style={{
              gap: '0.75rem',
            }}
          >
            <button
              onClick={() => setHasAcceptedTerms(!hasAcceptedTerms)}
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

        {/* Cost Summary */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div className="flex justify-between items-center">
            <span
              className="font-semibold"
              style={{
                fontSize: '1.125rem',
                color: '#111827',
              }}
            >
              Total
            </span>
            <div className="flex items-center" style={{ gap: '0.5rem' }}>
              <span
                className="font-semibold"
                style={{
                  fontSize: '1.125rem',
                  color: '#111827',
                }}
              >
                Bs.{' '}
                {repriceData
                  ? (
                      parseFloat(repriceData.total) +
                      (selectedShipment
                        ? parseFloat(selectedShipment.price)
                        : 0)
                    ).toFixed(2)
                  : '0.00'}
              </span>
              <button
                className="flex items-center justify-center hover:bg-gray-100 rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: '#374151' }}
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {orderError && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              marginBottom: '1rem',
            }}
          >
            <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
              {orderError}
            </p>
          </div>
        )}

        {/* Pay Button */}
        <div style={{ padding: '1rem' }}>
          <button
            onClick={handlePayOrder}
            disabled={!hasAcceptedTerms || isCreatingOrder}
            className="w-full font-bold flex items-center justify-center"
            style={{
              backgroundColor:
                hasAcceptedTerms && !isCreatingOrder ? '#000' : '#d1d5db',
              color: hasAcceptedTerms && !isCreatingOrder ? 'white' : '#9ca3af',
              padding: '1rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              cursor:
                hasAcceptedTerms && !isCreatingOrder
                  ? 'pointer'
                  : 'not-allowed',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isCreatingOrder ? (
              <>
                <svg
                  className="animate-spin"
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '0.5rem',
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando orden...
              </>
            ) : (
              'Generar QR y pagar orden'
            )}
          </button>
        </div>
      </div>

      {/* QR Payment Popup */}
      {showQRPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 60 }}
        >
          <div
            className="bg-white rounded-lg flex flex-col items-center"
            style={{
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '80vh',
            }}
          >
            {/* Countdown Timer */}
            <div
              className="font-bold text-center"
              style={{
                fontSize: '2rem',
                color: timeLeft < 300 ? '#ef4444' : '#374151', // Red if less than 5 minutes
                marginBottom: '2rem',
              }}
            >
              {formatTime(timeLeft)}
            </div>

            {/* QR Code */}
            <div
              className="flex items-center justify-center bg-white"
              style={{
                width: '250px',
                height: '250px',
                marginBottom: '1.5rem',
              }}
            >
              {qrImageBase64 ? (
                <Image
                  src={`data:image/png;base64,${qrImageBase64}`}
                  alt="QR Code for Payment"
                  width={250}
                  height={250}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="animate-spin"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: '#3b82f6', margin: '0 auto' }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '1rem',
                    }}
                  >
                    Cargando QR...
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            <div className="text-center">
              <div
                className="font-medium"
                style={{
                  fontSize: '1.125rem',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Esperando el pago...
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                }}
              >
                Serás redireccionado cuando se reciba el pago
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setShowQRPayment(false)}
              className="border border-gray-300 rounded-lg hover:bg-gray-50"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                color: '#374151',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationModal;
