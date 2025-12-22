import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMerchantProfile } from '../firebase/dataService';

// Thunk untuk mengambil profil merchant dari Firebase
export const fetchMerchantProfile = createAsyncThunk(
  'merchant/fetchProfile',
  async (merchantId, { rejectWithValue }) => {
    try {
      const data = await getMerchantProfile(merchantId);
      return data || { merchantName: 'DeKasir', address: '', phone: '' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const merchantSlice = createSlice({
  name: 'merchant',
  initialState: {
    profile: {
      merchantName: 'DeKasir',
      address: '',
      phone: '',
    },
    loading: false,
  },
  reducers: {
    // Update lokal setelah simpan di settings agar tidak perlu fetch ulang
    updateMerchantState: (state, action) => {
      state.profile = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerchantProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMerchantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMerchantProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateMerchantState } = merchantSlice.actions;
export default merchantSlice.reducer;
