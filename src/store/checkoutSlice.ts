import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { CartItem } from '@/types/cart';

export interface Shipment {
  id: number;
  name: string;
  price: string;
  enabled: boolean;
}

export interface Place {
  id: number;
  place: string;
  shipments: Shipment[];
}

export interface RepriceData {
  items: Array<{
    variantId: number;
    quantity: number;
    unit_price: number;
    discountValue: number;
    totalPrice: string;
  }>;
  total: string;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  // Billing fields
  billingCI?: string;
  billingName?: string;
  countryCode: string;
  country: string;
  departamento: string;
  cityProvince: string;
  detailedAddress: string;
  city: string;
  streetNumber: string;
  postalCode: string;
}

interface CheckoutState {
  formData: CheckoutFormData | null;
  selectedPlace: Place | null;
  selectedShipment: Shipment | null;
  addressId: number | null;
  cartToken: string | null;
  checkoutCartItems: CartItem[];
  repriceData: RepriceData | null;
}

const initialState: CheckoutState = {
  formData: null,
  selectedPlace: null,
  selectedShipment: null,
  addressId: null,
  cartToken: null,
  checkoutCartItems: [],
  repriceData: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutFormData: (state, action: PayloadAction<CheckoutFormData>) => {
      state.formData = action.payload;
    },
    setSelectedPlace: (state, action: PayloadAction<Place>) => {
      state.selectedPlace = action.payload;
    },
    setSelectedShipment: (state, action: PayloadAction<Shipment>) => {
      state.selectedShipment = action.payload;
    },
    setAddressId: (state, action: PayloadAction<number>) => {
      state.addressId = action.payload;
    },
    setCartToken: (state, action: PayloadAction<string>) => {
      state.cartToken = action.payload;
    },
    setCheckoutCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.checkoutCartItems = action.payload;
    },
    setRepriceData: (state, action: PayloadAction<RepriceData>) => {
      state.repriceData = action.payload;
    },
    clearCheckoutData: (state) => {
      state.formData = null;
      state.selectedPlace = null;
      state.selectedShipment = null;
      state.addressId = null;
      state.cartToken = null;
      state.checkoutCartItems = [];
      state.repriceData = null;
    },
  },
});

export const {
  setCheckoutFormData,
  setSelectedPlace,
  setSelectedShipment,
  setAddressId,
  setCartToken,
  setCheckoutCartItems,
  setRepriceData,
  clearCheckoutData,
} = checkoutSlice.actions;

// Selectors
export const selectCheckoutFormData = (state: RootState) =>
  state.checkout.formData;
export const selectSelectedPlace = (state: RootState) =>
  state.checkout.selectedPlace;
export const selectSelectedShipment = (state: RootState) =>
  state.checkout.selectedShipment;
export const selectAddressId = (state: RootState) => state.checkout.addressId;
export const selectCartToken = (state: RootState) => state.checkout.cartToken;
export const selectCheckoutCartItems = (state: RootState) =>
  state.checkout.checkoutCartItems;
export const selectRepriceData = (state: RootState) =>
  state.checkout.repriceData;

export default checkoutSlice.reducer;
