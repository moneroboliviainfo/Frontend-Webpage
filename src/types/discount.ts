export interface Discount {
  id: number;
  description: string;
  discountType: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  value: number;
  createdAt: string;
}
