/* ==========================================================================
   REFERBRIDGE — PATIENT RECORDS CONTROLLER (patients.js)
   Standalone controller connecting directly to shared patient registry
   ========================================================================== */

const INITIAL_PATIENTS = [
  { id: 'p1', patient_identifier: 'PT-2291', full_name: 'Harpreet Singh', age: 54, gender: 'Male', contact_number: '+91 98721 11001', primary_condition: 'Acute Myocardial Infarction', medical_history: 'Hypertension, Type 2 Diabetes', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'p2', patient_identifier: 'PT-2292', full_name: 'Rajesh Sharma', age: 29, gender: 'Male', contact_number: '+91 98144 22002', primary_condition: 'Compound Femur Fracture', medical_history: 'No prior surgeries', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'p3', patient_identifier: 'PT-2293', full_name: 'Kamla Devi', age: 67, gender: 'Female', contact_number: '+91 98881 33003', primary_condition: 'Suspected Ischemic Stroke', medical_history: 'Atrial Fibrillation, Stent placed in 2021', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'p4', patient_identifier: 'PT-2294', full_name: 'Baby Ananya', age: 8, gender: 'Female', contact_number: '+91 99151 44004', primary_condition: 'Severe Dehydration', medical_history: 'Recent viral gastroenteritis', created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'p5', patient_identifier: 'PT-2295', full_name: 'Manish Verma', age: 41, gender: 'Male', contact_number: '+91 98555 55005', primary_condition: 'Acute Appendicitis', medical_history: 'No known drug allergies', created_at: new Date().toISOString() }
];

function getStoredPatients() {
  const data = localStorage.getItem('referbridge_patients_store');
  if (!data) {
    localStorage.setItem('referbridge_patients_store', JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_PATIENTS;
  }
}

function saveStoredPatients(list) {
  localStorage.setItem('referbridge_patients_store', JSON.stringify(list));
}

let patientList = getStoredPatients();
let editingPatientId = null;

function renderPatients() {
  const tbody = document.getElementById('patientTableBody');
  const empty = document.getElementById('patientEmpty');
  const search = (document.getElementById('patientSearch')?.value || '').toLowerCase();
  const gender = document.getElementById('genderFilter')?.value || 'All';

  if (!tbody) return;

  const filtered = patientList.filter((p) => {
    const matchSearch =
      !search ||
      p.patient_identifier.toLowerCase().includes(search) ||
      p.full_name.toLowerCase().includes(search) ||
      p.primary_condition.toLowerCase().includes(search);
    const matchGender = gender === 'All' || p.gender === gender;
    return matchSearch && matchGender;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  tbody.innerHTML = filtered.map((p) => `
    <tr style="border-bottom:1px solid rgba(56,198,232,0.1);">
      <td style="padding:14px 20px; font-family:var(--font-mono); font-weight:700; color:var(--rb-cyan);">${p.patient_identifier}</td>
      <td style="padding:14px 20px; font-weight:600; color:#fff;">${p.full_name}</td>
      <td style="padding:14px 20px; color:var(--rb-text-muted);">${p.age ? p.age + ' yrs' : 'N/A'} · ${p.gender}</td>
      <td style="padding:14px 20px;"><span style="padding:3px 8px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:var(--rb-text-main);">${p.primary_condition}</span></td>
      <td style="padding:14px 20px; color:var(--rb-text-muted); font-size:12px;">${new Date(p.created_at).toLocaleDateString()}</td>
      <td style="padding:14px 20px; text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button type="button" onclick="openDossier('${p.id}')" style="padding:5px 10px; border-radius:6px; border:1px solid var(--rb-border); background:transparent; color:var(--rb-cyan); font-size:12px; cursor:pointer;">Dossier</button>
          <button type="button" onclick="openEditModal('${p.id}')" style="padding:5px 10px; border-radius:6px; border:1px solid var(--rb-border); background:transparent; color:var(--rb-text-muted); font-size:12px; cursor:pointer;">Edit</button>
          <a href="requests.html?patientId=${p.patient_identifier}" style="padding:5px 12px; border-radius:6px; background:rgba(20,228,184,0.15); color:var(--rb-teal); font-size:12px; font-weight:600; text-decoration:none;">Refer Out →</a>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openDossier = function(id) {
  const p = patientList.find((x) => x.id === id);
  if (!p) return;
  document.getElementById('dosName').textContent = `${p.full_name} (${p.patient_identifier})`;
  document.getElementById('dosAgeGender').textContent = `${p.age || 'N/A'} yrs · ${p.gender}`;
  document.getElementById('dosPhone').textContent = p.contact_number || 'Not provided';
  document.getElementById('dosCondition').textContent = p.primary_condition;
  document.getElementById('dosHistory').textContent = p.medical_history || 'No significant pre-existing surgical or clinical history recorded.';
  document.getElementById('dossierModal').style.display = 'flex';
};

window.openEditModal = function(id) {
  const p = patientList.find((x) => x.id === id);
  if (!p) return;
  editingPatientId = id;
  document.getElementById('modalTitle').textContent = 'Edit Patient Case';
  document.getElementById('formPtId').value = p.patient_identifier;
  document.getElementById('formPtName').value = p.full_name;
  document.getElementById('formPtAge').value = p.age || '';
  document.getElementById('formPtGender').value = p.gender || 'Male';
  document.getElementById('formPtPhone').value = p.contact_number || '';
  document.getElementById('formPtCondition').value = p.primary_condition;
  document.getElementById('formPtHistory').value = p.medical_history || '';
  document.getElementById('patientModal').style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.loadTheme) window.loadTheme();

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle && window.toggleTheme) themeToggle.addEventListener('click', window.toggleTheme);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && window.handleLogout) logoutBtn.addEventListener('click', window.handleLogout);

  const btnOpenAdd = document.getElementById('btnOpenAddPatient');
  const patientModal = document.getElementById('patientModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const dossierModal = document.getElementById('dossierModal');
  const closeDossierBtn = document.getElementById('closeDossierBtn');
  const closeDossierBtn2 = document.getElementById('closeDossierBtn2');
  const form = document.getElementById('addPatientForm');

  if (btnOpenAdd) {
    btnOpenAdd.addEventListener('click', () => {
      editingPatientId = null;
      document.getElementById('modalTitle').textContent = 'Register New Patient Admission';
      document.getElementById('formPtId').value = `PT-${Math.floor(2000 + Math.random() * 8000)}`;
      document.getElementById('formPtName').value = '';
      document.getElementById('formPtAge').value = '';
      document.getElementById('formPtGender').value = 'Male';
      document.getElementById('formPtPhone').value = '';
      document.getElementById('formPtCondition').value = '';
      document.getElementById('formPtHistory').value = '';
      patientModal.style.display = 'flex';
    });
  }

  const closeModal = () => { if (patientModal) patientModal.style.display = 'none'; };
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  const closeDossier = () => { if (dossierModal) dossierModal.style.display = 'none'; };
  if (closeDossierBtn) closeDossierBtn.addEventListener('click', closeDossier);
  if (closeDossierBtn2) closeDossierBtn2.addEventListener('click', closeDossier);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ptId = document.getElementById('formPtId').value;
      const name = document.getElementById('formPtName').value.trim();
      const age = Number(document.getElementById('formPtAge').value) || null;
      const gender = document.getElementById('formPtGender').value;
      const phone = document.getElementById('formPtPhone').value.trim();
      const condition = document.getElementById('formPtCondition').value.trim();
      const history = document.getElementById('formPtHistory').value.trim();

      if (!name || !condition) {
        if (window.showToast) window.showToast('Please provide required fields', 'warning', '⚠');
        return;
      }

      if (editingPatientId) {
        const idx = patientList.findIndex((x) => x.id === editingPatientId);
        if (idx !== -1) {
          patientList[idx] = { ...patientList[idx], full_name: name, age, gender, contact_number: phone, primary_condition: condition, medical_history: history };
        }
        if (window.showToast) window.showToast(`Patient ${ptId} updated!`, 'success', '✓');
      } else {
        const newPt = {
          id: 'pt-' + Date.now(),
          patient_identifier: ptId,
          full_name: name,
          age,
          gender,
          contact_number: phone,
          primary_condition: condition,
          medical_history: history,
          created_at: new Date().toISOString()
        };
        patientList.unshift(newPt);
        if (window.showToast) window.showToast(`Patient ${ptId} added to registry!`, 'success', '✓');
      }

      saveStoredPatients(patientList);
      closeModal();
      renderPatients();
    });
  }

  const searchInput = document.getElementById('patientSearch');
  if (searchInput) searchInput.addEventListener('input', renderPatients);

  const genderSelect = document.getElementById('genderFilter');
  if (genderSelect) genderSelect.addEventListener('change', renderPatients);

  renderPatients();
});
