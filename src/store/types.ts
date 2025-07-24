export interface CartItem {
  itemId: string;
  name: string;
  cost: number;
  quantity: number;
  src?: string;
  color: {
    colorId: string;
    name: string;
  };
  size: {
    sizeId: string;
    name: string;
  };
  totalCost: number; // always store with two decimals
}
