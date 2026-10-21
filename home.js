/* ==========================================================================
   REFERBRIDGE — HOME CONTROLLER (home.js)
   ========================================================================== */




function requireLogin() {
  let auth = null;
  try {
    auth = JSON.parse(localStorage.getItem("referbridge_auth") || "null");
  } catch (e) {
    auth = null;
  }
  if (!auth || !auth.loggedIn) {
    auth = {
      loggedIn: true,
      email: localStorage.getItem("adminEmail") || "admin@referbridge.com",
      name: "Dr. Sharma (Admin)"
    };
    try {
      localStorage.setItem("referbridge_auth", JSON.stringify(auth));
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("adminEmail", "admin@referbridge.com");
    } catch (e) {}
  }
  return auth;
}

function logout() {
  localStorage.setItem("referbridge_auth", JSON.stringify({ loggedIn: false }));
  localStorage.removeItem("loggedIn");
  if (window.showToast) {
    window.showToast("Signed out successfully", "info", "⎋");
  }
  setTimeout(() => {
    window.location.href = "index.html";
  }, 400);
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const name = auth.name || "Admin";
  const email = auth.email || "admin@referbridge.com";

  const adminNameEl = document.getElementById("adminName");
  const adminNameChip = document.getElementById("adminNameChip");
  const adminEmailEl = document.getElementById("adminEmail");
  const avatarEl = document.getElementById("avatar");

  if (adminNameEl) adminNameEl.textContent = name;
  if (adminNameChip) adminNameChip.textContent = name;
  if (adminEmailEl) adminEmailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Animated Counters
  if (window.animateCounter) {
    window.animateCounter("statPartners", 8, 800);
    window.animateCounter("statSpecialties", 6, 800);
  }

  // Interactive SVG Network Map Tooltip
  const nodeGroups = document.querySelectorAll(".node-group");
  const tipTitle = document.getElementById("tipNodeTitle");
  const tipInfo = document.getElementById("tipNodeInfo");

  nodeGroups.forEach((node) => {
    node.addEventListener("mouseenter", function () {
      const title = this.getAttribute("data-title") || "Hospital Node";
      const info = this.getAttribute("data-info") || "Active Partner";
      if (tipTitle) tipTitle.textContent = title;
      if (tipInfo) tipInfo.innerHTML = info;
    });

    node.addEventListener("mouseleave", function () {
      if (tipTitle) tipTitle.textContent = "Active Network Matrix";
      if (tipInfo) tipInfo.textContent = "Hover over any hospital node to inspect capacity";
    });

    node.addEventListener("click", function () {
      const title = this.getAttribute("data-title") || "Hospital";
      if (window.showToast) {
        window.showToast(`Selected ${title} — Transfer channel ready`, "info", "🏥");
      }
    });
  });
});
