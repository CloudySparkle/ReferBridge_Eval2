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
  async signIn({ email, password }) {
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

    const storage = getStorage();
    const mockUsers = JSON.parse(storage.getItem('referbridge_users') || '[]');
    const isDefaultAdmin = email.toLowerCase() === 'admin@referbridge.com' && password === 'admin123';
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!isDefaultAdmin && !foundUser) {
      throw new Error('Invalid email or password. Please verify credentials or register.');
    }

    const mockProfile = {
      id: foundUser ? foundUser.id || 'mock-user-id' : 'mock-admin-id',
      email: email,
      display_name: foundUser ? foundUser.name : 'Dr. Sharma (Admin)',
      role: isDefaultAdmin ? 'admin' : (foundUser?.role || 'hospital_staff'),
      hospital_id: 'c1111111-1111-1111-1111-111111111111',
      account_approval_status: 'approved'
    };

    const mockAuthData = {
      user: { id: mockProfile.id, email },
      profile: mockProfile,
      isDemoMode: true
    };

    storage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockAuthData));
    storage.setItem('referbridge_auth', JSON.stringify({
      loggedIn: true,
      email: email,
      name: mockProfile.display_name
    }));
    storage.setItem('loggedIn', 'true');
    storage.setItem('adminEmail', email);

    return mockAuthData;
  },

  async signUp({ email, password, displayName, role = 'hospital_staff', hospitalId = null }) {
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
    storage.setItem('referbridge_auth', JSON.stringify({ loggedIn: false }));
    storage.removeItem('loggedIn');
    storage.removeItem('adminEmail');
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
    const mockAuth = storage.getItem(MOCK_STORAGE_KEY);
    if (mockAuth) {
      try {
        return JSON.parse(mockAuth);
      } catch (e) {
        return null;
      }
    }
    const legacyAuth = storage.getItem('referbridge_auth');
    if (legacyAuth) {
      try {
        const parsed = JSON.parse(legacyAuth);
        if (parsed.loggedIn) {
          return {
            user: { id: 'legacy-user', email: parsed.email },
            profile: {
              id: 'legacy-user',
              display_name: parsed.name || 'Dr. Sharma',
              email: parsed.email,
              role: 'admin',
              account_approval_status: 'approved'
            },
            isDemoMode: true
          };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
