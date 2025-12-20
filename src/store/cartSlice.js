import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
      // Rekalkulasi total
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    },
    removeFromCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem.qty === 1) {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      } else {
        existingItem.qty -= 1;
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
