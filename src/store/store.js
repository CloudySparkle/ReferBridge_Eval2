import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hospitalsReducer from './slices/hospitalsSlice';
import referralsReducer from './slices/referralsSlice';
import mapReducer from './slices/mapSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hospitals: hospitalsReducer,
    referrals: referralsReducer,
    map: mapReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

// Expose on window for easy interoperability with legacy pages & test scripts
if (typeof window !== 'undefined') {
  window.referbridgeStore = store;
}

export default store;
