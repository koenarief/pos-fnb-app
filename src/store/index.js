import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import productReducer from './productSlice';
import merchantReducer from './merchantSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    merchant: merchantReducer,
  },
});
