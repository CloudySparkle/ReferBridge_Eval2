/* ==========================================================================
   REFERBRIDGE — INCOMING REQUESTS CONTROLLER (requests.js)
   ========================================================================== */






const SEED_REQUESTS = [
  { id: "REQ-101", patientId: "PT-2291", age: 54, specialty: "Cardiology", condition: "Acute Myocardial Infarction (Anterior STEMI)", history: "Hypertension, Type 2 Diabetes, Smoker", urgency: "Critical", hospital: "Lotus Care Hospital", time: "09:12 AM", status: "Accepted" },
  { id: "REQ-102", patientId: "PT-2292", age: 29, specialty: "Orthopedics", condition: "Compound Femur Fracture & Pelvic Trauma", history: "High-speed road collision, Hemodynamically stabilized", urgency: "High", hospital: "Sunrise Multispecialty", time: "09:47 AM", status: "Rejected" },
  { id: "REQ-103", patientId: "PT-2293", age: 67, specialty: "Neurology", condition: "Acute Ischemic Stroke (Left MCA territory)", history: "Atrial Fibrillation, On oral anticoagulants", urgency: "Critical", hospital: "GMSH Sector 16", time: "10:05 AM", status: "Pending" },
  { id: "REQ-104", patientId: "PT-2294", age: 8, specialty: "Pediatrics", condition: "Severe Dehydration & Septic Shock", history: "Recent viral gastroenteritis, High grade fever for 4 days", urgency: "Moderate", hospital: "Civil Hospital Panchkula", time: "10:32 AM", status: "Pending" },
  { id: "REQ-105", patientId: "PT-2295", age: 41, specialty: "General Surgery", condition: "Acute Perforated Appendicitis with Peritonitis", history: "No prior surgeries, No known drug allergies", urgency: "High", hospital: "Riverside Hospital Zirakpur", time: "11:15 AM", status: "Pending" },
  { id: "REQ-106", patientId: "PT-2296", age: 62, specialty: "Cardiology", condition: "Unstable Angina with Impending Cardiogenic Shock", history: "Prior PCI in 2021, Chronic Kidney Disease Stage 3", urgency: "Critical", hospital: "Civil Hospital Mohali", time: "11:40 AM", status: "Pending" },
  { id: "REQ-107", patientId: "PT-2297", age: 34, specialty: "Trauma", condition: "Severe Poly-Trauma with Tension Pneumothorax", history: "Fall from height (3rd floor), Intercostal chest tube placed", urgency: "Critical", hospital: "PGI Satellite Centre Mohali", time: "12:05 PM", status: "Pending" },
  { id: "REQ-108", patientId: "PT-2298", age: 48, specialty: "Pulmonology", condition: "Acute ARDS & Type 2 Respiratory Failure", history: "Severe COPD exacerbation, SpO2 84% on reservoir mask", urgency: "Critical", hospital: "GMCH Sector 32", time: "12:22 PM", status: "Pending" },
  { id: "REQ-109", patientId: "PT-2299", age: 14, specialty: "Pediatrics", condition: "Refractory Status Epilepticus (> 30 mins)", history: "Known idiopathic seizure disorder, Non-compliant with AEDs", urgency: "High", hospital: "General Hospital Sector 6 Panchkula", time: "12:50 PM", status: "Pending" },
  { id: "REQ-110", patientId: "PT-2300", age: 71, specialty: "Cardiology", condition: "Complete Heart Block with Recurrent Syncope (HR 30 bpm)", history: "Degenerative conduction disease, Requires temporary pacing lead", urgency: "Critical", hospital: "Fortis Hospital Mohali", time: "01:15 PM", status: "Pending" },
  { id: "REQ-111", patientId: "PT-2301", age: 23, specialty: "Orthopedics", condition: "Open Gustilo Grade 3B Tibia Fracture with Nerve Deficit", history: "Motorcycle collision, Distal dorsalis pedis pulse feeble", urgency: "High", hospital: "Max Super Speciality Mohali", time: "01:40 PM", status: "Pending" },
  { id: "REQ-112", patientId: "PT-2302", age: 58, specialty: "Nephrology", condition: "Severe Hyperkalemic Emergency (K+ 7.4 mEq/L) with Bradycardia", history: "End Stage Renal Disease on maintenance HD, Missed 2 sessions", urgency: "Critical", hospital: "Ivy Hospital Mohali", time: "02:10 PM", status: "Pending" },
  { id: "REQ-113", patientId: "PT-2303", age: 39, specialty: "Obstetrics / GYN", condition: "Severe Post-Partum Hemorrhage with Hypovolemic Shock", history: "Emergency LSCS at peripheral nursing home, Hb 5.1 g/dL", urgency: "Critical", hospital: "Healing Touch Hospital Zirakpur", time: "02:35 PM", status: "Pending" },
  { id: "REQ-114", patientId: "PT-2304", age: 52, specialty: "Cardiology", condition: "Acute NSTEMI with Severe Left Ventricular Dysfunction", history: "Type 2 Diabetes, Hypertension, Cardiac Trop-I > 15 ng/mL", urgency: "High", hospital: "Care Hospital Zirakpur", time: "03:00 PM", status: "Pending" },
  { id: "REQ-115", patientId: "PT-2305", age: 65, specialty: "Neurology", condition: "Subarachnoid Hemorrhage (Hunt & Hess Grade 3)", history: "Sudden thunderclap headache, GCS 11/15, Marked nuchal rigidity", urgency: "Critical", hospital: "Alchemist Hospital Panchkula", time: "03:20 PM", status: "Pending" },
  { id: "REQ-116", patientId: "PT-2306", age: 19, specialty: "Trauma", condition: "Severe Industrial Crush Injury Left Forearm & Hand", history: "Factory conveyor belt accident, Multiple extensor tendon cuts", urgency: "High", hospital: "ESI Hospital Mohali", time: "03:45 PM", status: "Pending" },
  { id: "REQ-117", patientId: "PT-2307", age: 76, specialty: "Gastroenterology", condition: "Massive Upper GI Bleeding with Hematemesis & Melena", history: "Hepatitis C Cirrhosis, Grade 3 Esophageal Varices", urgency: "High", hospital: "Nehru Hospital (PGIMER Apex Cardio)", time: "04:10 PM", status: "Accepted" },
  { id: "REQ-118", patientId: "PT-2308", age: 45, specialty: "Cardiology", condition: "Acute Aortic Dissection (Stanford Type A)", history: "Severe tearing retrosternal pain radiating to back, Asymmetric pulses", urgency: "Critical", hospital: "Paras Hospital Panchkula", time: "04:30 PM", status: "Pending" }
];

function getRequests() {
  let reqs = null;
  try {
    reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "null");
  } catch (e) {
    reqs = null;
  }
  if (!reqs || reqs.length < 8) {
    reqs = SEED_REQUESTS;
    localStorage.setItem("referbridge_requests", JSON.stringify(reqs));
  }
  return reqs;
}

function saveRequests(reqs) {
  localStorage.setItem("referbridge_requests", JSON.stringify(reqs));
}

let allRequests = getRequests();
let currentFilter = "All";
let searchQuery = "";
let urgencyFilter = "All";

function updateCounts() {
  let pending = 0, accepted = 0, rejected = 0;
  allRequests.forEach((r) => {
    if (r.status === "Pending") pending++;
    else if (r.status === "Accepted") accepted++;
    else if (r.status === "Rejected") rejected++;
  });

  const countAll = document.getElementById("countAll");
  const countPending = document.getElementById("countPending");
  const countAccepted = document.getElementById("countAccepted");
  const countRejected = document.getElementById("countRejected");

  if (countAll) countAll.textContent = allRequests.length;
  if (countPending) countPending.textContent = pending;
  if (countAccepted) countAccepted.textContent = accepted;
  if (countRejected) countRejected.textContent = rejected;
}

function setRequestStatus(id, newStatus) {
  const req = allRequests.find((r) => r.id === id);
  if (!req) return;

  req.status = newStatus;
  saveRequests(allRequests);
  updateCounts();
  renderRequests();

  if (window.showToast) {
    if (newStatus === "Accepted") {
      window.showToast(`Referral ${id} Accepted — Bed reserved & Ambulance inbound`, "success", "✓");
    } else {
      window.showToast(`Referral ${id} Declined — Rerouted to next regional facility`, "warning", "✕");
    }
  }
}

const REFERRAL_PARTNER_HOSPITALS = [
  { id: "H1", name: "PGIMER Chandigarh", category: "Government", city: "Chandigarh", distanceKm: 1.5, specialties: ["Cardiology", "Trauma", "ICU"], totalBeds: 1900, availableBeds: 14, icuAvailable: 2 },
  { id: "H2", name: "GMCH Sector 32", category: "Government", city: "Chandigarh", distanceKm: 4.2, specialties: ["Cardiology", "Burn Unit", "Emergency", "ICU"], totalBeds: 900, availableBeds: 45, icuAvailable: 4 },
  { id: "H3", name: "GMSH Sector 16", category: "Government", city: "Chandigarh", distanceKm: 2.8, specialties: ["Emergency Care", "Cardiology", "General Medicine", "ICU"], totalBeds: 500, availableBeds: 32, icuAvailable: 5 },
  { id: "H4", name: "Nehru Hospital (PGIMER Apex Cardio)", category: "Government", city: "Chandigarh", distanceKm: 1.6, specialties: ["Cardiology", "Cardiothoracic Surgery", "Advanced ICU"], totalBeds: 800, availableBeds: 18, icuAvailable: 6 },
  { id: "H5", name: "Civil Hospital Mohali", category: "Government", city: "Mohali", distanceKm: 6.2, specialties: ["Emergency", "General Medicine", "Cardiology", "ICU"], totalBeds: 300, availableBeds: 28, icuAvailable: 3 },
  { id: "H6", name: "PGI Satellite Centre Mohali", category: "Government", city: "Mohali", distanceKm: 5.5, specialties: ["Cardiology", "Neurology", "Emergency", "ICU"], totalBeds: 200, availableBeds: 31, icuAvailable: 4 },
  { id: "H7", name: "ESI Hospital Mohali", category: "Government", city: "Mohali", distanceKm: 7.1, specialties: ["General Medicine", "Emergency", "Surgery"], totalBeds: 150, availableBeds: 22, icuAvailable: 2 },
  { id: "H8", name: "Civil Hospital Panchkula", category: "Government", city: "Panchkula", distanceKm: 8.5, specialties: ["Emergency", "Trauma", "Cardiology", "ICU"], totalBeds: 300, availableBeds: 24, icuAvailable: 3 },
  { id: "H9", name: "General Hospital Sector 6 Panchkula", category: "Government", city: "Panchkula", distanceKm: 9.8, specialties: ["Emergency", "General Medicine", "Pediatrics"], totalBeds: 120, availableBeds: 18, icuAvailable: 2 },
  { id: "H10", name: "Govt Ayurvedic Hospital Zirakpur", category: "Government", city: "Zirakpur", distanceKm: 11.5, specialties: ["General Medicine", "Ayurveda"], totalBeds: 80, availableBeds: 14, icuAvailable: 0 },
  { id: "H11", name: "AIIMS New Delhi", category: "Government", city: "Delhi NCR", distanceKm: 245.0, specialties: ["Cardiology", "CTVS", "Trauma Center", "Critical Care ICU"], totalBeds: 2500, availableBeds: 42, icuAvailable: 12 },
  { id: "H12", name: "Safdarjung Hospital & VMMC", category: "Government", city: "Delhi NCR", distanceKm: 246.0, specialties: ["Cardiology", "Emergency Medicine", "Burn & Trauma Center", "ICU"], totalBeds: 1800, availableBeds: 35, icuAvailable: 8 },
  { id: "H15", name: "Fortis Escorts Heart Institute", category: "Private", city: "Delhi NCR", distanceKm: 252.0, specialties: ["Cardiology", "Cardiac Surgery", "Pediatric Cardiac ICU"], totalBeds: 310, availableBeds: 29, icuAvailable: 14 },
  { id: "H16", name: "Lotus Care Hospital", category: "Private", city: "Chandigarh", distanceKm: 3.2, specialties: ["Cardiology", "Orthopedics", "Emergency Care", "ICU"], totalBeds: 180, availableBeds: 24, icuAvailable: 6 },
  { id: "H17", name: "Fortis Hospital Mohali", category: "Private", city: "Mohali", distanceKm: 5.8, specialties: ["Cardiology", "Oncology", "Orthopaedics", "ICU"], totalBeds: 262, availableBeds: 24, icuAvailable: 6 },
  { id: "H18", name: "Max Super Speciality Mohali", category: "Private", city: "Mohali", distanceKm: 6.4, specialties: ["Cardiology", "Neurology", "Advanced ICU"], totalBeds: 200, availableBeds: 19, icuAvailable: 4 },
  { id: "H19", name: "Alchemist Hospital Panchkula", category: "Private", city: "Panchkula", distanceKm: 9.1, specialties: ["Cardiology", "Neurology", "Vascular Surgery", "ICU"], totalBeds: 250, availableBeds: 12, icuAvailable: 3 },
  { id: "H20", name: "Sunrise Multispecialty", category: "Private", city: "Mohali", distanceKm: 6.8, specialties: ["Pediatrics", "Trauma", "General Surgery"], totalBeds: 140, availableBeds: 8, icuAvailable: 2 },
  { id: "H21", name: "Paras Hospital Panchkula", category: "Private", city: "Panchkula", distanceKm: 10.5, specialties: ["Cardiology", "Neurology", "Orthopedics", "ICU"], totalBeds: 180, availableBeds: 22, icuAvailable: 5 },
  { id: "H22", name: "Riverside Hospital", category: "Private", city: "Zirakpur", distanceKm: 12.1, specialties: ["Trauma", "Orthopedics", "Critical Care", "Cardiology"], totalBeds: 210, availableBeds: 38, icuAvailable: 9 },
  { id: "H23", name: "Healing Touch Hospital Zirakpur", category: "Private", city: "Zirakpur", distanceKm: 11.8, specialties: ["General Medicine", "Emergency", "Surgery", "ICU"], totalBeds: 120, availableBeds: 16, icuAvailable: 3 },
  { id: "H24", name: "Ivy Hospital Mohali", category: "Private", city: "Mohali", distanceKm: 6.0, specialties: ["Cardiology", "Neurology", "Trauma", "ICU"], totalBeds: 250, availableBeds: 27, icuAvailable: 7 },
  { id: "H26", name: "Grecian Hospital Mohali", category: "Private", city: "Mohali", distanceKm: 5.9, specialties: ["Cardiology", "Neurology", "Orthopedics", "ICU"], totalBeds: 200, availableBeds: 20, icuAvailable: 5 },
  { id: "H27", name: "Columbia Asia Hospital Panchkula", category: "Private", city: "Panchkula", distanceKm: 9.5, specialties: ["Cardiology", "General Surgery", "Pediatrics", "ICU"], totalBeds: 170, availableBeds: 19, icuAvailable: 4 },
  { id: "H28", name: "Care Hospital Zirakpur", category: "Private", city: "Zirakpur", distanceKm: 12.5, specialties: ["General Medicine", "Emergency", "Orthopedics"], totalBeds: 100, availableBeds: 13, icuAvailable: 2 }
];

function calcTransitMins(distanceKm) {
  let mins;
  if (distanceKm < 5) {
    mins = distanceKm * 3.5;
  } else if (distanceKm <= 15) {
    mins = distanceKm * 2.8;
  } else {
    mins = distanceKm * 2.0;
  }
  return Math.round(mins);
}

function openDenyAndRerouteModal(id) {
  const req = allRequests.find((r) => r.id === id);
  if (!req) return;

  const modal = document.getElementById("modalDenyReroute");
  const modalBody = document.getElementById("denyModalBody");
  const modalFoot = document.getElementById("denyModalFoot");
  if (!modal || !modalBody || !modalFoot) return;

  const LOCAL_CITIES = ["Chandigarh", "Mohali", "Panchkula", "Zirakpur"];
  const isCritical = req.urgency === "Critical";

  const isCardio = req.specialty.toLowerCase().includes("cardio") || 
                   req.condition.toLowerCase().includes("cardiac") ||
                   req.condition.toLowerCase().includes("infarction") ||
                   req.condition.toLowerCase().includes("heart") ||
                   req.condition.toLowerCase().includes("angina") ||
                   req.condition.toLowerCase().includes("coronary") ||
                   req.condition.toLowerCase().includes("shock");

  let candidates = [];
  if (isCardio) {
    candidates = REFERRAL_PARTNER_HOSPITALS.filter(h => 
      LOCAL_CITIES.includes(h.city) &&
      h.specialties.some(s => s.toLowerCase().includes("cardio")) && 
      (h.icuAvailable > 0 || h.availableBeds > 0)
    );
  } else {
    candidates = REFERRAL_PARTNER_HOSPITALS.filter(h => 
      LOCAL_CITIES.includes(h.city) &&
      h.specialties.some(s => s.toLowerCase().includes(req.specialty.toLowerCase())) &&
      (h.icuAvailable > 0 || h.availableBeds > 0)
    );
  }

  // Fallback to Delhi NCR if no local candidates
  if (candidates.length === 0) {
    if (isCardio) {
      candidates = REFERRAL_PARTNER_HOSPITALS.filter(h => 
        h.specialties.some(s => s.toLowerCase().includes("cardio")) && 
        (h.icuAvailable > 0 || h.availableBeds > 0)
      );
    } else {
      candidates = REFERRAL_PARTNER_HOSPITALS.filter(h => 
        h.specialties.some(s => s.toLowerCase().includes(req.specialty.toLowerCase())) &&
        (h.icuAvailable > 0 || h.availableBeds > 0)
      );
    }
  }

  if (candidates.length === 0) {
    candidates = REFERRAL_PARTNER_HOSPITALS.filter(h => h.availableBeds > 0);
  }

  // Sort based on urgency
  if (isCritical) {
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    candidates.sort((a, b) => (b.icuAvailable * 2 + b.availableBeds) - (a.icuAvailable * 2 + a.availableBeds));
  }

  // Separate local vs fallback for display label
  const localCandidates = candidates.filter(h => LOCAL_CITIES.includes(h.city));
  const isShowingFallback = localCandidates.length === 0;
  const topRecommendations = candidates.slice(0, 3);
  let defaultSelectedHosp = topRecommendations[0] || REFERRAL_PARTNER_HOSPITALS[0];

  const specLabel = isCardio ? "Cardiology / Heart Related Emergency" : req.specialty;

  modalBody.innerHTML = `
    <div style="padding:12px 14px; border-radius:10px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-size:11px; font-weight:700; color:var(--rb-red);">CASE ${req.id} · PATIENT ${req.patientId} (${req.age} yrs)</span>
        <span class="urgency-badge ${req.urgency.toLowerCase()}">${req.urgency.toUpperCase()}</span>
      </div>
      <strong style="display:block; font-size:14px; color:var(--rb-text-main); margin-bottom:4px;">
        Diagnosis: ${req.condition}
      </strong>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:11px; color:var(--rb-text-muted);">Specialty Track:</span>
        <span style="font-size:11px; font-weight:700; color:var(--rb-teal); background:rgba(20,228,184,0.1); padding:2px 8px; border-radius:4px;">
          ${isCardio ? '❤️ ' : '🏥 '}${specLabel}
        </span>
      </div>
    </div>

    <div style="margin-bottom:16px; padding:10px 14px; border-radius:8px; background:rgba(245,158,11,0.08); border:1px dashed rgba(245,158,11,0.3); font-size:12px; color:var(--rb-text-main); display:flex; align-items:center; gap:10px;">
      <span style="font-size:20px;">⚠️</span>
      <div>
        <strong>Local Facility Unable to Accept (Beds/ICU Full):</strong>
        Select a specialized partner hospital below to reroute this patient so life-saving critical care begins immediately.
      </div>
    </div>

    <div style="margin-bottom:14px; padding:10px 14px; border-radius:8px; background:${isCritical ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.08)'}; border:1px solid ${isCritical ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.3)'}; font-size:12px; font-weight:700; color:${isCritical ? 'var(--rb-red)' : 'var(--rb-green)'}; display:flex; align-items:center; gap:10px;">
      <span style="font-size:18px;">${isCritical ? '⚡' : '✅'}</span>
      <span>${isCritical ? '⚡ CRITICAL CASE — Sorted by FASTEST TRANSIT TIME (kam time me pahunche). Every second counts!' : '✅ Stable Transfer — Safe transit, itna time lagega par koi dikkat nahi hogi. Patient will arrive safely.'}</span>
    </div>

    ${isShowingFallback ? `<div style="margin-bottom:12px; padding:8px 12px; border-radius:7px; background:rgba(245,158,11,0.08); border:1px dashed rgba(245,158,11,0.3); font-size:11px; color:var(--rb-yellow); font-weight:600;">⚠️ Worst-Case Fallback — No local (Chandigarh/Mohali/Panchkula/Zirakpur) partners available. Showing national referral centers.</div>` : ''}

    <div style="margin-bottom:16px;">
      <label style="display:block; font-size:12px; font-weight:700; color:var(--rb-text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.04em;">
        ★ Top Recommended Facilities for ${isCardio ? 'Cardio / Heart Emergency' : req.specialty}:
      </label>
      <div style="display:flex; flex-direction:column; gap:8px;" id="recommendationCardsContainer">
        ${topRecommendations.map((h, idx) => `
          <label style="display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border-radius:10px; border:1px solid ${idx === 0 ? 'var(--rb-teal)' : 'var(--rb-border)'}; background:${idx === 0 ? 'rgba(20,228,184,0.08)' : 'rgba(255,255,255,0.02)'}; cursor:pointer; transition:all 0.2s;">
            <input type="radio" name="rerouteHospRadio" value="${h.id}" ${idx === 0 ? 'checked' : ''} style="margin-top:4px;" onchange="updateSelectedReroute('${h.id}')">
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:13.5px; color:var(--rb-text-main);">${h.name}</strong>
                <span style="font-size:9px; font-weight:800; background:${h.category === 'Government' ? '#0284c7' : '#8b5cf6'}; color:#fff; padding:2px 6px; border-radius:4px;">${h.category.toUpperCase()}</span>
              </div>
              <div style="font-size:11.5px; color:var(--rb-text-muted); margin:3px 0;">
                📍 ${h.city} · ${h.distanceKm} km away · ${h.specialties.join(", ")}
              </div>
              <div style="display:flex; gap:14px; font-size:11.5px; flex-wrap:wrap;">
                <span style="color:var(--rb-green); font-weight:700;">✓ Available Beds: ${h.availableBeds}</span>
                <span style="color:var(--rb-cyan); font-weight:700;">❤️ ICU Beds Open: ${h.icuAvailable}</span>
                <span style="color:var(--rb-yellow); font-weight:700;">🕐 Transit ETA: ~${calcTransitMins(h.distanceKm)} mins</span>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>

    <div style="margin-bottom:14px;">
      <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Or Select Any Other Network Hospital:</label>
      <select id="rerouteCustomSelect" onchange="updateSelectedReroute(this.value)" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px;">
        <option value="">-- Choose from full 25+ partner hospital network --</option>
        ${REFERRAL_PARTNER_HOSPITALS.map(h => `<option value="${h.id}">${h.name} (${h.category}) · ${h.city} [${h.availableBeds} Beds, ${h.icuAvailable} ICU] · ~${calcTransitMins(h.distanceKm)} mins</option>`).join('')}
      </select>
    </div>

    <div style="margin-bottom:14px; padding:12px 14px; border-radius:10px; background:rgba(20,228,184,0.06); border:1px solid rgba(20,228,184,0.2);">
      <p style="font-size:12px; font-weight:700; color:var(--rb-teal); margin:0 0 10px; text-transform:uppercase; letter-spacing:0.05em;">
        Patient Travel Arrangement (Choose Mode):
      </p>

      <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; margin-bottom:10px; padding:8px 10px; border-radius:8px; background:rgba(34,200,255,0.06); border:1px solid rgba(34,200,255,0.25);">
        <input type="radio" name="rerouteTransitChoice" value="Ambulance" checked style="margin-top:3px;">
        <div>
          <strong style="font-size:13px; display:block; color:var(--rb-cyan);">🚑 Book Hospital ALS Ambulance</strong>
          <span style="font-size:11.5px; color:var(--rb-text-muted);">Paramedic team with portable ventilator dispatched immediately to transfer corridor.</span>
        </div>
      </label>

      <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; margin-bottom:12px; padding:8px 10px; border-radius:8px; background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.25);">
        <input type="radio" name="rerouteTransitChoice" value="Personal Vehicle" style="margin-top:3px;">
        <div>
          <strong style="font-size:13px; display:block; color:#fbbf24;">🚗 Patient Family Travelling by Personal Vehicle (Own Car / Taxi)</strong>
          <span style="font-size:11.5px; color:var(--rb-text-muted);">No ambulance needed. Attendants will drive patient directly. An Express Casualty Gate Pass is issued so you bypass OPD/registration lines.</span>
        </div>
      </label>

      <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; padding-top:8px; border-top:1px dashed var(--rb-border);">
        <input type="checkbox" id="chkForwardRecords" checked style="margin-top:3px;">
        <div>
          <strong style="font-size:13px; display:block; color:var(--rb-green);">📋 Forward Past Medical Records (Formalities Waived)</strong>
          <span style="font-size:11.5px; color:var(--rb-text-muted);">Digital pre-admission dossier sent to receiving hospital — patient skips admission formalities whether by car or ambulance.</span>
        </div>
      </label>
    </div>

    <div>
      <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Denial Reason & Clinical Handoff Note:</label>
      <textarea id="rerouteNotes" rows="2" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px; font-family:var(--font-body);">${isCardio ? 'Local cardiology ICU & Cath Lab at capacity; rerouting acute heart emergency to specialized partner center with open ICU.' : 'Hospital ward & critical beds currently occupied; transfer rerouted to partner facility.'}</textarea>
    </div>
  `;

  modalFoot.innerHTML = `
    <button type="button" class="btn-ghost" onclick="closeModal('modalDenyReroute')">Cancel</button>
    <button type="button" class="btn-req-reject" onclick="finalizeDeclineWithoutReroute('${req.id}')" title="Strictly decline without suggesting another hospital">Decline Without Reroute</button>
    <button type="button" class="btn-primary" id="btnConfirmRerouteTransfer" onclick="finalizeDenyAndReroute('${req.id}')" style="background:linear-gradient(135deg, #10b981, #059669); border:none;">
      🚀 Reroute to Selected Hospital
    </button>
  `;

  window.activeRerouteHospitalId = defaultSelectedHosp.id;

  if (window.openModal) {
    window.openModal("modalDenyReroute");
  } else {
    modal.classList.remove("hidden");
  }
}

window.updateSelectedReroute = function(hospId) {
  if (!hospId) return;
  window.activeRerouteHospitalId = hospId;
  const radios = document.querySelectorAll('input[name="rerouteHospRadio"]');
  radios.forEach(r => {
    r.checked = (r.value === hospId);
  });
};

window.finalizeDenyAndReroute = function(id) {
  const req = allRequests.find((r) => r.id === id);
  if (!req) return;

  const selectedHosp = REFERRAL_PARTNER_HOSPITALS.find(h => h.id === window.activeRerouteHospitalId) || REFERRAL_PARTNER_HOSPITALS[0];
  const notesEl = document.getElementById("rerouteNotes");
  const notes = notesEl ? notesEl.value.trim() : "";

  const transitRadios = document.querySelectorAll('input[name="rerouteTransitChoice"]');
  let chosenTransit = "Ambulance";
  transitRadios.forEach(r => { if (r.checked) chosenTransit = r.value; });

  const chkForwardRecords = document.getElementById("chkForwardRecords");
  const recordsForwarded = chkForwardRecords ? chkForwardRecords.checked : true;
  const isAmbulance = chosenTransit === "Ambulance";

  req.status = `Rerouted to ${selectedHosp.name}`;
  req.reroutedTo = selectedHosp.name;
  req.reroutedNotes = notes;
  req.reroutedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  req.transitMode = chosenTransit;
  req.ambulanceDispatched = isAmbulance;
  req.personalVehicle = !isAmbulance;
  req.recordsForwarded = recordsForwarded;

  saveRequests(allRequests);
  updateCounts();
  renderRequests();

  if (window.closeModal) window.closeModal("modalDenyReroute");
  else document.getElementById("modalDenyReroute").classList.add("hidden");

  if (window.showToast) {
    const toastParts = [`Referral ${id} REROUTED → ${selectedHosp.name}`];
    if (isAmbulance) {
      toastParts.push("🚑 ALS Ambulance Dispatched!");
    } else {
      toastParts.push("🚗 Personal Vehicle Pass Issued!");
    }
    if (recordsForwarded) toastParts.push("📋 Records Forwarded — Formalities Waived!");
    window.showToast(toastParts.join(" | "), "success", isAmbulance ? "🚑" : "🚗");

    if (isAmbulance) {
      setTimeout(() => {
        window.showToast(`ALS Ambulance dispatched to ${selectedHosp.name} corridor with ventilator standby`, "info", "🚑");
      }, 700);
    } else {
      setTimeout(() => {
        window.showToast(`Express Casualty Gate Pass active at ${selectedHosp.name} — Direct bay intake!`, "info", "🚗");
      }, 700);
    }
  }
};

window.finalizeDeclineWithoutReroute = function(id) {
  const req = allRequests.find((r) => r.id === id);
  if (!req) return;

  req.status = "Rejected";
  saveRequests(allRequests);
  updateCounts();
  renderRequests();

  if (window.closeModal) window.closeModal("modalDenyReroute");
  else document.getElementById("modalDenyReroute").classList.add("hidden");

  if (window.showToast) {
    window.showToast(`Referral ${id} Declined without reroute.`, "warning", "✕");
  }
};

function openCaseModal(id) {
  const req = allRequests.find((r) => r.id === id);
  if (!req) return;

  const modalTitle = document.getElementById("modalCaseTitle");
  const modalBody = document.getElementById("modalCaseBody");
  const modalFoot = document.getElementById("modalCaseFoot");

  if (modalTitle) modalTitle.textContent = `${req.id} — Clinical Dossier (${req.specialty})`;

  if (modalBody) {
    const isCritical = req.urgency === "Critical";
    const hr = isCritical ? "118 bpm" : "78 bpm";
    const bp = isCritical ? "165/105 mmHg" : "124/82 mmHg";
    const spo2 = isCritical ? "91% (O2 Mask)" : "98% (Room Air)";

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding:12px 16px; border-radius:10px; background:rgba(34,200,255,0.08); border:1px solid var(--rb-border);">
        <div>
          <span style="font-size:11px; color:var(--rb-text-muted);">Transfer Status</span>
          <strong style="display:block; font-size:15px; text-transform:uppercase; color:${req.status === 'Accepted' ? 'var(--rb-green)' : (req.status === 'Rejected' ? 'var(--rb-red)' : 'var(--rb-yellow)')};">${req.status}</strong>
        </div>
        <div style="text-align:right;">
          <span style="font-size:11px; color:var(--rb-text-muted);">Urgency Protocol</span>
          <span class="urgency-badge ${req.urgency.toLowerCase()}">${req.urgency.toUpperCase()}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; text-align:center;">
        <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
          <small style="font-size:10px; color:var(--rb-text-muted);">Heart Rate</small>
          <strong style="display:block; font-size:14px; color:var(--rb-teal);">${hr}</strong>
        </div>
        <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
          <small style="font-size:10px; color:var(--rb-text-muted);">Blood Pressure</small>
          <strong style="display:block; font-size:14px;">${bp}</strong>
        </div>
        <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
          <small style="font-size:10px; color:var(--rb-text-muted);">Oxygen Saturation</small>
          <strong style="display:block; font-size:14px; color:var(--rb-cyan);">${spo2}</strong>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
        <div style="padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--rb-border);">
          <span style="font-size:11px; color:var(--rb-text-muted);">Patient ID / Age</span>
          <strong style="display:block; font-size:13.5px; margin-top:2px;">${req.patientId} · ${req.age} yrs</strong>
        </div>
        <div style="padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--rb-border);">
          <span style="font-size:11px; color:var(--rb-text-muted);">Referring Facility</span>
          <strong style="display:block; font-size:13.5px; margin-top:2px;">${req.hospital}</strong>
        </div>
      </div>

      <div style="margin-bottom:14px; padding:12px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--rb-border);">
        <span style="font-size:11px; color:var(--rb-text-muted);">Clinical Diagnosis / Condition</span>
        <strong style="display:block; font-size:14px; color:var(--rb-text-main); margin-top:2px;">${req.condition}</strong>
        <p style="font-size:12px; color:var(--rb-text-muted); margin-top:4px;">Medical History: ${req.history}</p>
      </div>

      ${req.personalVehicle ? `
        <div style="padding:10px 14px; border-radius:8px; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">🚗</span>
          <div>
            <strong style="color:#fbbf24; font-size:12.5px;">Personal Vehicle Travel Arrangement:</strong>
            <div style="font-size:11.5px; color:var(--rb-text-muted);">Attendants transporting patient in private car. Express Casualty Gate Pass pre-cleared for direct bay intake.</div>
          </div>
        </div>
      ` : `
        <div style="padding:10px 14px; border-radius:8px; background:rgba(20,228,184,0.08); border:1px dashed rgba(20,228,184,0.3); display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">🚑</span>
          <span style="font-size:12px; color:var(--rb-text-main);"><strong>Ambulance Unit ETA:</strong> Approx. 14 mins with telemetry uplink active.</span>
        </div>
      `}

      ${req.recordsForwarded ? `
        <div style="margin-top:10px; padding:10px 14px; border-radius:8px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">📋</span>
          <div>
            <strong style="color:var(--rb-green); font-size:12.5px;">Digital Pre-Admission Dossier (Paperwork Waived):</strong>
            <div style="font-size:11.5px; color:var(--rb-text-muted);">Past medical records, vitals &amp; EHR sent digitally to receiving hospital. Patient bypasses all registration lines and formalities directly into triage.</div>
          </div>
        </div>
      ` : ''}
      ${req.ambulanceDispatched ? `
        <div style="margin-top:8px; padding:10px 14px; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">🚨</span>
          <div>
            <strong style="color:var(--rb-cyan); font-size:12.5px;">ALS Emergency Transfer Active:</strong>
            <div style="font-size:11.5px; color:var(--rb-text-muted);">Paramedic team &amp; portable ventilator assigned. Priority corridor dispatched.</div>
          </div>
        </div>
      ` : ''}
    `;
  }

  if (modalFoot) {
    if (req.status === "Pending") {
      modalFoot.innerHTML = `
        <button type="button" class="btn-ghost" onclick="closeModal('caseModal')">Close</button>
        <button type="button" class="btn-req-reject" onclick="closeModal('caseModal'); openDenyAndRerouteModal('${req.id}');">Decline &amp; Reroute</button>
        <button type="button" class="btn-primary" onclick="setRequestStatus('${req.id}', 'Accepted'); closeModal('caseModal');">✓ Accept Referral</button>
      `;
    } else {
      modalFoot.innerHTML = `
        <button type="button" class="btn-ghost" onclick="closeModal('caseModal')">Close</button>
        <span style="font-size:12px; color:var(--rb-text-muted); margin-right:auto;">Decision recorded as: <strong>${req.status}</strong></span>
      `;
    }
  }

  if (window.openModal) window.openModal("caseModal");
}

function renderRequests() {
  const container = document.getElementById("requestList");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  container.innerHTML = "";

  const filtered = allRequests.filter((r) => {
    const matchStatus = currentFilter === "All" || r.status === currentFilter;
    const matchUrgency = urgencyFilter === "All" || r.urgency === urgencyFilter;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      r.id.toLowerCase().includes(query) ||
      r.patientId.toLowerCase().includes(query) ||
      r.condition.toLowerCase().includes(query) ||
      r.hospital.toLowerCase().includes(query) ||
      r.specialty.toLowerCase().includes(query);

    return matchStatus && matchUrgency && matchSearch;
  });

  if (filtered.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  filtered.forEach((req) => {
    const card = document.createElement("article");
    card.className = `request-card ${req.status.toLowerCase()}`;

    const statusClass = req.status.toLowerCase();
    const urgencyClass = req.urgency.toLowerCase();

    let actionsHtml = "";
    if (req.status === "Pending") {
      actionsHtml = `
        <button type="button" class="btn-req-accept" data-id="${req.id}" title="Accept and reserve bed">✓ Accept</button>
        <button type="button" class="btn-req-reject" data-id="${req.id}" title="Decline and route to next hospital">✕ Decline</button>
        <button type="button" class="btn-req-view" data-id="${req.id}">Inspect Dossier</button>
      `;
    } else {
      actionsHtml = `
        <div class="status-indicator-chip ${statusClass}">${req.status.toUpperCase()}</div>
        <button type="button" class="btn-req-view" data-id="${req.id}">View Dossier</button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="req-patient-head">
          <span class="req-id">${req.id}</span>
          <span class="meta-sep">•</span>
          <span class="req-time">${req.time}</span>
        </div>
        <h3 class="req-condition">${req.condition}</h3>
        <p class="req-meta">Patient: <strong>${req.patientId}</strong> (${req.age} yrs)</p>
      </div>

      <div class="req-details-col">
        <div class="req-badge-row">
          <span class="urgency-badge ${urgencyClass}">${req.urgency.toUpperCase()}</span>
          <span class="specialty-tag">${req.specialty}</span>
          ${req.personalVehicle ? '<span style="font-size:9.5px; font-weight:800; background:rgba(251,191,36,0.15); color:#fbbf24; padding:2px 6px; border-radius:4px; border:1px solid rgba(251,191,36,0.3);">🚗 PERSONAL CAR</span>' : ''}
          ${req.ambulanceDispatched ? '<span style="font-size:9.5px; font-weight:800; background:rgba(34,200,255,0.15); color:var(--rb-cyan); padding:2px 6px; border-radius:4px; border:1px solid rgba(34,200,255,0.3);">🚑 ALS AMBULANCE</span>' : ''}
        </div>
        <p class="req-from">From: <strong>${req.hospital}</strong></p>
        <p class="req-history">History: ${req.history}</p>
      </div>

      <div class="req-actions-col">
        ${actionsHtml}
      </div>
    `;

    // Bind card action buttons
    const acceptBtn = card.querySelector(".btn-req-accept");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => setRequestStatus(req.id, "Accepted"));
    }

    const rejectBtn = card.querySelector(".btn-req-reject");
    if (rejectBtn) {
      rejectBtn.addEventListener("click", () => openDenyAndRerouteModal(req.id));
    }

    const viewBtn = card.querySelector(".btn-req-view");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => openCaseModal(req.id));
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Filter Tabs
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".filter-tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");
      currentFilter = this.getAttribute("data-status");
      renderRequests();
    });
  });

  // Search Input
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = this.value.trim();
      renderRequests();
    });
  }

  // Urgency Dropdown
  const urgencySelect = document.getElementById("urgencyFilter");
  if (urgencySelect) {
    urgencySelect.addEventListener("change", function () {
      urgencyFilter = this.value;
      renderRequests();
    });
  }

  updateCounts();
  renderRequests();
});
