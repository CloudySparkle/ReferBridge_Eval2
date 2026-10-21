/* ==========================================================================
   REFERBRIDGE — LOGIN CONTROLLER (index.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePass = document.getElementById("togglePass");
  const forgot = document.getElementById("forgot");
  const message = document.getElementById("message");
  const autoFillDemoBtn = document.getElementById("autoFillDemoBtn");

  // Show/Hide Password
  if (togglePass && passwordInput) {
    togglePass.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePass.textContent = isPassword ? "Hide" : "Show";
    });
  }

  // Forgot Password Toast
  if (forgot) {
    forgot.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.showToast) {
        window.showToast("Evaluation mode: Demo password is 'admin123'", "info", "ℹ");
      } else {
        alert("Evaluation mode: Demo password is 'admin123'");
      }
    });
  }

  // 1-Click Demo Auto-Fill
  if (autoFillDemoBtn && emailInput && passwordInput) {
    autoFillDemoBtn.addEventListener("click", function () {
      emailInput.value = "admin@referbridge.com";
      passwordInput.value = "admin123";

      if (window.showToast) {
        window.showToast("Demo credentials populated!", "success", "⚡");
      }

      // Smooth trigger submit after 300ms
      setTimeout(() => {
        loginForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }, 350);
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      let savedUsers = [];
      try {
        savedUsers = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
      } catch (err) {
        savedUsers = [];
      }

      let savedUser = null;
      try {
        savedUser = JSON.parse(localStorage.getItem("referbridgeUser") || "null");
      } catch (err) {
        savedUser = null;
      }

      // Match demo user OR registered user
      const isDemo = email.toLowerCase() === "admin@referbridge.com" && password === "admin123";
      const matchedRegistered = savedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      const isLegacySaved = savedUser && savedUser.email === email && savedUser.password === password;

      if (!isDemo && !matchedRegistered && !isLegacySaved) {
        if (message) {
          message.className = "message error";
          message.textContent = "Invalid email or password. Use demo credentials or register.";
        }
        if (window.showToast) {
          window.showToast("Incorrect email or password", "danger", "✕");
        }
        return;
      }

      const userName = matchedRegistered ? matchedRegistered.name : (savedUser && savedUser.adminName ? savedUser.adminName : "Dr. Sharma");

      // Save complete session state
      const auth = {
        loggedIn: true,
        email: email,
        name: userName
      };

      localStorage.setItem("referbridge_auth", JSON.stringify(auth));
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("adminEmail", email);

      if (message) {
        message.className = "message success";
        message.textContent = "Login verified. Redirecting to network dashboard...";
      }

      if (window.showToast) {
        window.showToast(`Welcome back, ${userName}!`, "success", "✓");
      }

      setTimeout(() => {
        window.location.href = "home.html";
      }, 500);
    });
  }
});
