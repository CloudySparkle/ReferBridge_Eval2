/* ==========================================================================
   REFERBRIDGE — INCOMING REQUESTS CONTROLLER (requests.js)
   ========================================================================== */






function getRequests() {
  let reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "null");
  if (!reqs) {
    reqs = [
      { id: "REQ-101", patientId: "PT-2291", age: 54, specialty: "Cardiology", condition: "Acute Myocardial Infarction", history: "Hypertension, Type 2 Diabetes", urgency: "Critical", hospital: "Lotus Care Hospital", time: "09:12 AM", status: "Accepted" },
      { id: "REQ-102", patientId: "PT-2292", age: 29, specialty: "Orthopedics", condition: "Compound Femur Fracture", history: "No prior surgeries", urgency: "High", hospital: "Sunrise Multispecialty", time: "09:47 AM", status: "Rejected" },
      { id: "REQ-103", patientId: "PT-2293", age: 67, specialty: "Neurology", condition: "Suspected Ischemic Stroke", history: "Atrial Fibrillation", urgency: "Critical", hospital: "Green Valley Hospital", time: "10:05 AM", status: "Pending" },
      { id: "REQ-104", patientId: "PT-2294", age: 8, specialty: "Pediatrics", condition: "Severe Dehydration", history: "Recent viral gastroenteritis", urgency: "Moderate", hospital: "City Care Clinic", time: "10:32 AM", status: "Pending" },
      { id: "REQ-105", patientId: "PT-2295", age: 41, specialty: "General Surgery", condition: "Acute Appendicitis", history: "No known allergies", urgency: "High", hospital: "Riverside Hospital", time: "11:15 AM", status: "Pending" }
    ];
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

      <div style="padding:10px 14px; border-radius:8px; background:rgba(20,228,184,0.08); border:1px dashed rgba(20,228,184,0.3); display:flex; align-items:center; gap:10px;">
        <span style="font-size:18px;">🚑</span>
        <span style="font-size:12px; color:var(--rb-text-main);"><strong>Ambulance Unit ETA:</strong> Approx. 14 mins with telemetry uplink active.</span>
      </div>
    `;
  }

  if (modalFoot) {
    if (req.status === "Pending") {
      modalFoot.innerHTML = `
        <button type="button" class="btn-ghost" onclick="closeModal('caseModal')">Close</button>
        <button type="button" class="btn-req-reject" onclick="setRequestStatus('${req.id}', 'Rejected'); closeModal('caseModal');">Decline Transfer</button>
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
      rejectBtn.addEventListener("click", () => setRequestStatus(req.id, "Rejected"));
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
