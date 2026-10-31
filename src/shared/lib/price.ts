export type ActiveDiscount = {
  value?: number | null;
  isActive?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
};

export function isDiscountActive(
  discount: ActiveDiscount | null | undefined,
): boolean {
  if (!discount || !discount.isActive || !discount.value || discount.value <= 0)
    return false;
  const now = new Date();
  if (discount.startDate && new Date(discount.startDate) > now) return false;
  if (discount.endDate && new Date(discount.endDate) < now) return false;
  return true;
}

export type DiscountShape = number | ActiveDiscount | null | undefined;

export type PriceCalculation = {
  price: number; // rounded original price (integer)
  discountPercent: number; // percentage applied (0-100)
  finalPrice: number; // rounded final price (integer)
};

export function calculatePrice(
  priceInput: string | number,
  discount: DiscountShape,
): PriceCalculation {
  const priceNum = Math.round(Number.parseFloat(String(priceInput || 0)) || 0);

  let percent = 0;

  if (typeof discount === 'number') {
    percent = discount;
  } else if (discount && typeof discount === 'object') {
    if (typeof discount.value === 'number') {
      if (isDiscountActive(discount)) percent = discount.value;
    } else if (
      'percentage' in discount &&
      typeof (discount as { percentage?: number }).percentage === 'number'
    ) {
      percent = (discount as { percentage?: number }).percentage!;
    }
  }

  const final = Math.round(priceNum * (1 - percent / 100));

  return {
    price: priceNum,
    discountPercent: percent || 0,
    finalPrice: final,
  };
}
