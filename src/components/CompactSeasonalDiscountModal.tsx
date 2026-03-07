'use client';

import React from 'react';
import './CompactSeasonalDiscountModal.css';
import type { DismissReason } from '@/utils/seasonalDiscountStorage';

type RemainingTime = {
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  isOpen: boolean;
  remainingTime: RemainingTime;
  onDismiss: (reason: DismissReason) => void;
  onViewDiscounts: () => void;
};

export default function CompactSeasonalDiscountModal({
  isOpen,
  remainingTime,
  onDismiss,
  onViewDiscounts,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="compact-seasonal-discount-overlay">
      <div className="compact-seasonal-discount-modal">
        {/* Close button - X dismisses for 2h */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => onDismiss('later')}
          className="compact-seasonal-discount-close"
        >
          ✕
        </button>

        {/* Content */}
        <div className="compact-seasonal-discount-content">
          {/* Label */}
          <div className="compact-seasonal-discount-label">¡ÚLTIMAS HORAS!</div>

          {/* Timer */}
          <div className="compact-seasonal-discount-timer">
            {remainingTime.hours}:{remainingTime.minutes}:
            {remainingTime.seconds}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => {
              onDismiss('later');
              onViewDiscounts();
            }}
            className="compact-seasonal-discount-cta"
          >
            VER
          </button>
        </div>

        {/* Bottom gradient bar */}
        <div className="compact-seasonal-discount-bottom-bar" />
      </div>
    </div>
  );
}
