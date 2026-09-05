'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenderStorage } from '@/utils/genderStorage';
import { QR_PAYMENT_DURATION_MINUTES } from '@/constants/qrPayment';
import {
  extractCardFirst4,
  generateDeviceFingerprintId,
  parseCardExpiry,
  submitCardPaymentToCybersource,
} from '@/utils/cybersourcePayment';
import {
  getCybersourceCheckoutParams,
  type CybersourceBilling,
} from '@/services/cybersourceService';
import './CardPaymentModal.css';

const VisaLogo: React.FC = () => (
  <img
    src="/logos/visa.png"
    alt="Visa"
    style={{ height: '38px', width: 'auto' }}
  />
);

const MastercardLogo: React.FC = () => (
  <img
    src="/logos/master_card.png"
    alt="Mastercard"
    style={{ height: '24px', width: 'auto' }}
  />
);

interface CardPaymentModalProps {
  isOpen: boolean;
  orderId: number;
  billing: CybersourceBilling;
  onBeforeRedirect?: () => void;
}

interface CardFormErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardHolderName?: string;
}

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  orderId,
  billing,
  onBeforeRedirect,
}) => {
  const router = useRouter();
  const DURATION_SECONDS = QR_PAYMENT_DURATION_MINUTES * 60;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(DURATION_SECONDS);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

  // Reset the reservation countdown whenever the modal opens for a new order
  useEffect(() => {
    if (!isOpen) {
      setEndTimestamp(null);
      setTimeLeft(DURATION_SECONDS);
      return;
    }
    const now = Date.now();
    setEndTimestamp(now + DURATION_SECONDS * 1000);
    setTimeLeft(DURATION_SECONDS);
  }, [isOpen, orderId, DURATION_SECONDS]);

  useEffect(() => {
    if (!isOpen || !endTimestamp) return;

    const tick = () => {
      const secs = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
      setTimeLeft(secs);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, endTimestamp]);

  // Redirect away once the inventory reservation window expires, same behavior as the QR modal
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

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining
      .toString()
      .padStart(2, '0')}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 19);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(grouped);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4); // MM/YY only, backend expects the short year
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3));
  };

  const validate = (): boolean => {
    const newErrors: CardFormErrors = {};
    const digits = cardNumber.replace(/\s/g, '');

    if (digits.length < 12) {
      newErrors.cardNumber = 'Ingresa un número de tarjeta válido';
    }
    if (!parseCardExpiry(expiry)) {
      newErrors.expiry = 'Formato inválido (MM/AA)';
    }
    if (cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    if (!cardHolderName.trim()) {
      newErrors.cardHolderName = 'El titular de la tarjeta es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const parsedExpiry = parseCardExpiry(expiry);
      if (!parsedExpiry) throw new Error('Fecha de vencimiento inválida');

      const cardFirst4 = extractCardFirst4(cardNumber);
      const deviceFingerprintId = generateDeviceFingerprintId();

      const checkoutData = await getCybersourceCheckoutParams({
        orderId,
        cardFirst4,
        deviceFingerprintId,
        billing,
      });

      onBeforeRedirect?.();

      submitCardPaymentToCybersource(
        checkoutData,
        deviceFingerprintId,
        cardNumber,
        parsedExpiry.month,
        parsedExpiry.year,
        cvv,
      );
      // Browser is navigating to Cybersource now; keep the button disabled while that happens
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo procesar el pago. Inténtalo nuevamente.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="card-payment-modal">
        <h2 className="card-payment-modal__title">Introducir tarjeta</h2>

        <div className="card-payment-modal__field">
          <label className="card-payment-modal__label">
            Número de la tarjeta
          </label>
          <div className="card-payment-modal__input-wrapper">
            <svg
              className="card-payment-modal__input-icon"
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
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              className={`card-payment-modal__input ${
                errors.cardNumber ? 'card-payment-modal__input--error' : ''
              }`}
              maxLength={23}
            />
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <VisaLogo />
              <MastercardLogo />
            </div>
          </div>
          <div className="card-payment-modal__counter">
            {cardNumber.replace(/\s/g, '').length}/19
          </div>
          {errors.cardNumber && (
            <p className="card-payment-modal__error-text">
              {errors.cardNumber}
            </p>
          )}
        </div>

        <div className="card-payment-modal__row">
          <div className="card-payment-modal__field">
            <label className="card-payment-modal__label">Válida hasta</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/AA"
              maxLength={5}
              className={`card-payment-modal__input ${
                errors.expiry ? 'card-payment-modal__input--error' : ''
              }`}
            />
            {errors.expiry && (
              <p className="card-payment-modal__error-text">{errors.expiry}</p>
            )}
          </div>

          <div className="card-payment-modal__field card-payment-modal__field--cvv">
            <label className="card-payment-modal__label">CVV</label>
            <div className="card-payment-modal__input-wrapper">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                className={`card-payment-modal__input ${
                  errors.cvv ? 'card-payment-modal__input--error' : ''
                }`}
              />
            </div>
            <div className="card-payment-modal__counter">{cvv.length}/3</div>
            {errors.cvv && (
              <p className="card-payment-modal__error-text">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="card-payment-modal__field">
          <label className="card-payment-modal__label">
            Titular de tarjeta
          </label>
          <input
            type="text"
            autoComplete="cc-name"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Nombre como aparece en la tarjeta"
            className={`card-payment-modal__input ${
              errors.cardHolderName ? 'card-payment-modal__input--error' : ''
            }`}
          />
          {errors.cardHolderName && (
            <p className="card-payment-modal__error-text">
              {errors.cardHolderName}
            </p>
          )}
        </div>

        {submitError && (
          <div className="card-payment-modal__submit-error">{submitError}</div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={isSubmitting}
          className="card-payment-modal__pay-btn"
        >
          {isSubmitting ? 'Procesando...' : 'Pagar'}
        </button>

        <p className="card-payment-modal__timer">
          Tu orden se cancelará automáticamente en {formatTime(timeLeft)} si no
          completas el pago
        </p>
      </div>
    </div>
  );
};

export default CardPaymentModal;
