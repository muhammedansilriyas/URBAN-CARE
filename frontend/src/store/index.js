import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import departmentReducer from './slices/departmentSlice.js';
import doctorReducer from './slices/doctorSlice.js';
import appointmentReducer from './slices/appointmentSlice.js';
import messageReducer from './slices/messageSlice.js';
import announcementReducer from './slices/announcementSlice.js';
import hospitalReducer from './slices/hospitalSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    doctors: doctorReducer,
    appointments: appointmentReducer,
    messages: messageReducer,
    announcements: announcementReducer,
    hospital: hospitalReducer,
  },
});

export default store;
