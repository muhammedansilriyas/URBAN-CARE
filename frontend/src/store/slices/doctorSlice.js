import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.doctors = action.payload;
    },
    fetchDoctorDetailSuccess: (state, action) => {
      state.loading = false;
      state.selectedDoctor = action.payload;
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

export const { fetchStart, fetchSuccess, fetchDoctorDetailSuccess, actionSuccess, fetchFail } = doctorSlice.actions;
export default doctorSlice.reducer;
