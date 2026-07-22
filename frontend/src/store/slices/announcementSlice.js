import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.announcements = action.payload;
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

export const { fetchStart, fetchSuccess, actionSuccess, fetchFail } = announcementSlice.actions;
export default announcementSlice.reducer;
