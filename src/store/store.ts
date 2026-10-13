import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import clothingReducer from './clothingSlice';
import checkoutReducer from './checkoutSlice';

export const store = configureStore({
  reducer: {
    client: clientReducer,
    clothing: clothingReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
