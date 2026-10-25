/* ==========================================================================
   REFERBRIDGE — HOSPITAL NETWORK CONTROLLER (network.js)
   ========================================================================== */






const HOSPITALS = [
  { id: "H1", type: "Govt", name: "PGIMER", location: "Sector 12, Chandigarh", distanceKm: 1.5, specialties: ["Cardiology", "Trauma", "Research", "ICU"], totalBeds: 1900, availableBeds: 14, icuAvailable: 2, contact: "0172-2746018", status: "Limited" },
  { id: "H2", type: "Govt", name: "GMCH Sector 32", location: "Sector 32, Chandigarh", distanceKm: 4.2, specialties: ["General Surgery", "Emergency", "Burn Unit"], totalBeds: 900, availableBeds: 45, icuAvailable: 2, contact: "0172-2601023", status: "Limited" },
  { id: "H3", type: "Private", name: "Lotus Care Hospital", location: "Sector 22, Chandigarh", distanceKm: 3.2, specialties: ["Cardiology", "Orthopedics", "Emergency Care"], totalBeds: 180, availableBeds: 24, icuAvailable: 6, contact: "+91 98141 12345", status: "Available" },
  { id: "H4", type: "Private", name: "Sunrise Multispecialty", location: "Phase 7, Mohali", distanceKm: 6.8, specialties: ["Pediatrics", "Trauma", "General Surgery"], totalBeds: 140, availableBeds: 8, icuAvailable: 2, contact: "+91 98722 54321", status: "Limited" },
  { id: "H5", type: "Private", name: "Green Valley Hospital", location: "Sector 11, Panchkula", distanceKm: 9.4, specialties: ["Neurology", "Cardiology", "Stroke Center"], totalBeds: 90, availableBeds: 0, icuAvailable: 0, contact: "+91 98888 11223", status: "Full" },
  { id: "H6", type: "Private", name: "Riverside Hospital", location: "Zirakpur Bypass, NH-22", distanceKm: 12.1, specialties: ["Trauma", "Orthopedics", "Critical Care"], totalBeds: 210, availableBeds: 38, icuAvailable: 9, contact: "+91 99150 99887", status: "Available" },
  { id: "H7", type: "Private", name: "Om Research Centre", location: "Sector 34, Chandigarh", distanceKm: 4.5, specialties: ["Nephrology", "Oncology", "ICU"], totalBeds: 160, availableBeds: 19, icuAvailable: 4, contact: "+91 98155 33445", status: "Available" },
  { id: "H8", type: "Private", name: "Apex Medical Institute", location: "Sector 62, Mohali", distanceKm: 8.0, specialties: ["Cardiology", "Neurology", "Vascular Surgery"], totalBeds: 250, availableBeds: 12, icuAvailable: 3, contact: "+91 98760 00112", status: "Limited" },
  { id: "H9", type: "Private", name: "City Center Care", location: "Sector 17, Chandigarh", distanceKm: 2.1, specialties: ["General Medicine", "Dermatology", "Emergency Care"], totalBeds: 110, availableBeds: 45, icuAvailable: 8, contact: "+91 98555 66778", status: "Available" },
  { id: "H10", type: "Private", name: "Divine Grace Hospital", location: "Phase 3B2, Mohali", distanceKm: 5.5, specialties: ["Gynaecology", "Pediatrics", "Neonatology"], totalBeds: 85, availableBeds: 5, icuAvailable: 1, contact: "+91 99123 44556", status: "Limited" },
  { id: "H11", type: "Private", name: "Pioneer Health City", location: "Aerocity, Mohali", distanceKm: 15.3, specialties: ["Oncology", "Organ Transplant", "Cardiology"], totalBeds: 350, availableBeds: 110, icuAvailable: 25, contact: "+91 88990 11223", status: "Available" },
  { id: "H12", type: "Govt", name: "GMSH Sector 16", location: "Sector 16, Chandigarh", distanceKm: 2.8, specialties: ["Emergency Care", "Cardiology", "General Medicine", "Paediatrics", "ICU"], totalBeds: 500, availableBeds: 32, icuAvailable: 5, contact: "0172-2700491", status: "Available" },
  { id: "H13", type: "Govt", name: "Nehru Hospital (PGIMER Apex Cardio)", location: "Sector 12, Chandigarh", distanceKm: 1.6, specialties: ["Cardiology", "Cardiothoracic Surgery", "Advanced ICU", "Neurosurgery"], totalBeds: 800, availableBeds: 18, icuAvailable: 6, contact: "0172-2746018", status: "Limited" },
  { id: "H14", type: "Govt", name: "Civil Hospital Mohali", location: "Phase 6, Mohali", distanceKm: 6.2, specialties: ["Emergency Medicine", "General Medicine", "Cardiology", "Maternity", "ICU"], totalBeds: 300, availableBeds: 28, icuAvailable: 3, contact: "0172-2228010", status: "Available" },
  { id: "H15", type: "Govt", name: "GMCH Mohali", location: "Phase 6, Mohali", distanceKm: 6.0, specialties: ["Trauma", "General Surgery", "Cardiology", "Critical Care", "ICU"], totalBeds: 350, availableBeds: 36, icuAvailable: 4, contact: "0172-5095001", status: "Available" },
  { id: "H16", type: "Govt", name: "Civil Hospital Panchkula", location: "Sector 6, Panchkula", distanceKm: 8.5, specialties: ["Emergency", "Trauma Center", "Cardiology", "Surgery", "ICU"], totalBeds: 300, availableBeds: 24, icuAvailable: 3, contact: "0172-2560073", status: "Available" },
  { id: "H17", type: "Govt", name: "ESIC Model Hospital Panchkula", location: "Industrial Area Phase 1, Panchkula", distanceKm: 10.2, specialties: ["General Medicine", "Occupational Health", "Cardiology", "ICU"], totalBeds: 150, availableBeds: 22, icuAvailable: 3, contact: "0172-2590001", status: "Available" },
  { id: "H18", type: "Govt", name: "Civil Hospital Zirakpur", location: "NH-22 Highway, Zirakpur", distanceKm: 11.4, specialties: ["Emergency First Aid", "General Medicine", "Cardiology Stabilization", "Trauma"], totalBeds: 100, availableBeds: 18, icuAvailable: 2, contact: "0172-2240090", status: "Available" },
  { id: "H19", type: "Govt", name: "AIIMS New Delhi", location: "Ansari Nagar, New Delhi", distanceKm: 245.0, specialties: ["Cardiology", "CTVS", "Trauma Center", "Critical Care ICU", "Organ Transplant"], totalBeds: 2500, availableBeds: 42, icuAvailable: 12, contact: "011-26588500", status: "Available" },
  { id: "H20", type: "Govt", name: "Safdarjung Hospital & VMMC", location: "Ring Road, New Delhi", distanceKm: 246.0, specialties: ["Cardiology", "Emergency Medicine", "Burn & Trauma Center", "ICU"], totalBeds: 1800, availableBeds: 35, icuAvailable: 8, contact: "011-26165060", status: "Available" },

  { id: "H23", type: "Private", name: "Fortis Escorts Heart Institute", location: "Okhla Road, New Delhi", distanceKm: 252.0, specialties: ["Cardiology", "Cardiac Surgery", "Electrophysiology", "Pediatric Cardiac ICU"], totalBeds: 310, availableBeds: 29, icuAvailable: 14, contact: "011-47135000", status: "Available" },
  { id: "H24", type: "Private", name: "Max Super Speciality Mohali", location: "Phase 6, Mohali", distanceKm: 6.4, specialties: ["Cardiology", "Cancer Care", "Neurology", "Renal Sciences", "Advanced ICU"], totalBeds: 200, availableBeds: 19, icuAvailable: 4, contact: "0172-6652000", status: "Available" }
];

let activeSearch = "";
let activeStatus = "all";
let activeSort = "name";
let activeSpecialty = "all";
let targetHospitalForTransfer = null;

function openTransferModal(hospital) {
  targetHospitalForTransfer = hospital;

  const title = document.getElementById("modalTransferTitle");
  const body = document.getElementById("modalTransferBody");

  if (title) title.textContent = `Referral Transfer → ${hospital.name}`;

  if (body) {
    body.innerHTML = `
      <div style="padding:12px; border-radius:10px; background:rgba(34,200,255,0.08); border:1px solid var(--rb-border); margin-bottom:16px;">
        <span style="font-size:11px; color:var(--rb-text-muted);">Target Partner Facility</span>
        <strong style="display:block; font-size:15px; color:var(--rb-cyan);">${hospital.name} (${hospital.distanceKm} km away)</strong>
        <small style="color:var(--rb-text-muted); font-size:12px;">Available Beds: ${hospital.availableBeds} · ICU Open: ${hospital.icuAvailable} · ${hospital.specialties.join(", ")}</small>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Select Outbound Patient Case</label>
        <select id="transferPatientSelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px;">
          <option value="PT-3101">PT-3101 — Gurpreet Singh (58y, Severe Angina, Cardiology)</option>
          <option value="PT-3102">PT-3102 — Simran Kaur (34y, Poly-trauma, Orthopedics)</option>
          <option value="PT-3103">PT-3103 — Master Aarav (6y, Bronchiolitis, Pediatrics)</option>
          <option value="PT-3104">PT-3104 — Harish Verma (63y, Acute Kidney Injury, Nephrology)</option>
        </select>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Transfer Urgency Priority</label>
        <select id="transferUrgencySelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px;">
          <option value="Critical">🔴 Critical (Immediate ICU transfer &amp; ALS Ambulance)</option>
          <option value="High" selected>🟠 High (Sub-acute transfer within 1 hour)</option>
          <option value="Moderate">🟡 Moderate (Scheduled clinical transfer)</option>
        </select>
      </div>

      <div>
        <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Physician Clinical Handover Notes</label>
        <textarea id="transferNotes" rows="3" placeholder="Enter clinical handover summary, current medications, or ventilator parameters..." style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px; font-family:var(--font-body);"></textarea>
      </div>
    `;
  }

  if (window.openModal) window.openModal("transferModal");
}

function setupTransferSubmit() {
  const btn = document.getElementById("btnSendTransfer");
  if (!btn) return;

  btn.addEventListener("click", function () {
    if (!targetHospitalForTransfer) return;

    const patientSelect = document.getElementById("transferPatientSelect");
    const urgencySelect = document.getElementById("transferUrgencySelect");
    const notesInput = document.getElementById("transferNotes");

    const patientVal = patientSelect ? patientSelect.value : "PT-3101";
    const urgencyVal = urgencySelect ? urgencySelect.value : "High";
    const notes = notesInput ? notesInput.value.trim() : "";

    const newReq = {
      id: "REQ-" + Math.floor(106 + Math.random() * 800),
      patientId: patientVal,
      age: 48,
      specialty: targetHospitalForTransfer.specialties[0] || "General Medicine",
      condition: `Outbound referral: ${notes || "Clinical handoff requested"}`,
      history: "Referral initiated via Regional Network Directory",
      urgency: urgencyVal,
      hospital: targetHospitalForTransfer.name,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Pending"
    };

    let reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "[]");
    reqs.unshift(newReq);
    localStorage.setItem("referbridge_requests", JSON.stringify(reqs));

    if (window.closeModal) window.closeModal("transferModal");

    if (window.showToast) {
      window.showToast(`Transfer request dispatched to ${targetHospitalForTransfer.name}!`, "success", "⚡");
    }
  });
}

function renderHospitals() {
  const grid = document.getElementById("hospitalGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid) return;

  grid.innerHTML = "";

  let list = HOSPITALS.filter((h) => {
    const q = activeSearch.toLowerCase();
    const matchSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.specialties.some((s) => s.toLowerCase().includes(q));

    const matchStatus = activeStatus === "all" || h.status === activeStatus;
    const matchSpec = activeSpecialty === "all" || h.specialties.some((s) => s.toLowerCase().includes(activeSpecialty.toLowerCase()));

    return matchSearch && matchStatus && matchSpec;
  });

  // Sorting
  if (activeSort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (activeSort === "distance") {
    list.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (activeSort === "beds") {
    list.sort((a, b) => b.availableBeds - a.availableBeds);
  }

  if (list.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  list.forEach((h) => {
    const card = document.createElement("div");
    card.className = "hospital-card";

    let statusStyle = "background:var(--rb-green-soft); color:var(--rb-green); border:1px solid rgba(45,213,131,0.3);";
    if (h.status === "Limited") statusStyle = "background:var(--rb-yellow-soft); color:var(--rb-yellow); border:1px solid rgba(245,183,56,0.3);";
    if (h.status === "Full") statusStyle = "background:var(--rb-red-soft); color:var(--rb-red); border:1px solid rgba(255,84,101,0.3);";

    const specTags = h.specialties.map((s) => `<span class="specialty-tag">${s}</span>`).join("");

        const typeBadge = h.type === "Govt" 
      ? `<span style="font-size:10px; font-weight:800; background:rgba(20,228,184,0.15); color:var(--rb-teal, #14e4b8); padding:4px 8px; border-radius:6px; letter-spacing:0.05em; border:1px solid rgba(20,228,184,0.4);">GOVT</span>`
      : ``;

    card.innerHTML = `
      <div>
        <div class="card-top">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <h3 class="hospital-name" style="margin:0;">${h.name}</h3>
              ${typeBadge}
            </div>
            <p class="hospital-location" style="margin:0;">${h.location}</p>
          </div>
          <span class="distance-pill" style="align-self:flex-start;">&#128205; ${h.distanceKm} km</span>
        </div>

        <div class="specialty-tags">${specTags}</div>

        <div class="card-stats-row">
          <div>
            <span>Available Beds</span>
            <strong style="color:${h.availableBeds > 0 ? 'var(--rb-green)' : 'var(--rb-red)'};">${h.availableBeds} / ${h.totalBeds}</strong>
          </div>
          <div>
            <span>ICU Available</span>
            <strong style="color:${h.icuAvailable > 0 ? 'var(--rb-cyan)' : 'var(--rb-red)'};">${h.icuAvailable}</strong>
          </div>
        </div>
      </div>

      <div class="card-foot">
        <span class="status-badge" style="${statusStyle}; margin:0; padding:4px 10px; font-size:11px;">
          ${h.status.toUpperCase()}
        </span>
        <button type="button" class="btn-transfer" data-id="${h.id}">
          <span>Transfer Request</span> <span>→</span>
        </button>
      </div>
    `;

    const transferBtn = card.querySelector(".btn-transfer");
    if (transferBtn) {
      transferBtn.addEventListener("click", () => openTransferModal(h));
    }

    grid.appendChild(card);
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

  // Search
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      activeSearch = this.value.trim();
      renderHospitals();
    });
  }

  // Status Filter
  const statusSelect = document.getElementById("statusFilter");
  if (statusSelect) {
    statusSelect.addEventListener("change", function () {
      activeStatus = this.value;
      renderHospitals();
    });
  }

  // Sort Filter
  const sortSelect = document.getElementById("sortFilter");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      activeSort = this.value;
      renderHospitals();
    });
  }

  // Specialty Pills
  document.querySelectorAll(".spec-pill").forEach((pill) => {
    pill.addEventListener("click", function () {
      document.querySelectorAll(".spec-pill").forEach((p) => p.classList.remove("active"));
      this.classList.add("active");
      activeSpecialty = this.getAttribute("data-spec");
      renderHospitals();
    });
  });

  setupTransferSubmit();
  setupRouteEstimator();

  renderHospitals();
});


// ── Transit Route Estimator ──────────────────────────────────────────
function setupRouteEstimator() {
  const origSelect = document.getElementById("routeOriginSelect");
  const destSelect = document.getElementById("routeDestSelect");
  const btn = document.getElementById("btnCalculateDirectRoute");
  const box = document.getElementById("routeResultBox");
  const corridorText = document.getElementById("routeCorridorText");
  const distText = document.getElementById("routeDistanceText");
  const durText = document.getElementById("routeDurationText");

  if (!origSelect || !destSelect || !btn) return;

  // Populate options
  const optionsHtml = HOSPITALS.map((h, i) => `<option value="${h.id}">${h.name} (${h.location})</option>`).join("");
  origSelect.innerHTML = optionsHtml;
  destSelect.innerHTML = optionsHtml;

  if (HOSPITALS.length > 1) {
    destSelect.selectedIndex = 1;
  }

  btn.addEventListener("click", () => {
    const oId = origSelect.value;
    const dId = destSelect.value;

    if (oId === dId) {
      if (window.showToast) window.showToast("Origin and destination must be different hospitals.", "warning", "⚠");
      return;
    }

    const oH = HOSPITALS.find(h => h.id === oId);
    const dH = HOSPITALS.find(h => h.id === dId);
    if (!oH || !dH) return;

    // Estimate road route distance
    const distKm = Math.abs(dH.distanceKm - oH.distanceKm) + 2.5;
    const roundedDist = Math.max(Number(distKm.toFixed(1)), 1.8);
    const estMinutes = Math.max(Math.round((roundedDist / 32) * 60), 6);

    corridorText.textContent = `${oH.name} ➔ ${dH.name} (Priority Patient Transfer Corridor)`;
    distText.textContent = `${roundedDist} km`;
    durText.textContent = `~${estMinutes} mins`;
    box.style.display = "flex";

    if (window.showToast) {
      window.showToast(`Transit route: ${roundedDist} km · Est ${estMinutes} mins`, "success", "🚗");
    }
  });
}
