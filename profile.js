/* ==========================================================================
   REFERBRIDGE — HOSPITAL PROFILE CONTROLLER (profile.js)
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

function computeStatus(availableBeds, totalBeds) {
  if (totalBeds === 0) return { label: "Unknown", css: "" };
  const ratio = availableBeds / totalBeds;
  if (ratio <= 0) return { label: "Full", css: "red" };
  if (ratio < 0.2) return { label: "Limited", css: "yellow" };
  return { label: "Available", css: "green" };
}

function updateSummaryFromForm() {
  const name = document.getElementById("hospitalName").value.trim() || "Hospital Name";
  const id = document.getElementById("hospitalId").value.trim() || "RB-1001";
  const loc = document.getElementById("location").value.trim() || "Location not set";
  const contact = document.getElementById("contact").value.trim() || "Contact not set";
  const spec = document.getElementById("specialties").value.trim() || "Specialties not set";

  const totalBeds = Number(document.getElementById("totalBeds").value) || 0;
  const occupiedBeds = Number(document.getElementById("occupiedBeds").value) || 0;
  const totalICU = Number(document.getElementById("totalICU").value) || 0;
  const occupiedICU = Number(document.getElementById("occupiedICU").value) || 0;

  const availableBeds = Math.max(totalBeds - occupiedBeds, 0);
  const availableICU = Math.max(totalICU - occupiedICU, 0);

  document.getElementById("summaryHospitalName").textContent = name;
  document.getElementById("summaryId").textContent = `Registry ID: ${id}`;
  document.getElementById("summaryLocation").textContent = loc;
  document.getElementById("summaryContact").textContent = contact;
  document.getElementById("summarySpecialties").textContent = spec;

  document.getElementById("summaryTotalBeds").textContent = totalBeds;
  document.getElementById("summaryAvailableBeds").textContent = availableBeds;
  document.getElementById("summaryTotalICU").textContent = totalICU;
  document.getElementById("summaryAvailableICU").textContent = availableICU;

  const occPct = totalBeds > 0 ? Math.min(Math.round((occupiedBeds / totalBeds) * 100), 100) : 0;
  document.getElementById("summaryOccupancyRate").textContent = `${occPct}%`;

  const occBar = document.getElementById("occupancyBar");
  if (occBar) {
    occBar.style.width = `${occPct}%`;
    if (occPct >= 90) occBar.style.background = "var(--rb-red)";
    else if (occPct >= 75) occBar.style.background = "var(--rb-yellow)";
    else occBar.style.background = "linear-gradient(90deg, var(--rb-teal), var(--rb-cyan))";
  }

  // Update Status Badge
  const status = computeStatus(availableBeds, totalBeds || 1);
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

function loadForm(profile) {
  document.getElementById("hospitalName").value = profile.hospitalName || "";
  document.getElementById("hospitalId").value = profile.hospitalId || "RB-1001";
  document.getElementById("location").value = profile.location || "";
  document.getElementById("contact").value = profile.contact || "";
  document.getElementById("specialties").value = profile.specialties || "";

  document.getElementById("totalBeds").value = profile.totalBeds || 0;
  document.getElementById("occupiedBeds").value = profile.occupiedBeds || 0;
  document.getElementById("totalICU").value = profile.totalICU || 0;
  document.getElementById("occupiedICU").value = profile.occupiedICU || 0;

  updateSummaryFromForm();
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const profile = getProfile();
  loadForm(profile);

  // Live recalculation on inputs
  const inputs = document.querySelectorAll("#profileForm input");
  inputs.forEach((input) => {
    input.addEventListener("input", updateSummaryFromForm);
  });

  // Form Submit
  const form = document.getElementById("profileForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const totalBeds = Number(document.getElementById("totalBeds").value) || 0;
      const occupiedBeds = Number(document.getElementById("occupiedBeds").value) || 0;
      const totalICU = Number(document.getElementById("totalICU").value) || 0;
      const occupiedICU = Number(document.getElementById("occupiedICU").value) || 0;

      if (occupiedBeds > totalBeds) {
        if (window.showToast) window.showToast("Occupied beds cannot exceed total beds!", "danger", "⚠");
        return;
      }

      if (occupiedICU > totalICU) {
        if (window.showToast) window.showToast("Occupied ICU beds cannot exceed total ICU beds!", "danger", "⚠");
        return;
      }

      const updated = {
        hospitalName: document.getElementById("hospitalName").value.trim() || "Hospital Facility",
        hospitalId: document.getElementById("hospitalId").value.trim() || "RB-1001",
        location: document.getElementById("location").value.trim(),
        contact: document.getElementById("contact").value.trim(),
        specialties: document.getElementById("specialties").value.trim(),
        totalBeds: totalBeds,
        occupiedBeds: occupiedBeds,
        totalICU: totalICU,
        occupiedICU: occupiedICU
      };

      localStorage.setItem("referbridge_profile", JSON.stringify(updated));
      updateSummaryFromForm();

      if (window.showToast) {
        window.showToast("Hospital profile & capacity broadcasted across network!", "success", "✓");
      }
    });
  }
});
