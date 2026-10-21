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
    icu: { label: "ICU", total: 12, occupied: 6, reserved: 1 },
    picu: { label: "PICU", total: 12, occupied: 5, reserved: 1 },
    general: { label: "General Ward", total: 20, occupied: 9, reserved: 2 },
    trauma: { label: "Trauma", total: 10, occupied: 4, reserved: 1 },
    neonatology: { label: "Neonatology", total: 8, occupied: 3, reserved: 1 }
  };

  let activeDepartment = "icu";
  let activeSelectedBed = null;

  function getTheatre(dept) {
    const t = THEATRES[dept] || THEATRES.icu;
    return { label: t.label, total: t.total, occupied: t.occupied, reserved: t.reserved };
  }

  function makeStatus(index, t) {
    if (index < t.occupied) return "occupied";
    if (index < t.occupied + t.reserved) return "reserved";
    return "free";
  }

  function renderTopStats() {
    const totalEl = document.getElementById("totalGeneralBeds");
    const icuEl = document.getElementById("totalIcuBeds");
    const picuEl = document.getElementById("totalPicuBeds");
    const overallEl = document.getElementById("overallAvailable");

    if (totalEl) totalEl.textContent = THEATRES.general.total;
    if (icuEl) icuEl.textContent = THEATRES.icu.total;
    if (picuEl) picuEl.textContent = THEATRES.picu.total;

    let available = 0;
    Object.keys(THEATRES).forEach((k) => {
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

  function openBedInspector(bedNo, status, deptLabel) {
    activeSelectedBed = { dept: activeDepartment, number: bedNo, status: status };

    const modalTitle = document.getElementById("modalBedTitle");
    const modalBody = document.getElementById("modalBedBody");

    if (modalTitle) modalTitle.textContent = `${deptLabel} — Bed #${bedNo}`;

    const isOcc = status === "occupied";
    const patientName = isOcc ? "Rajesh Kumar (PT-2291)" : (status === "reserved" ? "Incoming Trauma Hold" : "Unassigned");
    const hr = isOcc ? "76 bpm" : "--";
    const spo2 = isOcc ? "98%" : "--";
    const bp = isOcc ? "120/80 mmHg" : "--";

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding:12px; border-radius:10px; background:rgba(34,200,255,0.08); border:1px solid var(--rb-border);">
          <div>
            <span style="font-size:11px; color:var(--rb-text-muted);">Current Status</span>
            <strong style="display:block; font-size:15px; text-transform:uppercase; color:${status === 'free' ? 'var(--rb-green)' : (status === 'occupied' ? 'var(--rb-red)' : 'var(--rb-yellow)')};">${status}</strong>
          </div>
          <span class="live-radar-dot"></span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; text-align:center;">
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">Heart Rate</small>
            <strong style="display:block; font-size:14px; color:var(--rb-teal);">${hr}</strong>
          </div>
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">SpO2 Level</small>
            <strong style="display:block; font-size:14px; color:var(--rb-cyan);">${spo2}</strong>
          </div>
          <div style="padding:10px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--rb-border);">
            <small style="font-size:10px; color:var(--rb-text-muted);">Blood Pressure</small>
            <strong style="display:block; font-size:14px;">${bp}</strong>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:12px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:6px;">Patient / Reservation</label>
          <input type="text" value="${patientName}" readonly style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.04); color:var(--rb-text-main); font-size:13px;">
        </div>

        <div>
          ${status === 'occupied' ? `
            <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:10px; background:rgba(239,68,68,0.08); border:1.5px solid rgba(239,68,68,0.35);">
              <span style="width:10px; height:10px; border-radius:50%; background:#ef4444; flex-shrink:0; box-shadow:0 0 8px rgba(239,68,68,0.7);"></span>
              <span style="font-size:13px; font-weight:700; color:#ef4444; text-transform:uppercase; letter-spacing:0.06em;">Occupied — Inpatient Admitted</span>
            </div>
          ` : `
            <label style="font-size:12px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:6px;">Update Bed State</label>
            <select id="selectBedStatus" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-cyan); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px; font-weight:600;">
              <option value="free" ${status === 'free' ? 'selected' : ''}>Available (Free &amp; Sanitized)</option>
              <option value="reserved" ${status === 'reserved' ? 'selected' : ''}>Reserved (Emergency Transfer Hold)</option>
            </select>
          `}
        </div>
      `;
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
    if (t.total <= 8) rowPattern = [3, 3, 2];
    else if (t.total <= 10) rowPattern = [4, 3, 3];
    else if (t.total <= 12) rowPattern = [4, 4, 4];
    else rowPattern = [5, 5, 5, 5];

    let bedNo = 0;
    const letters = ["A", "B", "C", "D"];

    rowPattern.forEach((count, rowIndex) => {
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
        const status = makeStatus(index, t);

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

        seat.addEventListener("click", function () {
          document.querySelectorAll(".theatre-bed.selected").forEach((b) => b.classList.remove("selected"));
          this.classList.add("selected");

          const detail = document.getElementById("bedDetails");
          if (detail) {
            detail.innerHTML = `
              <div class="bed-detail-icon">🛏</div>
              <div>
                <strong>${t.label} Unit ${letters[rowIndex] || ""}${j + 1} — ${status.toUpperCase()}</strong>
                <span>Telemetry: HR 76 bpm · SpO2 98% · Click to open Bed Inspector dialog.</span>
              </div>
            `;
          }

          openBedInspector(bedNum, status, t.label);
        });

        row.appendChild(seat);
      }
      seating.appendChild(row);
    });

    frame.appendChild(seating);
    theatre.appendChild(frame);
  }

  function setupTabs() {
    document.querySelectorAll(".department-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".department-tab").forEach((x) => x.classList.remove("active"));
        this.classList.add("active");
        activeDepartment = this.dataset.dept;
        renderTheatre();
      });
    });
  }



  function init() {
    setupTabs();
    renderTheatre();
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
