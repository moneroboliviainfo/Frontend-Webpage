'use client';

import { useRouter } from 'next/navigation';
import SeasonalDiscountModal from '@/components/SeasonalDiscountModal';
import { useSeasonalDiscountModal } from '@/hooks/useSeasonalDiscountModal';
import type { DismissReason } from '@/utils/seasonalDiscountStorage';

type Props = {
  gender: string;
};

export default function SeasonalDiscountModalGate({ gender }: Props) {
  const router = useRouter();
  const { discount, isOpen, remainingTime, handleDismissal, closeModal } =
    useSeasonalDiscountModal();

  if (!discount) return null;

  const handleDismiss = (reason: DismissReason) => {
    handleDismissal(reason);
  };

  return (
    <SeasonalDiscountModal
      isOpen={isOpen}
      description={discount.description}
      remainingTime={remainingTime}
      onDismiss={handleDismiss}
      onViewDiscounts={() => {
        // Mark as dismissed when user clicks to see discounts (2h cooldown)
        handleDismissal('later');
        router.push(`/${gender}/discounts`);
      }}
    />
  );
}
