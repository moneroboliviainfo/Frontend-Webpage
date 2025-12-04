// Cart item types for local storage
export interface CartItem {
  // Product identification
  productId: number;
  productName: string;
  variantId: number;

  // Pricing
  price: number;
  discount: number;
  finalPrice: number;

  // Selection details
  sizeName: string;
  sizeId?: number;
  colorName: string;
  colorCode: string;

  // Visual
  imageUrl: string;

  // Quantity
  quantity: number;

  // Timestamp for ordering
  addedAt: number;
}

export interface Cart {
  items: CartItem[];
  version: number;
}
