import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

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

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
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
}

const initialState: CheckoutState = {
  formData: null,
  selectedPlace: null,
  selectedShipment: null,
  addressId: null,
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
    clearCheckoutData: (state) => {
      state.formData = null;
      state.selectedPlace = null;
      state.selectedShipment = null;
      state.addressId = null;
    },
  },
});

export const {
  setCheckoutFormData,
  setSelectedPlace,
  setSelectedShipment,
  setAddressId,
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

export default checkoutSlice.reducer;
