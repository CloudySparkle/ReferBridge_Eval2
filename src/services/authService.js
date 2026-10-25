import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const MOCK_STORAGE_KEY = 'referbridge_mock_auth';

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!globalThis.__mockStorage) globalThis.__mockStorage = {};
  return {
    getItem: (k) => globalThis.__mockStorage[k] || null,
    setItem: (k, v) => { globalThis.__mockStorage[k] = String(v); },
    removeItem: (k) => { delete globalThis.__mockStorage[k]; }
  };
}

export const authService = {
  /**
   * Sign in with email and password.
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {boolean} params.rememberMe - If true, session persists across browser restarts.
   */
  async signIn({ email, password, rememberMe = false }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, hospitals(*)')
        .eq('id', data.user.id)
        .single();

      // Persist remember-me flag in localStorage so AuthContext can restore on reload
      const storage = getStorage();
      if (rememberMe) {
        storage.setItem('referbridge_remember', 'true');
        storage.setItem('referbridge_auth', JSON.stringify({
          loggedIn: true,
          email: email,
          name: profile?.display_name || email.split('@')[0]
        }));
      } else {
        // Do not persist — Supabase session will survive only per its own config
        storage.removeItem('referbridge_remember');
        storage.removeItem('referbridge_auth');
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile || {
          id: data.user.id,
          display_name: data.user.email?.split('@')[0] || 'User',
          role: 'hospital_staff',
          account_approval_status: 'approved'
        }
      };
    }

    // ── Offline / Demo-without-Supabase fallback ────────────────────────────
    // IMPORTANT: No hardcoded credentials. Only registered users from signup.
    const storage = getStorage();
    const mockUsers = JSON.parse(storage.getItem('referbridge_users') || '[]');

    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error(
        'Invalid email or password. Please register your hospital via the signup page first.'
      );
    }

    const mockProfile = {
      id: foundUser.id || 'user-' + foundUser.email,
      email: email,
      display_name: foundUser.name || foundUser.hospitalName || email.split('@')[0],
      role: foundUser.role || 'hospital_staff',
      hospital_id: foundUser.hospitalId || null,
      account_approval_status: 'approved'
    };

    const mockAuthData = {
      user: { id: mockProfile.id, email },
      profile: mockProfile,
      isDemoMode: true
    };

    if (rememberMe) {
      // Persist in localStorage so the user stays logged in on next visit
      storage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockAuthData));
      storage.setItem('referbridge_remember', 'true');
      storage.setItem('referbridge_auth', JSON.stringify({
        loggedIn: true,
        email: email,
        name: mockProfile.display_name
      }));
      storage.setItem('loggedIn', 'true');
      storage.setItem('adminEmail', email);
    } else {
      // Persist only in sessionStorage — clears automatically when tab/browser closes
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockAuthData));
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('adminEmail', email);
      }
      // Ensure nothing is saved to localStorage for this session
      storage.removeItem(MOCK_STORAGE_KEY);
      storage.removeItem('referbridge_remember');
      storage.removeItem('referbridge_auth');
    }

    return mockAuthData;
  },

  async signUp({ email, password, displayName, hospitalName, role = 'hospital_staff', hospitalId = null }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role
          }
        }
      });
      if (error) throw error;
      return data;
    }

    const storage = getStorage();
    const mockUsers = JSON.parse(storage.getItem('referbridge_users') || '[]');
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: 'mock-user-' + Date.now(),
      email,
      password,
      name: displayName,
      hospitalName: hospitalName || '',
      role,
      hospitalId,
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    storage.setItem('referbridge_users', JSON.stringify(mockUsers));
    return { user: newUser };
  },

  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    const storage = getStorage();
    storage.removeItem(MOCK_STORAGE_KEY);
    storage.removeItem('referbridge_remember');
    storage.setItem('referbridge_auth', JSON.stringify({ loggedIn: false }));
    storage.removeItem('loggedIn');
    storage.removeItem('adminEmail');
    // Also clear any session-only data
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(MOCK_STORAGE_KEY);
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('adminEmail');
    }
  },

  async getCurrentSession() {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, hospitals(*)')
        .eq('id', session.user.id)
        .single();

      return {
        user: session.user,
        session,
        profile: profile || {
          id: session.user.id,
          display_name: session.user.email?.split('@')[0] || 'User',
          role: 'hospital_staff',
          account_approval_status: 'approved'
        }
      };
    }

    const storage = getStorage();

    // Check if user opted to be remembered (localStorage persisted session)
    const remembered = storage.getItem('referbridge_remember');
    if (remembered === 'true') {
      const mockAuth = storage.getItem(MOCK_STORAGE_KEY);
      if (mockAuth) {
        try {
          return JSON.parse(mockAuth);
        } catch (e) {
          // Corrupt data — clear it
          storage.removeItem(MOCK_STORAGE_KEY);
          storage.removeItem('referbridge_remember');
          return null;
        }
      }
    }

    // Check session-only (non-remembered) login via sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionAuth = sessionStorage.getItem(MOCK_STORAGE_KEY);
      if (sessionAuth) {
        try {
          return JSON.parse(sessionAuth);
        } catch (e) {
          sessionStorage.removeItem(MOCK_STORAGE_KEY);
          return null;
        }
      }
    }

    return null;
  }
};
