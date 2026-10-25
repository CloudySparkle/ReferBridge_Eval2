import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial auth state from localStorage/sessionStorage
const getInitialAuth = () => {
  let stored = null;
  try {
    stored = JSON.parse(
      localStorage.getItem('referbridge_auth') ||
      sessionStorage.getItem('referbridge_auth') ||
      'null'
    );
  } catch (e) {
    stored = null;
  }

  if (stored && stored.loggedIn) {
    return {
      isAuthenticated: true,
      user: {
        email: stored.email || 'admin@referbridge.com',
        displayName: stored.name || 'Hospital Administrator',
        hospitalName: stored.hospitalName || 'Central Care Hub',
        role: stored.role || 'admin'
      },
      token: 'session_active'
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null
  };
};

const initialState = getInitialAuth();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token || 'session_token';
      
      const authData = {
        loggedIn: true,
        email: action.payload.user.email,
        name: action.payload.user.displayName,
        hospitalName: action.payload.user.hospitalName,
        role: action.payload.user.role || 'admin'
      };
      
      if (action.payload.rememberMe) {
        localStorage.setItem('referbridge_auth', JSON.stringify(authData));
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('adminEmail', action.payload.user.email);
      } else {
        sessionStorage.setItem('referbridge_auth', JSON.stringify(authData));
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('adminEmail', action.payload.user.email);
      }
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('referbridge_auth');
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('adminEmail');
      sessionStorage.removeItem('referbridge_auth');
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('adminEmail');
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

export const { loginSuccess, logoutUser, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
