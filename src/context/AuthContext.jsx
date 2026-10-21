import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    async function initSession() {
      try {
        const sessionData = await authService.getCurrentSession();
        if (sessionData) {
          setUser(sessionData.user);
          setProfile(sessionData.profile);
          setIsDemoMode(Boolean(sessionData.isDemoMode || !isSupabaseConfigured));
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.signIn({ email, password });
      setUser(data.user);
      setProfile(data.profile);
      setIsDemoMode(Boolean(data.isDemoMode || !isSupabaseConfigured));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.signUp(formData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: profile?.role === 'admin',
    isDemoMode,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
