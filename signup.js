/* ==========================================================================
   REFERBRIDGE — SIGNUP CONTROLLER (signup.js)
   ========================================================================== */

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = "🌙";
  }
}

function loadTheme() {
  applyTheme(localStorage.getItem("theme") || "dark");
}

function toggleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
  if (window.showToast) {
    window.showToast(`Switched to ${next} theme`, "info", next === "light" ? "☀️" : "🌙");
  }
}

function showError(message) {
  const box = document.getElementById("errorBox");
  document.getElementById("errorText").textContent = message;
  box.hidden = false;
  document.getElementById("infoBox").hidden = true;
  if (window.showToast) window.showToast(message, "danger", "⚠");
}

function showInfo(message) {
  const box = document.getElementById("infoBox");
  document.getElementById("infoText").textContent = message;
  box.hidden = false;
  document.getElementById("errorBox").hidden = true;
  if (window.showToast) window.showToast(message, "success", "✓");
}

function emailExists(email) {
  const users = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function calculatePasswordStrength(pass) {
  let score = 0;
  if (!pass) return { score: 0, text: "None", cssClass: "" };
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 1, text: "Weak", cssClass: "weak" };
  if (score === 2 || score === 3) return { score: 2, text: "Fair", cssClass: "fair" };
  if (score === 4) return { score: 3, text: "Good", cssClass: "good" };
  return { score: 4, text: "Strong", cssClass: "strong" };
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const signupForm = document.getElementById("signupForm");
  const sampleBtn = document.getElementById("sampleDataBtn");
  const passInput = document.getElementById("password");
  const strengthWrap = document.getElementById("strengthWrap");
  const strengthLabel = document.getElementById("strengthLabel");
  const strengthBar = document.getElementById("strengthBar");

  // Real-time password strength meter
  if (passInput && strengthWrap && strengthLabel && strengthBar) {
    passInput.addEventListener("input", function () {
      const val = passInput.value;
      if (val.length === 0) {
        strengthWrap.hidden = true;
        return;
      }
      strengthWrap.hidden = false;
      const res = calculatePasswordStrength(val);
      strengthLabel.textContent = res.text;
      strengthBar.className = `strength-bar ${res.cssClass}`;
    });
  }

  // 1-Click Sample Data Fill
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      document.getElementById("adminName").value = "Dr. Ananya Desai";
      document.getElementById("hospitalName").value = "Apex Multispecialty Hospital";
      document.getElementById("email").value = "admin@apexmultispecialty.com";
      document.getElementById("password").value = "ApexPass@2026";
      document.getElementById("confirmPassword").value = "ApexPass@2026";

      passInput.dispatchEvent(new Event("input"));

      if (window.showToast) {
        window.showToast("Sample hospital registration filled!", "info", "⚡");
      }
    });
  }

  // Handle Form Submission
  if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const adminName = document.getElementById("adminName").value.trim();
      const hospitalName = document.getElementById("hospitalName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!adminName || !hospitalName || !email || !password || !confirmPassword) {
        showError("Please fill in all registration fields.");
        return;
      }

      if (!isValidEmail(email)) {
        showError("Please enter a valid official email address.");
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
      }

      if (emailExists(email) || email.toLowerCase() === "admin@referbridge.com") {
        showError("An account with this email already exists. Please log in.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
      users.push({
        name: adminName,
        hospitalName: hospitalName,
        email: email,
        password: password
      });
      localStorage.setItem("referbridge_users", JSON.stringify(users));

      // Seed hospital profile
      const newProfile = {
        hospitalName: hospitalName,
        hospitalId: "RB-" + Math.floor(1000 + Math.random() * 9000),
        location: "Chandigarh, Sector 17",
        contact: "+91 98123 45678",
        specialties: "Cardiology, Neurology, Emergency Care",
        totalBeds: 150,
        occupiedBeds: 82,
        totalICU: 24,
        occupiedICU: 16
      };
      localStorage.setItem("referbridge_profile", JSON.stringify(newProfile));

      showInfo("Hospital facility registered successfully! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1100);
    });
  }
});
