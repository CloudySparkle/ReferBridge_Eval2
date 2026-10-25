/* ==========================================================================
   REFERBRIDGE — DASHBOARD CONTROLLER (dashboard.js)
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

function getRequests() {
  let requests = JSON.parse(localStorage.getItem("referbridge_requests") || "null");
  if (!requests) {
    requests = [
      { id: "REQ-101", patientId: "PT-2291", age: 54, specialty: "Cardiology", condition: "Acute Myocardial Infarction", history: "Hypertension, Type 2 Diabetes", urgency: "Critical", hospital: "Lotus Care Hospital", time: "09:12 AM", status: "Accepted" },
      { id: "REQ-102", patientId: "PT-2292", age: 29, specialty: "Orthopedics", condition: "Compound Femur Fracture", history: "No prior surgeries", urgency: "High", hospital: "Sunrise Multispecialty", time: "09:47 AM", status: "Rejected" },
      { id: "REQ-103", patientId: "PT-2293", age: 67, specialty: "Neurology", condition: "Suspected Ischemic Stroke", history: "Atrial Fibrillation", urgency: "Critical", hospital: "Green Valley Hospital", time: "10:05 AM", status: "Pending" },
      { id: "REQ-104", patientId: "PT-2294", age: 8, specialty: "Pediatrics", condition: "Severe Dehydration", history: "Recent viral gastroenteritis", urgency: "Moderate", hospital: "City Care Clinic", time: "10:32 AM", status: "Pending" },
      { id: "REQ-105", patientId: "PT-2295", age: 41, specialty: "General Surgery", condition: "Acute Appendicitis", history: "No known allergies", urgency: "High", hospital: "Riverside Hospital", time: "11:15 AM", status: "Pending" }
    ];
    localStorage.setItem("referbridge_requests", JSON.stringify(requests));
  }
  return requests;
}

function computeStatus(availableBeds, totalBeds) {
  if (totalBeds === 0) return { label: "Unknown", cssClass: "" };
  const ratio = availableBeds / totalBeds;
  if (ratio <= 0) return { label: "Full", cssClass: "red" };
  if (ratio < 0.2) return { label: "Limited", cssClass: "yellow" };
  return { label: "Available", cssClass: "green" };
}

function renderDashboard() {
  const profile = getProfile();
  const requests = getRequests();

  const availableBeds = Math.max((profile.totalBeds || 0) - (profile.occupiedBeds || 0), 0);
  const availableICU = Math.max((profile.totalICU || 0) - (profile.occupiedICU || 0), 0);

  const heading = document.getElementById("hospitalNameHeading");
  const infoHospitalName = document.getElementById("infoHospitalName");
  const infoLocation = document.getElementById("infoLocation");
  const infoSpecialties = document.getElementById("infoSpecialties");

  if (heading) heading.textContent = `${profile.hospitalName || "Hospital"} Operations`;
  if (infoHospitalName) infoHospitalName.textContent = profile.hospitalName || "ReferBridge General Hospital";
  if (infoLocation) infoLocation.textContent = profile.location || "Location not set";
  if (infoSpecialties) infoSpecialties.textContent = profile.specialties || "Specialties not set";

  // Animated Counter Odometer
  if (window.animateCounter) {
    window.animateCounter("statTotalBeds", profile.totalBeds || 0, 700);
    window.animateCounter("statOccupiedBeds", profile.occupiedBeds || 0, 700);
    window.animateCounter("statAvailableBeds", availableBeds, 700);
    window.animateCounter("statTotalICU", profile.totalICU || 0, 700);
    window.animateCounter("statAvailableICU", availableICU, 700);
  } else {
    document.getElementById("statTotalBeds").textContent = profile.totalBeds || 0;
    document.getElementById("statOccupiedBeds").textContent = profile.occupiedBeds || 0;
    document.getElementById("statAvailableBeds").textContent = availableBeds;
    document.getElementById("statTotalICU").textContent = profile.totalICU || 0;
    document.getElementById("statAvailableICU").textContent = availableICU;
  }

  // Hospital Status Badge
  const status = computeStatus(availableBeds, profile.totalBeds || 1);
  const badge = document.getElementById("hospitalStatusBadge");
  const dot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  if (statusText) statusText.textContent = status.label;
  if (badge && dot) {
    if (status.cssClass === "yellow") {
      badge.style.background = "var(--rb-yellow-soft)";
      badge.style.color = "var(--rb-yellow)";
      badge.style.borderColor = "rgba(245,183,56,0.3)";
      dot.style.background = "var(--rb-yellow)";
    } else if (status.cssClass === "red") {
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

  // Referral Counters
  let pending = 0, accepted = 0, rejected = 0;
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].status === "Pending") pending++;
    else if (requests[i].status === "Accepted") accepted++;
    else if (requests[i].status === "Rejected") rejected++;
  }

  if (window.animateCounter) {
    window.animateCounter("statIncoming", requests.length, 600);
    window.animateCounter("statPending", pending, 600);
    window.animateCounter("statAccepted", accepted, 600);
    window.animateCounter("statRejected", rejected, 600);
  } else {
    document.getElementById("statIncoming").textContent = requests.length;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statAccepted").textContent = accepted;
    document.getElementById("statRejected").textContent = rejected;
  }
}

function renderAdminInfo(auth) {
  const name = auth.name || "Admin";
  const email = auth.email || "admin@referbridge.com";
  const nameEl = document.getElementById("adminNameText");
  const emailEl = document.getElementById("adminEmailText");
  const avatarEl = document.getElementById("adminAvatar");

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Quick Action Buttons
  const btnSync = document.getElementById("btnSyncCapacity");
  if (btnSync) {
    btnSync.addEventListener("click", function () {
      renderDashboard();
      if (window.showToast) {
        window.showToast("Hospital capacity synchronized with regional network", "success", "🔄");
      }
    });
  }

  const btnExport = document.getElementById("btnExportReport");
  if (btnExport) {
    btnExport.addEventListener("click", function () {
      if (window.showToast) {
        window.showToast("Generating Referral Summary Report (PDF/CSV)...", "info", "📄");
        setTimeout(() => {
          window.showToast("Report ready for download!", "success", "✓");
        }, 1200);
      }
    });
  }

  // --- Working ReferBot AI Controller ---
  const botLauncher = document.getElementById("referbotLauncher");
  const botWindow = document.getElementById("referbotWindow");
  const botClose = document.getElementById("referbotClose");
  const botInput = document.getElementById("referbotInput");
  const botSend = document.getElementById("referbotSend");
  const botMessages = document.getElementById("referbotMessages");
  const botChips = document.querySelectorAll(".bot-chip");

  if (botLauncher && botWindow) {
    botLauncher.addEventListener("click", () => {
      botWindow.classList.toggle("hidden");
      if (!botWindow.classList.contains("hidden") && botInput) {
        botInput.focus();
      }
    });
  }

  if (botClose && botWindow) {
    botClose.addEventListener("click", () => {
      botWindow.classList.add("hidden");
    });
  }

  function appendBotMessage(sender, text) {
    if (!botMessages) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-msg" : "bot-msg";
    msgDiv.style.marginBottom = "10px";
    msgDiv.style.padding = "8px 12px";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.fontSize = "12px";
    msgDiv.style.lineHeight = "1.5";
    
    if (sender === "user") {
      msgDiv.style.background = "rgba(20,228,184,0.15)";
      msgDiv.style.border = "1px solid rgba(20,228,184,0.3)";
      msgDiv.style.color = "#fff";
      msgDiv.style.textAlign = "right";
      msgDiv.textContent = text;
    } else {
      msgDiv.style.background = "rgba(255,255,255,0.05)";
      msgDiv.style.border = "1px solid var(--rb-border)";
      msgDiv.style.color = "var(--rb-text-main, #f0f7fd)";
      msgDiv.innerHTML = text;
    }
    botMessages.appendChild(msgDiv);
    botMessages.scrollTop = botMessages.scrollHeight;
  }

  function getBotResponse(input) {
    const q = input.toLowerCase().trim();
    if (q.includes("icu")) {
      return "🏥 <strong>ICU Availability:</strong><br>• PGIMER: 0 ICU beds (At Capacity)<br>• GMCH 32: 2 ICU beds free<br>• Fortis Mohali: 6 ICU beds free<br>• Lifeline Zirakpur: 9 ICU beds free<br>• Paras Panchkula: 5 ICU beds free";
    }
    if (q.includes("bed") || q.includes("capacity") || q.includes("stat")) {
      return "🛏 <strong>Regional Capacity Overview:</strong><br>• Total Beds Tracked: 3,800+<br>• Available Regional Vacancy: ~15%<br>• Mohali, Zirakpur, Chandigarh & Panchkula live sync active.";
    }
    if (q.includes("emergency")) {
      return "🆘 <strong>Emergency & Trauma Centers:</strong><br>• PGIMER Level 1 Trauma Center (Sector 12)<br>• GMCH 32 Emergency Block<br>• Fortis Mohali 24/7 Cardiac Emergency<br>• Civil Hospital Panchkula";
    }
    if (q.includes("network") || q.includes("hospital")) {
      return "🌐 <strong>ReferBridge Network:</strong><br>Connecting verified Government & Private hospitals exclusively across Chandigarh, Mohali, Panchkula & Zirakpur with real-time transfer triage.";
    }
    if (q.includes("referral") || q.includes("transfer")) {
      return "📥 <strong>Referrals:</strong><br>To transfer a patient, navigate to <strong>Incoming Requests</strong> or <strong>Hospital Network</strong> and select destination hospital to initiate transfer triage.";
    }
    return "💡 I can assist with <strong>ICU availability</strong>, <strong>bed capacity</strong>, <strong>emergency centers</strong>, and <strong>referral routes</strong> across the Tricity network.";
  }

  function sendUserQuery(text) {
    if (!text.trim()) return;
    appendBotMessage("user", text);
    if (botInput) botInput.value = "";
    setTimeout(() => {
      const reply = getBotResponse(text);
      appendBotMessage("bot", reply);
    }, 400);
  }

  if (botSend && botInput) {
    botSend.addEventListener("click", () => sendUserQuery(botInput.value));
    botInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendUserQuery(botInput.value);
      }
    });
  }

  botChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sendUserQuery(chip.textContent.replace("💡", "").trim());
    });
  });

  renderAdminInfo(auth);
  renderDashboard();
});
