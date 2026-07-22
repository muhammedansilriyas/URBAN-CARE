import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  details: null,
  loading: false,
  error: null,
};

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.details = action.payload;
    },
    actionSuccess: (state) => {
      state.loading = false;
    },
    fetchFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, actionSuccess, fetchFail } = hospitalSlice.actions;
export default hospitalSlice.reducer;
