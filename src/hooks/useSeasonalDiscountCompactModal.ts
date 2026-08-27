'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/config/env';
import { DISCOUNT_TYPE_SEASONAL } from '@/constants/discounts';
import type { Discount } from '@/types/discount';
import {
  shouldShowSeasonalModal,
  setSeasonalDiscountDismissal,
  type DismissReason,
} from '@/utils/seasonalDiscountStorage';

type RemainingTime = {
  hours: string;
  minutes: string;
  seconds: string;
};

const EMPTY_TIME: RemainingTime = {
  hours: '00',
  minutes: '00',
  seconds: '00',
};

const isValidSeasonalDiscount = (discount: Discount, now: Date) => {
  if (discount.discountType !== DISCOUNT_TYPE_SEASONAL) return false;
  if (!discount.isActive) return false;

  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

  return now >= startDate && now <= endDate;
};

export const useSeasonalDiscountCompactModal = () => {
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    let isMounted = true;

    const fetchDiscounts = async () => {
      // Check if modal should be shown based on dismissal history
      if (!shouldShowSeasonalModal('compactModal')) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}web-page/discounts`);
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (!Array.isArray(data)) return;

        const currentDate = new Date();
        const firstValid = (data as Discount[]).find((discountItem) =>
          isValidSeasonalDiscount(discountItem, currentDate),
        );

        if (isMounted && firstValid) {
          setDiscount(firstValid);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching seasonal discounts:', error);
      }
    };

    fetchDiscounts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !discount) return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen, discount]);

  useEffect(() => {
    if (!discount || !isOpen) return;

    const endDate = new Date(discount.endDate);
    if (!isNaN(endDate.getTime()) && now > endDate) {
      setIsOpen(false);
    }
  }, [discount, isOpen, now]);

  const remainingTime = useMemo<RemainingTime>(() => {
    if (!discount) return EMPTY_TIME;

    const endDate = new Date(discount.endDate);
    if (isNaN(endDate.getTime())) return EMPTY_TIME;

    const diffMs = Math.max(0, endDate.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  }, [discount, now]);

  const handleDismissal = useCallback(
    (reason: DismissReason) => {
      if (!discount) return;

      setSeasonalDiscountDismissal('compactModal', String(discount.id), reason);
      setIsOpen(false);
    },
    [discount],
  );

  return {
    discount,
    isOpen,
    remainingTime,
    handleDismissal,
  };
};
