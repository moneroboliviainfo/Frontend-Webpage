'use client';

import { useRouter } from 'next/navigation';
import CompactSeasonalDiscountModal from '@/components/CompactSeasonalDiscountModal';
import { useSeasonalDiscountCompactModal } from '@/hooks/useSeasonalDiscountCompactModal';
import type { DismissReason } from '@/utils/seasonalDiscountStorage';

type Props = {
  gender?: string;
};

export default function CompactSeasonalDiscountModalGate({ gender }: Props) {
  const router = useRouter();
  const { discount, isOpen, remainingTime, handleDismissal } =
    useSeasonalDiscountCompactModal();

  if (!discount) return null;

  const handleDismiss = (reason: DismissReason) => {
    handleDismissal(reason);
  };

  const handleViewDiscounts = () => {
    if (gender) {
      router.push(`/${gender}/discounts`);
    } else {
      router.push('/discounts');
    }
  };

  return (
    <CompactSeasonalDiscountModal
      isOpen={isOpen}
      remainingTime={remainingTime}
      onDismiss={handleDismiss}
      onViewDiscounts={handleViewDiscounts}
    />
  );
}
