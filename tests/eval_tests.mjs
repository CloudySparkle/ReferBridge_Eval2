// ============================================================================
// REFERBRIDGE EVALUATION TEST SUITE (EVALUATION 1–2)
// Automated verification for Supabase services, CRUD workflows, Auth & Routes
// ============================================================================

import assert from 'assert';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from '../src/services/mapsService.js';
import { hospitalService } from '../src/services/hospitalService.js';
import { patientService } from '../src/services/patientService.js';
import { referralService } from '../src/services/referralService.js';
import { authService } from '../src/services/authService.js';

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

console.log('====================================================');
console.log('REFERBRIDGE EVALUATION 1–2 AUTOMATED VERIFICATION');
console.log('====================================================\n');

// ----------------------------------------------------------------------------
// 1. Google Maps & Routing Calculation Tests
// ----------------------------------------------------------------------------
console.log('1. Maps & Routing Logic:');

runTest('Calculate accurate Haversine distance between PGIMER & GMCH 32 (~6.5 km)', () => {
  // PGIMER: (30.7673, 76.7770), GMCH: (30.7095, 76.7725)
  const dist = calculateHaversineDistanceKm(30.7673, 76.7770, 30.7095, 76.7725);
  assert(dist > 5.5 && dist < 7.5, `Distance should be ~6.4 km, got ${dist}`);
});

runTest('Handle identical origin and destination coordinates (0.0 km)', () => {
  const dist = calculateHaversineDistanceKm(30.7673, 76.7770, 30.7673, 76.7770);
  assert.strictEqual(dist, 0);
});

runTest('Estimate travel duration under urban transit conditions', () => {
  const mins = estimateTravelTimeMinutes(10, 35); // 10 km at 35 km/h + overhead
  assert(mins >= 18 && mins <= 25, `Expected 18-25 mins, got ${mins}`);
});

// ----------------------------------------------------------------------------
// 2. Authentication Workflows (Real hospital registration & login)
// ----------------------------------------------------------------------------
console.log('\n2. Authentication & Role Permissions:');

await runAsyncTest('Register new hospital administrator account', async () => {
  const reg = await authService.signUp({
    email: 'director@fortis-mohali.com',
    password: 'SecurePassword123!',
    displayName: 'Dr. Gurpreet Singh',
    hospitalName: 'Fortis Hospital Mohali',
    role: 'admin'
  });
  assert(reg.user, 'Registered user should exist');
});

await runAsyncTest('Login with registered hospital administrator credentials', async () => {
  const result = await authService.signIn({
    email: 'director@fortis-mohali.com',
    password: 'SecurePassword123!',
    rememberMe: true
  });
  assert(result.user, 'User object should exist');
  assert.strictEqual(result.profile.role, 'admin', 'Profile should have admin role');
  assert.strictEqual(result.profile.account_approval_status, 'approved', 'Account should be approved');
});

await runAsyncTest('Reject login with invalid password', async () => {
  let thrown = false;
  try {
    await authService.signIn({
      email: 'director@fortis-mohali.com',
      password: 'wrongpassword'
    });
  } catch (e) {
    thrown = true;
    assert(e.message.includes('Invalid') || e.message.includes('credentials'));
  }
  assert(thrown, 'Should reject invalid credentials');
});

// ----------------------------------------------------------------------------
// 3. Hospital Network CRUD, Geographic Restriction & Dynamic Directory
// ----------------------------------------------------------------------------
console.log('\n3. Hospital Network Dynamic Directory & CRUD:');

await runAsyncTest('Fetch registered hospitals list (all 4 permitted locations)', async () => {
  const list = await hospitalService.getHospitals();
  assert(Array.isArray(list), 'Hospitals should be an array');
  assert(list.length >= 8, `Expected at least 8 seeded hospitals, got ${list.length}`);
});

await runAsyncTest('Filter hospitals by city and category', async () => {
  const mohaliHospitals = await hospitalService.getHospitals({ city: 'Mohali' });
  assert(mohaliHospitals.every(h => h.city === 'Mohali'), 'All returned hospitals should be in Mohali');
  
  const govtHospitals = await hospitalService.getHospitals({ category: 'Government' });
  assert(govtHospitals.every(h => h.category === 'Government'), 'All returned hospitals should be Government');
});

await runAsyncTest('Enforce geographic restriction (reject hospitals outside Mohali, Zirakpur, Chandigarh, Panchkula)', async () => {
  let rejected = false;
  try {
    await hospitalService.createHospital({
      name: 'Delhi Care Hospital',
      city: 'New Delhi',
      address: 'Connaught Place, New Delhi',
      specialties: ['General Medicine']
    });
  } catch (err) {
    rejected = true;
    assert(err.message.includes('not permitted'), 'Should mention permitted cities');
  }
  assert(rejected, 'Should reject hospital located outside the 4 permitted regions');
});

await runAsyncTest('Add a new hospital facility in a permitted location (Mohali)', async () => {
  const newHosp = await hospitalService.createHospital({
    name: 'Apollo Clinic Mohali',
    city: 'Mohali',
    category: 'Private',
    district: 'SAS Nagar',
    address: 'Sector 70, SAS Nagar, Mohali',
    phone: '+91 172 5096001',
    specialties: ['Cardiology', 'Oncology', 'Emergency Care'],
    total_beds: 120,
    available_beds: 35,
    icu_beds_available: 6,
    emergency_services: true,
    latitude: 30.7050,
    longitude: 76.7320
  });
  assert(newHosp.id, 'New hospital must have an ID');
  assert.strictEqual(newHosp.name, 'Apollo Clinic Mohali');
  assert.strictEqual(newHosp.available_beds, 35);
  assert.strictEqual(newHosp.city, 'Mohali');

  // Verify retrieval
  const retrieved = await hospitalService.getHospitalById(newHosp.id);
  assert(retrieved, 'Should retrieve newly added hospital');
});

await runAsyncTest('Update hospital capacity and beds', async () => {
  const list = await hospitalService.getHospitals();
  const target = list[0];
  const updated = await hospitalService.updateHospital(target.id, {
    available_beds: 15,
    icu_beds_available: 3
  });
  assert.strictEqual(updated.available_beds, 15);
  assert.strictEqual(updated.icu_beds_available, 3);
});

// ----------------------------------------------------------------------------
// 4. Patient Records CRUD
// ----------------------------------------------------------------------------
console.log('\n4. Patient Records Clinical Registry:');

await runAsyncTest('Fetch patient clinical records', async () => {
  const pts = await patientService.getPatients();
  assert(Array.isArray(pts), 'Patients should be an array');
  assert(pts.length >= 5, `Expected at least 5 seeded patients, got ${pts.length}`);
});

let createdPatientId = null;
await runAsyncTest('Create new patient record with minimum required fields', async () => {
  const newPt = await patientService.createPatient({
    full_name: 'Simranjeet Kaur',
    age: 36,
    gender: 'Female',
    contact_number: '+91 98765 12340',
    primary_condition: 'Third-Trimester Eclampsia',
    medical_history: 'Gestational Hypertension'
  });
  assert(newPt.id, 'Patient must have an ID');
  assert(newPt.patient_identifier.startsWith('PT-'), 'Patient must have PT- code');
  assert.strictEqual(newPt.primary_condition, 'Third-Trimester Eclampsia');
  createdPatientId = newPt.id;
});

await runAsyncTest('Update patient condition and notes', async () => {
  assert(createdPatientId, 'Preceding patient creation required');
  const updated = await patientService.updatePatient(createdPatientId, {
    primary_condition: 'Eclampsia - Stabilized with Magnesium Sulfate',
    medical_history: 'Gestational Hypertension, IV access secured'
  });
  assert.strictEqual(updated.primary_condition, 'Eclampsia - Stabilized with Magnesium Sulfate');
});

// ----------------------------------------------------------------------------
// 5. Referral Requests Database Workflow & Status Lifecycle
// ----------------------------------------------------------------------------
console.log('\n5. Referral Requests & Lifecycle Status Updates:');

await runAsyncTest('Retrieve referral transfer queue', async () => {
  const reqs = await referralService.getReferrals();
  assert(Array.isArray(reqs), 'Referrals should be an array');
  assert(reqs.length >= 5, 'Should have initial referral queue');
});

let testReferralId = null;
await runAsyncTest('Create and dispatch new referral request', async () => {
  const newRef = await referralService.createReferral({
    patient_id: createdPatientId || 'p1111111-1111-1111-1111-111111111111',
    receiving_hospital_id: 'c1111111-1111-1111-1111-111111111111',
    referral_reason: 'Urgent specialized obstetric ICU transfer',
    urgency: 'Critical',
    clinical_notes: 'Magnesium infusion ongoing. Airway protected.'
  });
  assert(newRef.id, 'Referral must have an ID');
  assert(newRef.referral_code.startsWith('REQ-'), 'Referral must have REQ- code');
  assert.strictEqual(newRef.status, 'Pending');
  testReferralId = newRef.id;
});

await runAsyncTest('Transition referral status: Pending -> Accepted', async () => {
  assert(testReferralId, 'Test referral must exist');
  const accepted = await referralService.updateReferralStatus(testReferralId, 'Accepted');
  assert.strictEqual(accepted.status, 'Accepted');
});

await runAsyncTest('Transition referral status: Accepted -> Cancelled', async () => {
  assert(testReferralId, 'Test referral must exist');
  const cancelled = await referralService.updateReferralStatus(testReferralId, 'Cancelled');
  assert.strictEqual(cancelled.status, 'Cancelled');
});

console.log('\n====================================================');
console.log(`SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
