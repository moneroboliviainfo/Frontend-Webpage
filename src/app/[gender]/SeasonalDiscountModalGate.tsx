'use client';

import { useRouter } from 'next/navigation';
import SeasonalDiscountModal from '@/components/SeasonalDiscountModal';
import { useSeasonalDiscountModal } from '@/hooks/useSeasonalDiscountModal';

type Props = {
  gender: string;
};

export default function SeasonalDiscountModalGate({ gender }: Props) {
  const router = useRouter();
  const { discount, isOpen, remainingTime, closeModal } =
    useSeasonalDiscountModal();

  if (!discount) return null;

  return (
    <SeasonalDiscountModal
      isOpen={isOpen}
      description={discount.description}
      remainingTime={remainingTime}
      onClose={closeModal}
      onViewDiscounts={() => {
        closeModal();
        router.push(`/${gender}/discounts`);
      }}
    />
  );
}
