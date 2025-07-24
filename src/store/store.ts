import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import clientReducer from './clientSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    client: clientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
