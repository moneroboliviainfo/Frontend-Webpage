import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import clientReducer from './clientSlice';
import adReducer from './adSlice';
import clothingReducer from './clothingSlice';
import checkoutReducer from './checkoutSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    client: clientReducer,
    ads: adReducer,
    clothing: clothingReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
