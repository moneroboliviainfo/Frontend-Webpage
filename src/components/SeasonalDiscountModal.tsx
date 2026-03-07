'use client';

import React from 'react';
import './SeasonalDiscountModal.css';
import type { DismissReason } from '@/utils/seasonalDiscountStorage';

type RemainingTime = {
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  isOpen: boolean;
  description: string;
  remainingTime: RemainingTime;
  onDismiss: (reason: DismissReason) => void;
  onViewDiscounts: () => void;
};

export default function SeasonalDiscountModal({
  isOpen,
  description,
  remainingTime,
  onDismiss,
  onViewDiscounts,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="seasonal-discount-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Oferta de temporada"
    >
      <div className="seasonal-discount-modal">
        {/* Close button - X dismisses for 24h */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => onDismiss('dismissed')}
          className="seasonal-discount-close"
        >
          ✕
        </button>

        {/* Content */}
        <div className="seasonal-discount-content">
          {/* Badge */}
          <span className="seasonal-discount-badge">OFERTA LIMITADA</span>

          {/* Title */}
          <h2 className="seasonal-discount-title">
            ¡REBAJAS DE
            <br />
            TEMPORADA!
          </h2>

          {/* Description */}
          <p className="seasonal-discount-description">{description}</p>

          {/* Timer */}
          <div className="seasonal-discount-timer">
            {/* Hours */}
            <div className="seasonal-discount-time-unit">
              <div className="seasonal-discount-time-box">
                {remainingTime.hours}
              </div>
              <span className="seasonal-discount-time-label">HORAS</span>
            </div>

            <span className="seasonal-discount-separator">:</span>

            {/* Minutes */}
            <div className="seasonal-discount-time-unit">
              <div className="seasonal-discount-time-box">
                {remainingTime.minutes}
              </div>
              <span className="seasonal-discount-time-label">MINS</span>
            </div>

            <span className="seasonal-discount-separator">:</span>

            {/* Seconds */}
            <div className="seasonal-discount-time-unit">
              <div className="seasonal-discount-time-box seconds">
                {remainingTime.seconds}
              </div>
              <span className="seasonal-discount-time-label">SEGS</span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onViewDiscounts}
            className="seasonal-discount-cta"
          >
            VER DESCUENTOS
          </button>

          {/* Dismiss button - "later" dismisses for 2h */}
          <button
            type="button"
            onClick={() => onDismiss('later')}
            className="seasonal-discount-dismiss"
          >
            Quizás más tarde
          </button>
        </div>

        {/* Bottom gradient bar */}
        <div className="seasonal-discount-bottom-bar" />
      </div>
    </div>
  );
}
