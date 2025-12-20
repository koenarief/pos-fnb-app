import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts } from '../firebase/dataService';

// Thunk untuk mengambil data dari Firebase
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (merchantId, { rejectWithValue }) => {
    try {
      const data = await getProducts(merchantId);
      // Konversi Timestamp ke Number agar serializable (menghindari error sebelumnya)
      return data.map(product => ({
        ...product,
        createdAt: product.createdAt?.toMillis() || Date.now()
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer manual jika ingin update lokal tanpa fetch ulang
    setProducts: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProducts } = productSlice.actions;
export default productSlice.reducer;
