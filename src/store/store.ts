import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import clientReducer from './clientSlice';
import adReducer from './adSlice';
import clothingReducer from './clothingSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    client: clientReducer,
    ads: adReducer,
    clothing: clothingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
