import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from './types';
import {
  CART_STATUS,
  CART_ACTIONS,
  CartStatus,
  ENCRYPTED_CART_KEY,
} from '../constants/cart';
import type { RootState } from './store';

interface CartState {
  cart: CartItem[];
  status: CartStatus;
  error: string | null;
}

export const addToCart = createAsyncThunk(
  CART_ACTIONS.ADD,
  async ({
    encryptedCart,
    item,
  }: {
    encryptedCart: string;
    item: CartItem;
  }) => {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedCart, item }),
    });
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    return response.json() as Promise<{
      encryptedCart: string;
      cart: CartItem[];
    }>;
  }
);

export const removeFromCart = createAsyncThunk(
  CART_ACTIONS.REMOVE,
  async ({
    encryptedCart,
    item,
  }: {
    encryptedCart: string;
    item: CartItem;
  }) => {
    const response = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedCart, item }),
    });
    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }
    return response.json() as Promise<{
      encryptedCart: string;
      cart: CartItem[];
    }>;
  }
);

const initialState: CartState = {
  cart: [],
  status: CART_STATUS.IDLE,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cleanCart(state: CartState) {
      state.cart = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ENCRYPTED_CART_KEY);
      }
    },
    setCartFromStorage(
      state: CartState,
      action: PayloadAction<{ encryptedCart: string; cart: CartItem[] }>
    ) {
      localStorage.setItem(ENCRYPTED_CART_KEY, action.payload.encryptedCart);
      state.cart = action.payload.cart;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state: CartState) => {
        state.status = CART_STATUS.LOADING;
      })
      .addCase(
        addToCart.fulfilled,
        (
          state: CartState,
          action: PayloadAction<{ encryptedCart: string; cart: CartItem[] }>
        ) => {
          state.status = CART_STATUS.SUCCEEDED;
          state.cart = action.payload.cart;
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              ENCRYPTED_CART_KEY,
              action.payload.encryptedCart
            );
          }
        }
      )
      .addCase(addToCart.rejected, (state: CartState, action) => {
        state.status = CART_STATUS.FAILED;
        state.error = action.error.message || null;
      })
      .addCase(removeFromCart.pending, (state: CartState) => {
        state.status = CART_STATUS.LOADING;
      })
      .addCase(
        removeFromCart.fulfilled,
        (
          state: CartState,
          action: PayloadAction<{ encryptedCart: string; cart: CartItem[] }>
        ) => {
          state.status = CART_STATUS.SUCCEEDED;
          state.cart = action.payload.cart;
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              ENCRYPTED_CART_KEY,
              action.payload.encryptedCart
            );
          }
        }
      )
      .addCase(removeFromCart.rejected, (state: CartState, action) => {
        state.status = CART_STATUS.FAILED;
        state.error = action.error.message || null;
      });
  },
});

export const selectCartQuantity = (state: RootState) =>
  state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);

export const { cleanCart, setCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
