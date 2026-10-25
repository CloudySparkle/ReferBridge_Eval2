/* ==========================================================================
   REFERBRIDGE — UNIFIED AUTH CONTROLLER (index.js)
   Handles Login & Hospital Registration within a single split-card interface.
   Inspired by unified authentication design with ReferBridge branding.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const btnBannerSwitch = document.getElementById("btnBannerSwitch");
  const welcomeBannerSplit = document.getElementById("welcomeBannerSplit");
  const welcomeBannerHeading = document.getElementById("welcomeBannerHeading");
  const welcomeBannerSub = document.getElementById("welcomeBannerSub");
  const linkSwitchToSignup = document.getElementById("linkSwitchToSignup");
  const linkSwitchToLogin = document.getElementById("linkSwitchToLogin");
  const btnQuickDemoLogin = document.getElementById("btnQuickDemoLogin");

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePass = document.getElementById("togglePass");
  const forgot = document.getElementById("forgot");
  const rememberCheckbox = document.getElementById("remember");
  const message = document.getElementById("message");

  const unifiedSignupForm = document.getElementById("unifiedSignupForm");
  const regAdminName = document.getElementById("regAdminName");
  const regCity = document.getElementById("regCity");
  const regHospitalName = document.getElementById("regHospitalName");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  const regConfirmPassword = document.getElementById("regConfirmPassword");
  const regStrengthWrap = document.getElementById("regStrengthWrap");
  const regStrengthBar = document.getElementById("regStrengthBar");
  const regStrengthLabel = document.getElementById("regStrengthLabel");

  let currentMode = "login"; // "login" or "signup"

  function showMessage(text, type = "error") {
    if (!message) return;
    message.className = `message ${type}`;
    message.textContent = text;
    message.style.display = "block";
  }

  function clearMessage() {
    if (!message) return;
    message.className = "message";
    message.textContent = "";
    message.style.display = "none";
  }

  // ── Switch Mode Function (Login <-> Sign Up) ──
  function switchMode(mode) {
    currentMode = mode;
    clearMessage();

    if (mode === "signup") {
      if (loginView) loginView.style.display = "none";
      if (signupView) signupView.style.display = "block";
      if (tabLoginBtn) tabLoginBtn.classList.remove("active");
      if (tabSignupBtn) tabSignupBtn.classList.add("active");

      if (welcomeBannerSplit) welcomeBannerSplit.classList.add("mode-signup");
      if (welcomeBannerHeading) welcomeBannerHeading.textContent = "Welcome Back!";
      if (welcomeBannerSub) {
        welcomeBannerSub.innerHTML = "To stay synchronized with the referral matrix<br>please sign in with your hospital credentials.";
      }
      if (btnBannerSwitch) {
        btnBannerSwitch.innerHTML = "<span>Sign In</span>";
      }
      window.location.hash = "signup";
    } else {
      if (signupView) signupView.style.display = "none";
      if (loginView) loginView.style.display = "block";
      if (tabSignupBtn) tabSignupBtn.classList.remove("active");
      if (tabLoginBtn) tabLoginBtn.classList.add("active");

      if (welcomeBannerSplit) welcomeBannerSplit.classList.remove("mode-signup");
      if (welcomeBannerHeading) welcomeBannerHeading.textContent = "Welcome!";
      if (welcomeBannerSub) {
        welcomeBannerSub.innerHTML = "Create your facility account.<br>Coordinate care on ReferBridge for Free!";
      }
      if (btnBannerSwitch) {
        btnBannerSwitch.innerHTML = "<span>Sign Up</span>";
      }
      history.replaceState(null, null, ' ');
    }
  }

  // Bind Switch Buttons
  if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => switchMode("login"));
  if (tabSignupBtn) tabSignupBtn.addEventListener("click", () => switchMode("signup"));
  if (linkSwitchToSignup) {
    linkSwitchToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      switchMode("signup");
    });
  }
  if (linkSwitchToLogin) {
    linkSwitchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      switchMode("login");
    });
  }
  if (btnBannerSwitch) {
    btnBannerSwitch.addEventListener("click", () => {
      switchMode(currentMode === "login" ? "signup" : "login");
    });
  }

  // Auto-switch if URL contains #signup
  if (window.location.hash === "#signup") {
    switchMode("signup");
  }

  // ── Show/Hide Password ──
  if (togglePass && passwordInput) {
    togglePass.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePass.textContent = isPassword ? "Hide" : "Show";
    });
  }

  // ── Forgot Password ──
  if (forgot) {
    forgot.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.showToast) {
        window.showToast("Contact your regional system administrator to reset credentials.", "info", "ℹ");
      } else {
        alert("Contact your regional system administrator to reset credentials.");
      }
    });
  }

  // ── Password Security Evaluator ──
  if (regPassword && regStrengthWrap && regStrengthBar && regStrengthLabel) {
    regPassword.addEventListener("input", function () {
      const val = this.value;
      if (!val) {
        regStrengthWrap.style.display = "none";
        return;
      }
      regStrengthWrap.style.display = "block";

      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        regStrengthBar.style.width = "30%";
        regStrengthBar.style.background = "var(--rb-red, #ef4444)";
        regStrengthLabel.textContent = "Weak";
        regStrengthLabel.style.color = "var(--rb-red, #ef4444)";
      } else if (score <= 4) {
        regStrengthBar.style.width = "65%";
        regStrengthBar.style.background = "var(--rb-yellow, #f59e0b)";
        regStrengthLabel.textContent = "Moderate";
        regStrengthLabel.style.color = "var(--rb-yellow, #f59e0b)";
      } else {
        regStrengthBar.style.width = "100%";
        regStrengthBar.style.background = "var(--rb-green, #10b981)";
        regStrengthLabel.textContent = "Strong / Verified";
        regStrengthLabel.style.color = "var(--rb-green, #10b981)";
      }
    });
  }

  // ── Feature 3: Quick Demo Credentials Fill ──
  if (btnQuickDemoLogin) {
    btnQuickDemoLogin.addEventListener("click", function () {
      const demoUser = {
        name: "Dr. Gurpreet Singh",
        hospitalName: "Fortis Hospital Mohali",
        email: "director@fortis-mohali.com",
        password: "SecurePassword123!",
        city: "Mohali",
        role: "admin"
      };

      // Ensure demo user is seeded in local store
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
      } catch (e) {
        users = [];
      }

      if (!users.some((u) => u.email.toLowerCase() === demoUser.email.toLowerCase())) {
        users.push(demoUser);
        localStorage.setItem("referbridge_users", JSON.stringify(users));
      }

      if (emailInput) emailInput.value = demoUser.email;
      if (passwordInput) passwordInput.value = demoUser.password;

      showMessage("Demonstration credentials loaded. Click Login to enter hub.", "success");
      if (window.showToast) {
        window.showToast("Demo hospital credentials pre-filled!", "success", "⚡");
      }
    });
  }

  // ── Login Form Submission ──
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

      if (!email || !password) {
        showMessage("Please enter your admin email and password.", "error");
        return;
      }

      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
      } catch (err) {
        registeredUsers = [];
      }

      // If user list is empty, seed demo user
      if (registeredUsers.length === 0) {
        registeredUsers.push({
          name: "Dr. Gurpreet Singh",
          hospitalName: "Fortis Hospital Mohali",
          email: "director@fortis-mohali.com",
          password: "SecurePassword123!",
          city: "Mohali",
          role: "admin"
        });
        localStorage.setItem("referbridge_users", JSON.stringify(registeredUsers));
      }

      const matchedUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!matchedUser) {
        showMessage("Invalid email or password. Please verify credentials or register below.", "error");
        if (window.showToast) {
          window.showToast("Incorrect credentials. Toggle to Register Hospital.", "danger", "✕");
        }
        return;
      }

      const userName = matchedUser.name || matchedUser.hospitalName || email.split("@")[0];

      const authData = {
        loggedIn: true,
        email: email,
        name: userName,
        hospitalName: matchedUser.hospitalName || "Partner Facility",
        role: matchedUser.role || "admin"
      };

      if (rememberMe) {
        localStorage.setItem("referbridge_auth", JSON.stringify(authData));
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("referbridge_remember", "true");
      } else {
        sessionStorage.setItem("referbridge_auth", JSON.stringify(authData));
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("adminEmail", email);
        localStorage.removeItem("referbridge_auth");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("referbridge_remember");
      }

      // Redux toolkit sync if available
      if (window.referbridgeStore && window.referbridgeStore.dispatch) {
        try {
          window.referbridgeStore.dispatch({
            type: "auth/loginSuccess",
            payload: { user: authData, rememberMe }
          });
        } catch (e) {}
      }

      showMessage("Login verified. Redirecting to coordination hub...", "success");

      if (window.showToast) {
        window.showToast(`Welcome back, ${userName}!`, "success", "✓");
      }

      setTimeout(() => {
        window.location.href = "home.html";
      }, 500);
    });
  }

  // ── Unified Registration Form Submission (Sign Up) ──
  if (unifiedSignupForm) {
    unifiedSignupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = regAdminName ? regAdminName.value.trim() : "";
      const city = regCity ? regCity.value : "Chandigarh";
      const hospitalName = regHospitalName ? regHospitalName.value.trim() : "";
      const email = regEmail ? regEmail.value.trim() : "";
      const password = regPassword ? regPassword.value : "";
      const confirmPassword = regConfirmPassword ? regConfirmPassword.value : "";

      if (!name || !hospitalName || !email || !password || !confirmPassword) {
        showMessage("All fields are required for facility registration.", "error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please provide a valid official email address.", "error");
        return;
      }

      if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
      }

      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("referbridge_users") || "[]");
      } catch (err) {
        users = [];
      }

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        showMessage("An account with this email is already registered. Please sign in.", "error");
        return;
      }

      const newUser = {
        name,
        hospitalName,
        city,
        email,
        password,
        role: "admin",
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem("referbridge_users", JSON.stringify(users));

      if (window.showToast) {
        window.showToast(`Registration complete for ${hospitalName}! Please log in.`, "success", "✓");
      }

      // Switch to login tab and prefill
      switchMode("login");
      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = "";
      showMessage("Registration successful! Enter your password to log in.", "success");
    });
  }
});
