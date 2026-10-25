/* ==========================================================================
   REFERBRIDGE — BED MANAGEMENT CONTROLLER (beds.js)
   ========================================================================== */

function getProfile() {
  let profile = JSON.parse(localStorage.getItem("referbridge_profile") || "null");
  if (!profile) {
    profile = {
      hospitalName: "ReferBridge General Hospital",
      hospitalId: "RB-1001",
      location: "Sector 12, Chandigarh",
      contact: "+91 98765 43210",
      specialties: "Cardiology, Neurology, Orthopedics",
      totalBeds: 120,
      occupiedBeds: 78,
      totalICU: 20,
      occupiedICU: 14
    };
    localStorage.setItem("referbridge_profile", JSON.stringify(profile));
  }
  return profile;
}

function saveProfile(profile) {
  localStorage.setItem("referbridge_profile", JSON.stringify(profile));
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  localStorage.setItem("referbridge_beds_updated", time);
}

function computeStatus(availableBeds, totalBeds) {
  if (totalBeds === 0) return { label: "Unknown", css: "" };
  const ratio = availableBeds / totalBeds;
  if (ratio <= 0) return { label: "Full", css: "red" };
  if (ratio < 0.2) return { label: "Limited", css: "yellow" };
  return { label: "Available", css: "green" };
}

let profile = getProfile();

function render() {
  const generalAvailable = Math.max((profile.totalBeds || 0) - (profile.occupiedBeds || 0), 0);
  const icuAvailable = Math.max((profile.totalICU || 0) - (profile.occupiedICU || 0), 0);

  const hospitalName = document.getElementById("bedsHospitalName");
  const hospitalLocation = document.getElementById("bedsHospitalLocation");
  const hospitalSpecialties = document.getElementById("bedsHospitalSpecialties");
  const overviewGeneral = document.getElementById("overviewGeneralTotal");
  const overviewICU = document.getElementById("overviewICUTotal");
  const overviewAvailable = document.getElementById("overviewAvailable");
  const updatedEl = document.getElementById("overviewUpdated");

  if (hospitalName) hospitalName.textContent = profile.hospitalName || "ReferBridge General Hospital";
  if (hospitalLocation) hospitalLocation.textContent = profile.location || "Sector 12, Chandigarh";
  if (hospitalSpecialties) hospitalSpecialties.textContent = profile.specialties || "General Medicine, Emergency";
  if (overviewGeneral) overviewGeneral.textContent = profile.totalBeds || 0;
  if (overviewICU) overviewICU.textContent = profile.totalICU || 0;
  if (overviewAvailable) overviewAvailable.textContent = `${generalAvailable} beds`;
  if (updatedEl) updatedEl.textContent = localStorage.getItem("referbridge_beds_updated") || "Just now";

  // General Stepper
  document.getElementById("generalTotalLabel").textContent = `Total: ${profile.totalBeds}`;
  document.getElementById("generalOccupied").textContent = profile.occupiedBeds;
  document.getElementById("generalOccupiedEcho").textContent = profile.occupiedBeds;
  document.getElementById("generalTotalEcho").textContent = profile.totalBeds;
  document.getElementById("generalAvailable").textContent = generalAvailable;

  const generalPct = profile.totalBeds > 0 ? (profile.occupiedBeds / profile.totalBeds) * 100 : 0;
  document.getElementById("generalBar").style.width = `${Math.min(generalPct, 100)}%`;

  // ICU Stepper
  document.getElementById("icuTotalLabel").textContent = `Total: ${profile.totalICU}`;
  document.getElementById("icuOccupied").textContent = profile.occupiedICU;
  document.getElementById("icuOccupiedEcho").textContent = profile.occupiedICU;
  document.getElementById("icuTotalEcho").textContent = profile.totalICU;
  document.getElementById("icuAvailable").textContent = icuAvailable;

  const icuPct = profile.totalICU > 0 ? (profile.occupiedICU / profile.totalICU) * 100 : 0;
  document.getElementById("icuBar").style.width = `${Math.min(icuPct, 100)}%`;

  // Stepper Disabled States
  document.getElementById("generalMinus").disabled = profile.occupiedBeds <= 0;
  document.getElementById("generalPlus").disabled = profile.occupiedBeds >= profile.totalBeds;
  document.getElementById("icuMinus").disabled = profile.occupiedICU <= 0;
  document.getElementById("icuPlus").disabled = profile.occupiedICU >= profile.totalICU;

  // Status Badge
  const status = computeStatus(generalAvailable, profile.totalBeds || 1);
  const badge = document.getElementById("hospitalStatusBadge");
  const dot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  if (statusText) statusText.textContent = status.label;
  if (badge && dot) {
    if (status.css === "yellow") {
      badge.style.background = "var(--rb-yellow-soft)";
      badge.style.color = "var(--rb-yellow)";
      badge.style.borderColor = "rgba(245,183,56,0.3)";
      dot.style.background = "var(--rb-yellow)";
    } else if (status.css === "red") {
      badge.style.background = "var(--rb-red-soft)";
      badge.style.color = "var(--rb-red)";
      badge.style.borderColor = "rgba(255,84,101,0.3)";
      dot.style.background = "var(--rb-red)";
    } else {
      badge.style.background = "var(--rb-green-soft)";
      badge.style.color = "var(--rb-green)";
      badge.style.borderColor = "rgba(45,213,131,0.3)";
      dot.style.background = "var(--rb-green)";
    }
  }
}

function showLimitMsg(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 2200);
}

function increaseGeneral() {
  if (profile.occupiedBeds >= profile.totalBeds) {
    showLimitMsg("generalLimitMsg", `Occupied beds cannot exceed total capacity (${profile.totalBeds}).`);
    return;
  }
  profile.occupiedBeds++;
  saveProfile(profile);
  render();
  if (window.showToast) window.showToast(`General Ward Occupancy: ${profile.occupiedBeds}/${profile.totalBeds}`, "info", "🛏");
}

function decreaseGeneral() {
  if (profile.occupiedBeds <= 0) {
    showLimitMsg("generalLimitMsg", "Occupied beds cannot go below zero.");
    return;
  }
  profile.occupiedBeds--;
  saveProfile(profile);
  render();
  if (window.showToast) window.showToast(`General Ward Bed Freed! (${profile.totalBeds - profile.occupiedBeds} available)`, "success", "✓");
}

function increaseICU() {
  if (profile.occupiedICU >= profile.totalICU) {
    showLimitMsg("icuLimitMsg", `Occupied ICU beds cannot exceed total capacity (${profile.totalICU}).`);
    return;
  }
  profile.occupiedICU++;
  saveProfile(profile);
  render();
  if (window.showToast) window.showToast(`ICU Admissions Updated: ${profile.occupiedICU}/${profile.totalICU}`, "warning", "✚");
}

function decreaseICU() {
  if (profile.occupiedICU <= 0) {
    showLimitMsg("icuLimitMsg", "Occupied ICU beds cannot go below zero.");
    return;
  }
  profile.occupiedICU--;
  saveProfile(profile);
  render();
  if (window.showToast) window.showToast(`ICU Bed Released (${profile.totalICU - profile.occupiedICU} available)`, "success", "⚡");
}

/* ==========================================================================
   INTERACTIVE BED THEATRE SYSTEM
   ========================================================================== */
(function () {
  const THEATRES = {
    icu:         { label: "ICU",          total: 12, occupied: 6, reserved: 1 },
    picu:        { label: "PICU",         total: 12, occupied: 5, reserved: 1 },
    general:     { label: "General Ward", total: 20, occupied: 9, reserved: 2 },
    trauma:      { label: "Trauma",       total: 10, occupied: 4, reserved: 1 },
    neonatology: { label: "Neonatology",  total:  8, occupied: 3, reserved: 1 }
  };

  /* ------------------------------------------------------------------
     Per-department seed data: unique patients per occupied bed slot
     Index = bed slot (0-based), matching THEATRES[dept].occupied count
  ------------------------------------------------------------------ */
  const SEED_DATA = {
    icu: [
      { name: "Rajesh Kumar PT-2291",  age: 58, diagnosis: "Acute Myocardial Infarction",       hr: "88 bpm",  spo2: "94%", bp: "145/90 mmHg" },
      { name: "Priya Sharma PT-2292",  age: 45, diagnosis: "Ischemic Stroke",                   hr: "72 bpm",  spo2: "97%", bp: "130/85 mmHg" },
      { name: "Amit Singh PT-2293",    age: 63, diagnosis: "Congestive Heart Failure",           hr: "95 bpm",  spo2: "91%", bp: "155/100 mmHg" },
      { name: "Sunita Devi PT-2294",   age: 52, diagnosis: "Hypertensive Crisis",               hr: "104 bpm", spo2: "96%", bp: "180/110 mmHg" },
      { name: "Mohan Lal PT-2295",     age: 70, diagnosis: "Ventricular Fibrillation (Post-CV)", hr: "66 bpm",  spo2: "98%", bp: "118/76 mmHg" },
      { name: "Kavita Joshi PT-2296",  age: 38, diagnosis: "Subarachnoid Hemorrhage",            hr: "80 bpm",  spo2: "99%", bp: "125/82 mmHg" }
    ],
    picu: [
      { name: "Arjun Mehta PT-3301",   age: 7,  diagnosis: "Acute Respiratory Distress",        hr: "110 bpm", spo2: "93%", bp: "95/60 mmHg" },
      { name: "Riya Gupta PT-3302",    age: 4,  diagnosis: "Febrile Seizure",                   hr: "125 bpm", spo2: "97%", bp: "88/55 mmHg" },
      { name: "Vivek Patel PT-3303",   age: 11, diagnosis: "Diabetic Ketoacidosis",              hr: "100 bpm", spo2: "96%", bp: "100/65 mmHg" },
      { name: "Nisha Yadav PT-3304",   age: 6,  diagnosis: "Severe Pneumonia",                  hr: "118 bpm", spo2: "90%", bp: "92/58 mmHg" },
      { name: "Rohit Verma PT-3305",   age: 9,  diagnosis: "Meningitis (Bacterial)",             hr: "108 bpm", spo2: "95%", bp: "97/62 mmHg" }
    ],
    general: [
      { name: "Suresh Khanna PT-4401",   age: 55, diagnosis: "Type 2 Diabetes Mellitus",         hr: "76 bpm",  spo2: "98%", bp: "128/82 mmHg" },
      { name: "Meera Nair PT-4402",      age: 42, diagnosis: "Appendicitis (Post-Op)",            hr: "82 bpm",  spo2: "99%", bp: "118/74 mmHg" },
      { name: "Deepak Sood PT-4403",     age: 67, diagnosis: "COPD Exacerbation",                 hr: "90 bpm",  spo2: "92%", bp: "140/88 mmHg" },
      { name: "Anita Bose PT-4404",      age: 34, diagnosis: "Viral Hepatitis B",                 hr: "78 bpm",  spo2: "97%", bp: "112/70 mmHg" },
      { name: "Vikram Rathi PT-4405",    age: 50, diagnosis: "Peptic Ulcer Disease",              hr: "84 bpm",  spo2: "98%", bp: "122/78 mmHg" },
      { name: "Pooja Malhotra PT-4406",  age: 29, diagnosis: "Acute Gastroenteritis",             hr: "92 bpm",  spo2: "97%", bp: "108/68 mmHg" },
      { name: "Sanjay Chopra PT-4407",   age: 61, diagnosis: "Chronic Kidney Disease Stage 3",   hr: "74 bpm",  spo2: "96%", bp: "150/95 mmHg" },
      { name: "Rekha Saxena PT-4408",    age: 48, diagnosis: "Hypothyroidism / Myxedema",         hr: "60 bpm",  spo2: "99%", bp: "115/72 mmHg" },
      { name: "Anil Kumar PT-4409",      age: 73, diagnosis: "Osteoarthritis (Post Hip Repair)",  hr: "70 bpm",  spo2: "98%", bp: "132/84 mmHg" }
    ],
    trauma: [
      { name: "Ravi Shankar PT-5501",  age: 32, diagnosis: "Polytrauma — RTA (Road Traffic Accident)", hr: "102 bpm", spo2: "91%", bp: "95/60 mmHg" },
      { name: "Geeta Mishra PT-5502",  age: 44, diagnosis: "Spinal Cord Injury (C4-C5)",              hr: "68 bpm",  spo2: "94%", bp: "85/55 mmHg" },
      { name: "Harish Pandey PT-5503", age: 27, diagnosis: "Traumatic Brain Injury (Moderate)",        hr: "88 bpm",  spo2: "96%", bp: "110/70 mmHg" },
      { name: "Swati Tiwari PT-5504",  age: 39, diagnosis: "Blunt Abdominal Trauma (Post-Lap)",        hr: "79 bpm",  spo2: "97%", bp: "120/76 mmHg" }
    ],
    neonatology: [
      { name: "Baby of Kumari PT-6601", age: 0, diagnosis: "Preterm Birth (32 weeks) — NICU Care",  hr: "148 bpm", spo2: "95%", bp: "55/35 mmHg" },
      { name: "Baby of Devi PT-6602",   age: 0, diagnosis: "Neonatal Jaundice (Phototherapy)",      hr: "152 bpm", spo2: "97%", bp: "58/38 mmHg" },
      { name: "Baby of Singh PT-6603",  age: 0, diagnosis: "Respiratory Distress Syndrome (RDS)",   hr: "160 bpm", spo2: "88%", bp: "50/32 mmHg" }
    ]
  };

  let activeDepartment = "icu";
  let activeSelectedBed = null;

  /* -----------------------------------------------------------------------
     localStorage helpers — key: "referbridge_beds_theatre"
     Structure: { "icu-1": { name, age, diagnosis, hr, spo2, bp, status,
                              reservedUntil }, ... }
  ----------------------------------------------------------------------- */
  const LS_KEY = "referbridge_beds_theatre";

  function getAllBedData() {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  }

  function saveAllBedData(all) {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  }

  function getBedData(dept, bedNum) {
    const all = getAllBedData();
    return all[`${dept}-${bedNum}`] || null;
  }

  function setBedData(dept, bedNum, data) {
    const all = getAllBedData();
    all[`${dept}-${bedNum}`] = Object.assign(all[`${dept}-${bedNum}`] || {}, data);
    saveAllBedData(all);
  }

  /* -----------------------------------------------------------------------
     Seed all occupied beds with unique patient data (runs once)
  ----------------------------------------------------------------------- */
  function seedBedData() {
    const all = getAllBedData();
    let changed = false;

    Object.keys(THEATRES).forEach(function (dept) {
      const t = THEATRES[dept];
      const seedList = SEED_DATA[dept] || [];

      for (let i = 0; i < t.occupied; i++) {
        const bedNum = i + 1;
        const key = `${dept}-${bedNum}`;
        if (!all[key]) {
          const s = seedList[i] || {};
          all[key] = {
            name:         s.name      || `Patient ${dept.toUpperCase()}-${bedNum}`,
            age:          s.age       !== undefined ? s.age : "--",
            diagnosis:    s.diagnosis || "Unknown",
            hr:           s.hr        || "-- bpm",
            spo2:         s.spo2      || "--%",
            bp:           s.bp        || "--/-- mmHg",
            status:       "occupied",
            reservedUntil: null
          };
          changed = true;
        }
      }
    });

    if (changed) saveAllBedData(all);
  }

  /* -----------------------------------------------------------------------
     Auto-vacate interval — checks every 30 seconds
  ----------------------------------------------------------------------- */
  function startAutoVacateInterval() {
    setInterval(function () {
      const all = getAllBedData();
      const now = Date.now();
      let changed = false;

      Object.keys(all).forEach(function (key) {
        const entry = all[key];
        if (entry.reservedUntil && entry.reservedUntil < now) {
          // Determine dept and bedNum from key for toast message
          const parts = key.split("-");
          const bedNum = parts[parts.length - 1];
          const dept = parts.slice(0, parts.length - 1).join("-");
          const t = THEATRES[dept];
          const deptLabel = t ? t.label : dept;

          // Build a display label like "A3" — map bedNum to row/col
          const displayLabel = `${deptLabel} Bed #${bedNum}`;

          // Clear reservation
          all[key] = {
            name: "",
            age: "",
            diagnosis: "",
            hr: "-- bpm",
            spo2: "--%",
            bp: "--/-- mmHg",
            status: "free",
            reservedUntil: null
          };

          // Decrement reserved count in THEATRES so theatre re-renders correctly
          if (t && t.reserved > 0) {
            t.reserved = Math.max(0, t.reserved - 1);
          }

          changed = true;

          if (window.showToast) {
            window.showToast(
              `${displayLabel} auto-vacated — no patient arrived within hold window`,
              "warning",
              "⏱"
            );
          }
        }
      });

      if (changed) {
        saveAllBedData(all);
        // Re-render if the current department was affected
        renderTheatre();
      }
    }, 30000);
  }

  function getTheatre(dept) {
    const t = THEATRES[dept] || THEATRES.icu;
    return { label: t.label, total: t.total, occupied: t.occupied, reserved: t.reserved };
  }

  function makeStatus(index, t, dept) {
    // Check localStorage for overridden status (vacated / reserved via hold timer)
    const bedNum = index + 1;
    const data = getBedData(dept, bedNum);
    if (data && data.status) {
      // If this was originally seeded as occupied but has been vacated
      if (index < t.occupied && data.status === "free") return "free";
      if (index < t.occupied && data.status === "reserved") return "reserved";
      if (index < t.occupied && data.status === "occupied") return "occupied";
    }
    if (index < t.occupied) return "occupied";
    if (index < t.occupied + t.reserved) return "reserved";
    return "free";
  }

  function renderTopStats() {
    const totalEl   = document.getElementById("totalGeneralBeds");
    const icuEl     = document.getElementById("totalIcuBeds");
    const picuEl    = document.getElementById("totalPicuBeds");
    const overallEl = document.getElementById("overallAvailable");

    if (totalEl)   totalEl.textContent   = THEATRES.general.total;
    if (icuEl)     icuEl.textContent     = THEATRES.icu.total;
    if (picuEl)    picuEl.textContent    = THEATRES.picu.total;

    let available = 0;
    Object.keys(THEATRES).forEach(function (k) {
      const x = THEATRES[k];
      available += Math.max(0, x.total - x.occupied - x.reserved);
    });

    if (overallEl) overallEl.textContent = available;
  }

  function renderSummary(t) {
    const el = document.getElementById("theatreSummary");
    if (!el) return;

    const free = Math.max(0, t.total - t.occupied - t.reserved);
    el.innerHTML = `
      <div class="theatre-stat total"><strong>${t.total}</strong><span>Total Capacity</span></div>
      <div class="theatre-stat free"><strong>${free}</strong><span>Available</span></div>
      <div class="theatre-stat occupied"><strong>${t.occupied}</strong><span>Occupied</span></div>
      <div class="theatre-stat reserved"><strong>${t.reserved}</strong><span>Reserved</span></div>
    `;
  }

  /* -----------------------------------------------------------------------
     openBedInspector — main enhanced function
  ----------------------------------------------------------------------- */
  function openBedInspector(bedNo, status, deptLabel) {
    activeSelectedBed = { dept: activeDepartment, number: bedNo, status: status };

    const modalTitle = document.getElementById("modalBedTitle");
    const modalBody  = document.getElementById("modalBedBody");

    if (modalTitle) modalTitle.textContent = `${deptLabel} — Bed #${bedNo}`;

    const storedData = getBedData(activeDepartment, bedNo) || {};

    // Determine effective status (localStorage may override)
    const effectiveStatus = storedData.status || status;

    const statusColor = effectiveStatus === "free"
      ? "var(--rb-green)"
      : (effectiveStatus === "occupied" ? "var(--rb-red)" : "var(--rb-yellow)");

    if (!modalBody) {
      if (window.openModal) window.openModal("bedActionModal");
      return;
    }

    /* ---- STATUS HEADER ---- */
    const statusHeader = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding:12px; border-radius:10px; background:rgba(34,200,255,0.08); border:1px solid var(--rb-border);">
        <div>
          <span style="font-size:11px; color:var(--rb-text-muted);">Current Status</span>
          <strong style="display:block; font-size:15px; text-transform:uppercase; color:${statusColor};">${effectiveStatus}</strong>
        </div>
        <span class="live-radar-dot"></span>
      </div>
    `;

    if (effectiveStatus === "occupied") {
      /* ================================================================
         OCCUPIED BED — editable patient details + Save + Vacate
      ================================================================ */
      const patName  = storedData.name      || "Unknown Patient";
      const patAge   = storedData.age       !== undefined ? storedData.age : "--";
      const patDx    = storedData.diagnosis  || "Unknown";
      const patHR    = storedData.hr         || "-- bpm";
      const patSpO2  = storedData.spo2       || "--%";
      const patBP    = storedData.bp         || "--/-- mmHg";

      modalBody.innerHTML = `
        ${statusHeader}

        <!-- Vitals Row (read from stored) -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; text-align:center;">
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">Heart Rate</small>
            <strong id="inspHRDisplay" style="display:block; font-size:14px; color:var(--rb-teal);">${patHR}</strong>
          </div>
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">SpO2 Level</small>
            <strong id="inspSpO2Display" style="display:block; font-size:14px; color:var(--rb-cyan);">${patSpO2}</strong>
          </div>
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">Blood Pressure</small>
            <strong id="inspBPDisplay" style="display:block; font-size:14px;">${patBP}</strong>
          </div>
        </div>

        <!-- Editable Fields -->
        <div style="display:grid; gap:12px; margin-bottom:18px;">
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:4px;">Patient Name</label>
            <input id="inspName" type="text" value="${patName.replace(/"/g, '&quot;')}"
              style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:13px; box-sizing:border-box;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:4px;">Age</label>
              <input id="inspAge" type="number" min="0" max="130" value="${patAge}"
                style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:13px; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:4px;">Diagnosis</label>
              <input id="inspDx" type="text" value="${patDx.replace(/"/g, '&quot;')}"
                style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:13px; box-sizing:border-box;">
            </div>
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:6px;">Vitals</label>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
              <input id="inspHR" type="text" placeholder="HR e.g. 76 bpm" value="${patHR.replace(/"/g, '&quot;')}"
                style="padding:9px 10px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:12px; box-sizing:border-box;">
              <input id="inspSpO2" type="text" placeholder="SpO2 e.g. 98%" value="${patSpO2.replace(/"/g, '&quot;')}"
                style="padding:9px 10px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:12px; box-sizing:border-box;">
              <input id="inspBP" type="text" placeholder="BP e.g. 120/80" value="${patBP.replace(/"/g, '&quot;')}"
                style="padding:9px 10px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.05); color:var(--rb-text-main); font-size:12px; box-sizing:border-box;">
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:10px;">
          <button id="inspSaveBtn"
            style="flex:1; padding:11px; border-radius:8px; border:none; background:var(--rb-cyan); color:#000; font-size:13px; font-weight:700; cursor:pointer;">
            💾 Save Details
          </button>
          <button id="inspVacateBtn"
            style="flex:1; padding:11px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:700; cursor:pointer;">
            🛏️ Vacate Bed
          </button>
        </div>
      `;

      // Save button handler
      document.getElementById("inspSaveBtn").addEventListener("click", function () {
        const newName  = document.getElementById("inspName").value.trim();
        const newAge   = document.getElementById("inspAge").value.trim();
        const newDx    = document.getElementById("inspDx").value.trim();
        const newHR    = document.getElementById("inspHR").value.trim();
        const newSpO2  = document.getElementById("inspSpO2").value.trim();
        const newBP    = document.getElementById("inspBP").value.trim();

        setBedData(activeDepartment, bedNo, {
          name:      newName,
          age:       newAge,
          diagnosis: newDx,
          hr:        newHR,
          spo2:      newSpO2,
          bp:        newBP,
          status:    "occupied"
        });

        if (window.showToast) window.showToast(`Bed #${bedNo} details saved for ${newName || "patient"}`, "success", "💾");
      });

      // Vacate button handler
      document.getElementById("inspVacateBtn").addEventListener("click", function () {
        setBedData(activeDepartment, bedNo, {
          name:         "",
          age:          "",
          diagnosis:    "",
          hr:           "-- bpm",
          spo2:         "--%",
          bp:           "--/-- mmHg",
          status:       "free",
          reservedUntil: null
        });

        // Decrement occupied in THEATRES
        if (THEATRES[activeDepartment] && THEATRES[activeDepartment].occupied > 0) {
          THEATRES[activeDepartment].occupied = Math.max(0, THEATRES[activeDepartment].occupied - 1);
        }

        if (window.showToast) window.showToast(`${deptLabel} Bed #${bedNo} has been vacated`, "success", "🛏️");
        if (window.closeModal) window.closeModal("bedActionModal");
        renderTheatre();
      });

    } else if (effectiveStatus === "reserved") {
      /* ================================================================
         RESERVED BED — show reservation info
      ================================================================ */
      let holdInfo = "Emergency Transfer Hold";
      if (storedData.reservedUntil) {
        const remaining = Math.max(0, Math.round((storedData.reservedUntil - Date.now()) / 60000));
        holdInfo = `Hold expires in ~${remaining} min`;
      }

      modalBody.innerHTML = `
        ${statusHeader}

        <div style="padding:16px; border-radius:10px; background:rgba(245,183,56,0.1); border:1.5px solid rgba(245,183,56,0.35); margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:var(--rb-yellow); flex-shrink:0; box-shadow:0 0 8px rgba(245,183,56,0.7);"></span>
            <span style="font-size:13px; font-weight:700; color:var(--rb-yellow); text-transform:uppercase; letter-spacing:0.06em;">Reserved — Hold Active</span>
          </div>
          <p style="font-size:13px; color:var(--rb-text-muted); margin:0;">${holdInfo}</p>
        </div>

        <div style="display:grid; gap:10px;">
          <button id="inspClearReserveBtn"
            style="padding:11px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:700; cursor:pointer;">
            ✖ Cancel Reservation & Free Bed
          </button>
        </div>
      `;

      document.getElementById("inspClearReserveBtn").addEventListener("click", function () {
        setBedData(activeDepartment, bedNo, {
          name: "", age: "", diagnosis: "",
          hr: "-- bpm", spo2: "--%", bp: "--/-- mmHg",
          status: "free", reservedUntil: null
        });

        if (THEATRES[activeDepartment] && THEATRES[activeDepartment].reserved > 0) {
          THEATRES[activeDepartment].reserved = Math.max(0, THEATRES[activeDepartment].reserved - 1);
        }

        if (window.showToast) window.showToast(`${deptLabel} Bed #${bedNo} reservation cancelled`, "info", "✖");
        if (window.closeModal) window.closeModal("bedActionModal");
        renderTheatre();
      });

    } else {
      /* ================================================================
         FREE BED — hold timer section + reserve buttons
      ================================================================ */
      modalBody.innerHTML = `
        ${statusHeader}

        <div style="margin-bottom:18px; padding:14px; border-radius:10px; background:rgba(45,213,131,0.08); border:1px solid rgba(45,213,131,0.25);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span style="width:8px; height:8px; border-radius:50%; background:var(--rb-green);"></span>
            <span style="font-size:12px; font-weight:700; color:var(--rb-green); text-transform:uppercase;">Available — Free &amp; Sanitized</span>
          </div>
          <p style="font-size:12px; color:var(--rb-text-muted); margin:0;">This bed is ready for immediate admission.</p>
        </div>

        <div style="margin-bottom:6px;">
          <label style="font-size:12px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:10px;">🕐 Reserve with Hold Timer</label>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px;">
            <button class="hold-timer-btn" data-minutes="15"
              style="padding:10px 6px; border-radius:8px; border:1.5px solid var(--rb-cyan); background:rgba(34,200,255,0.08); color:var(--rb-cyan); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">
              15 min
            </button>
            <button class="hold-timer-btn" data-minutes="30"
              style="padding:10px 6px; border-radius:8px; border:1.5px solid var(--rb-cyan); background:rgba(34,200,255,0.08); color:var(--rb-cyan); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">
              30 min
            </button>
            <button class="hold-timer-btn" data-minutes="45"
              style="padding:10px 6px; border-radius:8px; border:1.5px solid var(--rb-cyan); background:rgba(34,200,255,0.08); color:var(--rb-cyan); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">
              45 min
            </button>
            <button class="hold-timer-btn" data-minutes="60"
              style="padding:10px 6px; border-radius:8px; border:1.5px solid var(--rb-cyan); background:rgba(34,200,255,0.08); color:var(--rb-cyan); font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">
              60 min
            </button>
          </div>
        </div>
      `;

      // Hold timer button handlers
      modalBody.querySelectorAll(".hold-timer-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const minutes = parseInt(this.dataset.minutes, 10);
          const reservedUntil = Date.now() + minutes * 60 * 1000;

          setBedData(activeDepartment, bedNo, {
            status: "reserved",
            reservedUntil: reservedUntil,
            name: "Incoming Transfer Hold",
            age: "--",
            diagnosis: `Hold — ${minutes} min reservation`,
            hr: "-- bpm", spo2: "--%", bp: "--/-- mmHg"
          });

          // Increment reserved count in THEATRES
          if (THEATRES[activeDepartment]) {
            THEATRES[activeDepartment].reserved = (THEATRES[activeDepartment].reserved || 0) + 1;
          }

          if (window.showToast) {
            window.showToast(
              `${deptLabel} Bed #${bedNo} reserved for ${minutes} min hold`,
              "warning",
              "🕐"
            );
          }

          if (window.closeModal) window.closeModal("bedActionModal");
          renderTheatre();
        });
      });
    }

    if (window.openModal) window.openModal("bedActionModal");
  }

  function renderTheatre() {
    const theatre = document.getElementById("bedTheatre");
    if (!theatre) return;

    const t = getTheatre(activeDepartment);
    renderSummary(t);
    renderTopStats();
    theatre.innerHTML = "";

    const frame = document.createElement("div");
    frame.className = "theatre-stage";

    const arch = document.createElement("div");
    arch.className = "theatre-arch";
    arch.innerHTML = `
      <div class="arch-title">${t.label.toUpperCase()} · PATIENT MATRIX</div>
      <div class="arch-line"></div>
    `;
    frame.appendChild(arch);

    const seating = document.createElement("div");
    seating.className = "theatre-seating";

    let rowPattern = [4, 4, 4];
    if (t.total <= 8)  rowPattern = [3, 3, 2];
    else if (t.total <= 10) rowPattern = [4, 3, 3];
    else if (t.total <= 12) rowPattern = [4, 4, 4];
    else rowPattern = [5, 5, 5, 5];

    let bedNo = 0;
    const letters = ["A", "B", "C", "D"];

    rowPattern.forEach(function (count, rowIndex) {
      const row = document.createElement("div");
      row.className = "bed-row";

      const letter = document.createElement("span");
      letter.className = "row-letter";
      letter.textContent = letters[rowIndex] || "";
      row.appendChild(letter);

      for (let j = 0; j < 5; j++) {
        if (j >= count || bedNo >= t.total) {
          const empty = document.createElement("span");
          empty.className = "theatre-bed-spacer";
          row.appendChild(empty);
          continue;
        }

        const index = bedNo++;
        const bedNum = index + 1;
        const status = makeStatus(index, t, activeDepartment);

        const seat = document.createElement("button");
        seat.type = "button";
        seat.className = `theatre-bed ${status}`;
        seat.dataset.number = String(bedNum);
        seat.dataset.status = status;

        seat.innerHTML = `
          <i class="bed-head"></i>
          <span class="bed-number">${letters[rowIndex] || ""}${j + 1}</span>
        `;
        seat.title = `${t.label} Bed ${bedNum} · Status: ${status}`;

        // Capture loop variables for the event listener
        (function (capturedIndex, capturedBedNum, capturedRowIndex, capturedJ) {
          seat.addEventListener("click", function () {
            document.querySelectorAll(".theatre-bed.selected").forEach(function (b) {
              b.classList.remove("selected");
            });
            this.classList.add("selected");

            const effectiveStatus = makeStatus(capturedIndex, t, activeDepartment);

            const detail = document.getElementById("bedDetails");
            if (detail) {
              const storedD = getBedData(activeDepartment, capturedBedNum) || {};
              const patientInfo = storedD.name ? ` · ${storedD.name}` : "";
              detail.innerHTML = `
                <div class="bed-detail-icon">🛏</div>
                <div>
                  <strong>${t.label} Unit ${letters[capturedRowIndex] || ""}${capturedJ + 1} — ${effectiveStatus.toUpperCase()}${patientInfo}</strong>
                  <span>Telemetry: HR ${storedD.hr || "-- bpm"} · SpO2 ${storedD.spo2 || "--%"} · Click to open Bed Inspector dialog.</span>
                </div>
              `;
            }

            openBedInspector(capturedBedNum, effectiveStatus, t.label);
          });
        })(index, bedNum, rowIndex, j);

        row.appendChild(seat);
      }
      seating.appendChild(row);
    });

    frame.appendChild(seating);
    theatre.appendChild(frame);
  }

  function setupTabs() {
    document.querySelectorAll(".department-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".department-tab").forEach(function (x) {
          x.classList.remove("active");
        });
        this.classList.add("active");
        activeDepartment = this.dataset.dept;
        renderTheatre();
      });
    });
  }

  function init() {
    seedBedData();
    setupTabs();
    renderTheatre();
    startAutoVacateInterval();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  document.getElementById("generalPlus").addEventListener("click", increaseGeneral);
  document.getElementById("generalMinus").addEventListener("click", decreaseGeneral);
  document.getElementById("icuPlus").addEventListener("click", increaseICU);
  document.getElementById("icuMinus").addEventListener("click", decreaseICU);

  render();
});
