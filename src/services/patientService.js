import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const SEED_PATIENTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    patient_identifier: 'PT-2291',
    full_name: 'Harpreet Singh',
    age: 54,
    gender: 'Male',
    contact_number: '+91 98721 11001',
    primary_condition: 'Acute Myocardial Infarction',
    medical_history: 'Hypertension, Type 2 Diabetes',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    patient_identifier: 'PT-2292',
    full_name: 'Rajesh Sharma',
    age: 29,
    gender: 'Male',
    contact_number: '+91 98144 22002',
    primary_condition: 'Compound Femur Fracture',
    medical_history: 'No prior surgeries',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    patient_identifier: 'PT-2293',
    full_name: 'Kamla Devi',
    age: 67,
    gender: 'Female',
    contact_number: '+91 98881 33003',
    primary_condition: 'Suspected Ischemic Stroke',
    medical_history: 'Atrial Fibrillation, Stent placed in 2021',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    patient_identifier: 'PT-2294',
    full_name: 'Baby Ananya',
    age: 8,
    gender: 'Female',
    contact_number: '+91 99151 44004',
    primary_condition: 'Severe Dehydration',
    medical_history: 'Recent viral gastroenteritis',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    patient_identifier: 'PT-2295',
    full_name: 'Manish Verma',
    age: 41,
    gender: 'Male',
    contact_number: '+91 98555 55005',
    primary_condition: 'Acute Appendicitis',
    medical_history: 'No known drug allergies',
    created_at: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'referbridge_patients_store';

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!globalThis.__mockStorage) globalThis.__mockStorage = {};
  return {
    getItem: (k) => globalThis.__mockStorage[k] || null,
    setItem: (k, v) => { globalThis.__mockStorage[k] = String(v); },
    removeItem: (k) => { delete globalThis.__mockStorage[k]; }
  };
}

function getLocalPatients() {
  const storage = getStorage();
  const data = storage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_PATIENTS));
    return SEED_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_PATIENTS;
  }
}

function saveLocalPatients(list) {
  const storage = getStorage();
  storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const patientService = {
  async getPatients() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getPatients failed, falling back to local dataset:', err.message);
      }
    }
    return getLocalPatients();
  },

  async createPatient(patientData) {
    const nextIdentifier = patientData.patient_identifier || `PT-${Math.floor(3000 + Math.random() * 9000)}`;
    const payload = {
      patient_identifier: nextIdentifier,
      full_name: patientData.full_name,
      age: Number(patientData.age) || null,
      gender: patientData.gender || 'Other',
      contact_number: patientData.contact_number || '',
      primary_condition: patientData.primary_condition,
      medical_history: patientData.medical_history || ''
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createPatient failed, storing locally:', err.message);
      }
    }

    const localPayload = {
      ...payload,
      id: 'local-pt-' + Date.now(),
      created_at: new Date().toISOString()
    };
    const list = getLocalPatients();
    list.unshift(localPayload);
    saveLocalPatients(list);
    return localPayload;
  },

  async updatePatient(id, updateData) {
    const payload = {
      full_name: updateData.full_name,
      age: Number(updateData.age) || null,
      gender: updateData.gender,
      contact_number: updateData.contact_number,
      primary_condition: updateData.primary_condition,
      medical_history: updateData.medical_history
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updatePatient failed, updating locally:', err.message);
      }
    }

    const list = getLocalPatients();
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload, updated_at: new Date().toISOString() };
      saveLocalPatients(list);
      return list[idx];
    }
    throw new Error('Patient record not found');
  }
};
