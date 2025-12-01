export type DiscountShape =
  | number
  | {
      value?: number;
      isActive?: boolean;
      percentage?: number;
    }
  | null
  | undefined;

export type PriceCalculation = {
  price: number; // rounded original price (integer)
  discountPercent: number; // percentage applied (0-100)
  finalPrice: number; // rounded final price (integer)
};

export function calculatePrice(
  priceInput: string | number,
  discount: DiscountShape
): PriceCalculation {
  const priceNum = Math.round(Number.parseFloat(String(priceInput || 0)) || 0);

  let percent = 0;

  if (typeof discount === 'number') {
    percent = discount;
  } else if (discount && typeof discount === 'object') {
    const d = discount as {
      value?: number;
      isActive?: boolean;
      percentage?: number;
    };
    if (typeof d.value === 'number') {
      if (d.isActive) percent = d.value;
    } else if (typeof d.percentage === 'number') {
      percent = d.percentage;
    }
  }

  const final = Math.round(priceNum * (1 - percent / 100));

  return {
    price: priceNum,
    discountPercent: percent || 0,
    finalPrice: final,
  };
}
