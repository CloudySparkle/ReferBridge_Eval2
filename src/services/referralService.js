import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const SEED_REFERRALS = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    referral_code: 'REQ-101',
    patient_id: 'p1111111-1111-1111-1111-111111111111',
    patient: {
      id: 'p1111111-1111-1111-1111-111111111111',
      patient_identifier: 'PT-2291',
      full_name: 'Harpreet Singh',
      age: 54,
      primary_condition: 'Acute Myocardial Infarction',
      medical_history: 'Hypertension, Type 2 Diabetes'
    },
    sending_hospital_id: 'c3333333-3333-3333-3333-333333333333',
    sending_hospital: { name: 'Lotus Care Hospital' },
    receiving_hospital_id: 'c1111111-1111-1111-1111-111111111111',
    receiving_hospital: { name: 'PGIMER Chandigarh' },
    referral_reason: 'Emergency Cath Lab & Angioplasty transfer needed',
    urgency: 'Critical',
    clinical_notes: 'Patient presented with severe chest pain. ECG shows ST elevation in leads II, III, aVF.',
    status: 'Accepted',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    referral_code: 'REQ-102',
    patient_id: 'p2222222-2222-2222-2222-222222222222',
    patient: {
      id: 'p2222222-2222-2222-2222-222222222222',
      patient_identifier: 'PT-2292',
      full_name: 'Rajesh Sharma',
      age: 29,
      primary_condition: 'Compound Femur Fracture',
      medical_history: 'No prior surgeries'
    },
    sending_hospital_id: 'c4444444-4444-4444-4444-444444444444',
    sending_hospital: { name: 'Sunrise Multispecialty' },
    receiving_hospital_id: 'c2222222-2222-2222-2222-222222222222',
    receiving_hospital: { name: 'GMCH Sector 32' },
    referral_reason: 'Complex trauma ortho surgery & blood bank reserve',
    urgency: 'High',
    clinical_notes: 'Compound grade III fracture right femur. Open wound cleansed and temporarily splinted.',
    status: 'Rejected',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: 'r3333333-3333-3333-3333-333333333333',
    referral_code: 'REQ-103',
    patient_id: 'p3333333-3333-3333-3333-333333333333',
    patient: {
      id: 'p3333333-3333-3333-3333-333333333333',
      patient_identifier: 'PT-2293',
      full_name: 'Kamla Devi',
      age: 67,
      primary_condition: 'Suspected Ischemic Stroke',
      medical_history: 'Atrial Fibrillation'
    },
    sending_hospital_id: 'c5555555-5555-5555-5555-555555555555',
    sending_hospital: { name: 'Green Valley Hospital' },
    receiving_hospital_id: 'c3333333-3333-3333-3333-333333333333',
    receiving_hospital: { name: 'Lotus Care Hospital' },
    referral_reason: 'Stroke unit admission & urgent neuroimaging',
    urgency: 'Critical',
    clinical_notes: 'Sudden onset left-sided hemiparesis and facial droop at 08:30 AM.',
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'r4444444-4444-4444-4444-444444444444',
    referral_code: 'REQ-104',
    patient_id: 'p4444444-4444-4444-4444-444444444444',
    patient: {
      id: 'p4444444-4444-4444-4444-444444444444',
      patient_identifier: 'PT-2294',
      full_name: 'Baby Ananya',
      age: 8,
      primary_condition: 'Severe Dehydration',
      medical_history: 'Recent viral gastroenteritis'
    },
    sending_hospital_id: 'c6666666-6666-6666-6666-666666666666',
    sending_hospital: { name: 'Riverside Hospital' },
    receiving_hospital_id: 'c4444444-4444-4444-4444-444444444444',
    receiving_hospital: { name: 'Sunrise Multispecialty' },
    referral_reason: 'Pediatric ICU step-down bed reservation',
    urgency: 'Moderate',
    clinical_notes: 'Hypotensive episode responsive to bolus, requires continuous PICU monitoring.',
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'r5555555-5555-5555-5555-555555555555',
    referral_code: 'REQ-105',
    patient_id: 'p5555555-5555-5555-5555-555555555555',
    patient: {
      id: 'p5555555-5555-5555-5555-555555555555',
      patient_identifier: 'PT-2295',
      full_name: 'Manish Verma',
      age: 41,
      primary_condition: 'Acute Appendicitis',
      medical_history: 'No known allergies'
    },
    sending_hospital_id: 'c7777777-7777-7777-7777-777777777777',
    sending_hospital: { name: 'Om Research Centre' },
    receiving_hospital_id: 'c6666666-6666-6666-6666-666666666666',
    receiving_hospital: { name: 'Riverside Hospital' },
    referral_reason: 'Emergency laparoscopic appendectomy',
    urgency: 'High',
    clinical_notes: 'Rebound tenderness in RLQ, leukocytosis (16,400). Ready for transfer.',
    status: 'Pending',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'referbridge_referrals_store';

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!globalThis.__mockStorage) globalThis.__mockStorage = {};
  return {
    getItem: (k) => globalThis.__mockStorage[k] || null,
    setItem: (k, v) => { globalThis.__mockStorage[k] = String(v); },
    removeItem: (k) => { delete globalThis.__mockStorage[k]; }
  };
}

function getLocalReferrals() {
  const storage = getStorage();
  const data = storage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_REFERRALS));
    return SEED_REFERRALS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return SEED_REFERRALS;
  }
}

function saveLocalReferrals(list) {
  const storage = getStorage();
  storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));

  const legacyFormat = list.map((r) => ({
    id: r.referral_code,
    patientId: r.patient?.patient_identifier || 'PT-XXXX',
    age: r.patient?.age || 40,
    specialty: r.referral_reason,
    condition: r.patient?.primary_condition || r.referral_reason,
    history: r.patient?.medical_history || r.clinical_notes || '',
    urgency: r.urgency,
    hospital: r.receiving_hospital?.name || r.sending_hospital?.name || 'Partner Hospital',
    time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: r.status
  }));
  storage.setItem('referbridge_requests', JSON.stringify(legacyFormat));
}

export const referralService = {
  async getReferrals() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            *,
            patient:patients(*),
            sending_hospital:hospitals!referrals_sending_hospital_id_fkey(id, name, address, phone),
            receiving_hospital:hospitals!referrals_receiving_hospital_id_fkey(id, name, address, phone)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getReferrals failed, falling back to local dataset:', err.message);
      }
    }
    return getLocalReferrals();
  },

  async createReferral(referralData, patientObj, receivingHospitalObj, sendingHospitalObj) {
    const nextCode = referralData.referral_code || `REQ-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      referral_code: nextCode,
      patient_id: referralData.patient_id,
      sending_hospital_id: referralData.sending_hospital_id || null,
      receiving_hospital_id: referralData.receiving_hospital_id,
      referral_reason: referralData.referral_reason,
      urgency: referralData.urgency || 'High',
      clinical_notes: referralData.clinical_notes || '',
      status: referralData.status || 'Pending'
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .insert([payload])
          .select(`
            *,
            patient:patients(*),
            sending_hospital:hospitals!referrals_sending_hospital_id_fkey(id, name, address, phone),
            receiving_hospital:hospitals!referrals_receiving_hospital_id_fkey(id, name, address, phone)
          `)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase createReferral failed, storing locally:', err.message);
      }
    }

    const localPayload = {
      ...payload,
      id: 'local-req-' + Date.now(),
      patient: patientObj || {
        id: referralData.patient_id,
        patient_identifier: 'PT-SEL',
        full_name: 'Selected Patient',
        primary_condition: referralData.referral_reason
      },
      sending_hospital: sendingHospitalObj || { name: 'Lotus Care Hospital' },
      receiving_hospital: receivingHospitalObj || { name: 'Partner Hospital' },
      created_at: new Date().toISOString()
    };
    const list = getLocalReferrals();
    list.unshift(localPayload);
    saveLocalReferrals(list);
    return localPayload;
  },

  async updateReferralStatus(id, newStatus) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select(`
            *,
            patient:patients(*),
            sending_hospital:hospitals!referrals_sending_hospital_id_fkey(id, name, address, phone),
            receiving_hospital:hospitals!referrals_receiving_hospital_id_fkey(id, name, address, phone)
          `)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateReferralStatus failed, updating locally:', err.message);
      }
    }

    const list = getLocalReferrals();
    const idx = list.findIndex((r) => r.id === id || r.referral_code === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      saveLocalReferrals(list);
      return list[idx];
    }
    throw new Error('Referral record not found');
  }
};
