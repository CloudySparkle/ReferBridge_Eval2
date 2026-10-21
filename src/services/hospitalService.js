import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const SEED_HOSPITALS = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'PGIMER Chandigarh',
    address: 'Sector 12, Chandigarh, 160012',
    latitude: 30.7673,
    longitude: 76.7770,
    phone: '0172-2746018',
    specialties: ['Multi-Specialty', 'Trauma', 'Research', 'Neurology'],
    total_beds: 1900,
    available_beds: 12,
    icu_beds_available: 0,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'GMCH Sector 32',
    address: 'Sector 32-B, Chandigarh, 160047',
    latitude: 30.7095,
    longitude: 76.7725,
    phone: '0172-2601023',
    specialties: ['General Surgery', 'Emergency', 'Burn Unit'],
    total_beds: 900,
    available_beds: 45,
    icu_beds_available: 2,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Lotus Care Hospital',
    address: 'Sector 22, Chandigarh, 160022',
    latitude: 30.7380,
    longitude: 76.7745,
    phone: '+91 98141 12345',
    specialties: ['Cardiology', 'Orthopedics', 'Emergency Care'],
    total_beds: 180,
    available_beds: 24,
    icu_beds_available: 6,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Sunrise Multispecialty',
    address: 'Phase 7, Sector 61, Mohali, 160062',
    latitude: 30.7135,
    longitude: 76.7160,
    phone: '+91 98722 54321',
    specialties: ['Pediatrics', 'Trauma', 'General Surgery'],
    total_beds: 140,
    available_beds: 8,
    icu_beds_available: 2,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Green Valley Hospital',
    address: 'Sector 11, Panchkula, 134109',
    latitude: 30.6865,
    longitude: 76.8530,
    phone: '+91 98888 11223',
    specialties: ['Neurology', 'Cardiology', 'Stroke Center'],
    total_beds: 90,
    available_beds: 0,
    icu_beds_available: 0,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Riverside Hospital',
    address: 'Zirakpur Bypass, NH-22, 140603',
    latitude: 30.6425,
    longitude: 76.8180,
    phone: '+91 99150 99887',
    specialties: ['Trauma', 'Orthopedics', 'Critical Care'],
    total_beds: 210,
    available_beds: 38,
    icu_beds_available: 9,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    name: 'Om Research Centre',
    address: 'Sector 34, Chandigarh, 160022',
    latitude: 30.7225,
    longitude: 76.7680,
    phone: '+91 98155 33445',
    specialties: ['Nephrology', 'Oncology', 'ICU'],
    total_beds: 160,
    available_beds: 19,
    icu_beds_available: 4,
    is_verified: true,
    is_active: true
  },
  {
    id: 'c8888888-8888-8888-8888-888888888888',
    name: 'Apex Medical Institute',
    address: 'Sector 62, Mohali, 160062',
    latitude: 30.6980,
    longitude: 76.7320,
    phone: '+91 98760 00112',
    specialties: ['Cardiology', 'Neurology', 'Vascular Surgery'],
    total_beds: 250,
    available_beds: 12,
    icu_beds_available: 3,
    is_verified: true,
    is_active: true
  }
];

const LOCAL_STORAGE_KEY = 'referbridge_hospitals_store';

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!globalThis.__mockStorage) globalThis.__mockStorage = {};
  return {
    getItem: (k) => globalThis.__mockStorage[k] || null,
    setItem: (k, v) => { globalThis.__mockStorage[k] = String(v); },
    removeItem: (k) => { delete globalThis.__mockStorage[k]; }
  };
}

function getLocalHospitals() {
  const storage = getStorage();
  const data = storage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_HOSPITALS));
    return SEED_HOSPITALS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_HOSPITALS;
  }
}

function saveLocalHospitals(list) {
  const storage = getStorage();
  storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const hospitalService = {
  async getHospitals() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local dataset:', err.message);
      }
    }
    return getLocalHospitals();
  },

  async getHospitalById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase getHospitalById failed, checking local:', err.message);
      }
    }
    const list = getLocalHospitals();
    return list.find((h) => h.id === id) || null;
  },

  async createHospital(hospitalData) {
    const payload = {
      ...hospitalData,
      specialties: Array.isArray(hospitalData.specialties)
        ? hospitalData.specialties
        : (hospitalData.specialties || '').split(',').map((s) => s.trim()).filter(Boolean),
      total_beds: Number(hospitalData.total_beds) || 0,
      available_beds: Number(hospitalData.available_beds) || 0,
      icu_beds_available: Number(hospitalData.icu_beds_available) || 0,
      latitude: hospitalData.latitude ? Number(hospitalData.latitude) : null,
      longitude: hospitalData.longitude ? Number(hospitalData.longitude) : null,
      is_verified: true,
      is_active: true
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createHospital failed, storing locally:', err.message);
      }
    }

    const localPayload = {
      ...payload,
      id: 'local-hosp-' + Date.now(),
      created_at: new Date().toISOString()
    };
    const list = getLocalHospitals();
    list.unshift(localPayload);
    saveLocalHospitals(list);
    return localPayload;
  },

  async updateHospital(id, updateData) {
    const payload = {
      ...updateData,
      specialties: Array.isArray(updateData.specialties)
        ? updateData.specialties
        : (updateData.specialties || '').split(',').map((s) => s.trim()).filter(Boolean),
      total_beds: Number(updateData.total_beds) || 0,
      available_beds: Number(updateData.available_beds) || 0,
      icu_beds_available: Number(updateData.icu_beds_available) || 0,
      latitude: updateData.latitude ? Number(updateData.latitude) : null,
      longitude: updateData.longitude ? Number(updateData.longitude) : null
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateHospital failed, updating locally:', err.message);
      }
    }

    const list = getLocalHospitals();
    const idx = list.findIndex((h) => h.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload, updated_at: new Date().toISOString() };
      saveLocalHospitals(list);
      return list[idx];
    }
    throw new Error('Hospital not found for update');
  }
};
