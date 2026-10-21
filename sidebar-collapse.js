/* ==========================================================================
   REFERBRIDGE — SHARED CORE INTERACTION CONTROLLER & AI COPILOT
   Sidebar, Toast System, Command Palette (Ctrl+K), ReferBot AI, Emergency SOS
   ========================================================================== */

(function () {
  const KEY_SIDEBAR = "referbridge_sidebar_collapsed";
  const KEY_SOUND = "referbridge_sound_muted";

  window.playSound = function() {};

  
  /* --------------------------------------------------------------------------
     CORE SYSTEM FUNCTIONS (Theme & Auth)
     -------------------------------------------------------------------------- */
  window.applyTheme = function(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      const icon = document.getElementById("themeIcon");
      if (icon) icon.innerHTML = "&#9788;";
    } else {
      document.documentElement.removeAttribute("data-theme");
      const icon = document.getElementById("themeIcon");
      if (icon) icon.innerHTML = "&#127769;";
    }
  };

  window.loadTheme = function() {
    window.applyTheme(localStorage.getItem("theme") || "dark");
  };

  window.toggleTheme = function() {
    const current = localStorage.getItem("theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    window.applyTheme(next);
    if (window.showToast) {
      window.showToast(`Switched to ${next} theme`, "info", next === "light" ? "&#9788;" : "&#127769;");
    }
  };

  window.requireLogin = function() {
    let auth = JSON.parse(localStorage.getItem("referbridge_auth") || "null");
    if (!auth || !auth.loggedIn) {
      if (localStorage.getItem("loggedIn") === "true") {
        auth = { loggedIn: true, email: localStorage.getItem("adminEmail") || "admin@referbridge.com" };
        localStorage.setItem("referbridge_auth", JSON.stringify(auth));
      } else {
        window.location.href = "index.html";
        return null;
      }
    }
    return auth;
  };

  window.handleLogout = function() {
    localStorage.setItem("referbridge_auth", JSON.stringify({ loggedIn: false }));
    localStorage.removeItem("loggedIn");
    if (window.showToast) {
      window.showToast("Signed out", "info", "&#128682;");
    }
    setTimeout(() => {
      window.location.href = "index.html";
    }, 400);
  };

  /* --------------------------------------------------------------------------
     2. TOAST NOTIFICATION ENGINE
     -------------------------------------------------------------------------- */
  window.showToast = function (message, type = "success", iconText = null, duration = 3200) {
    let container = document.querySelector(".rb-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "rb-toast-container";
      document.body.appendChild(container);
    }

    const defaultIcons = { success: "✓", info: "ℹ", warning: "⚠", danger: "✕" };
    const icon = iconText || defaultIcons[type] || "✓";

    const toast = document.createElement("div");
    toast.className = `rb-toast rb-toast-${type}`;
    toast.innerHTML = `
      <div class="rb-toast-icon">${icon}</div>
      <div class="rb-toast-message">${message}</div>
      <button type="button" class="rb-toast-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(toast);
    if (type === "success") window.playSound("success");
    else if (type === "danger" || type === "warning") window.playSound("warning");
    else window.playSound("click");

    const closeBtn = toast.querySelector(".rb-toast-close");
    let timer = null;

    function dismiss() {
      if (timer) clearTimeout(timer);
      toast.classList.add("toast-hide");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    }

    closeBtn.addEventListener("click", dismiss);
    timer = setTimeout(dismiss, duration);
  };

  /* --------------------------------------------------------------------------
     3. ANIMATED STAT ODOMETER / NUMBER COUNTER
     -------------------------------------------------------------------------- */
  window.animateCounter = function (elOrId, targetValue, duration = 750, suffix = "") {
    const el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) return;

    const target = Number(targetValue);
    if (isNaN(target)) {
      el.textContent = targetValue;
      return;
    }

    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  };

  /* --------------------------------------------------------------------------
     4. MODAL CONTROLLER
     -------------------------------------------------------------------------- */
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    window.playSound("click");
    // Hide sidebar collapse toggle while any modal is open
    const collapseBtn = document.querySelector(".sidebar-collapse-toggle");
    if (collapseBtn) collapseBtn.style.display = "none";
    const focusable = modal.querySelector("input, select, textarea, button");
    if (focusable) focusable.focus();
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    window.playSound("click");
    // Restore collapse toggle only when no other modal remains open
    const anyOpen = document.querySelector(".rb-modal-backdrop:not(.hidden), .cmd-palette-backdrop:not(.hidden)");
    if (!anyOpen) {
      const collapseBtn = document.querySelector(".sidebar-collapse-toggle");
      if (collapseBtn) collapseBtn.style.display = "";
    }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".rb-modal-backdrop:not(.hidden), .cmd-palette-backdrop:not(.hidden)").forEach((m) => {
        m.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("rb-modal-backdrop") || e.target.classList.contains("cmd-palette-backdrop")) {
      e.target.classList.add("hidden");
      document.body.style.overflow = "";
    }
  });

  /* --------------------------------------------------------------------------
     5. UNIVERSAL COMMAND PALETTE (CTRL + K)
     -------------------------------------------------------------------------- */
  const COMMANDS = [
    { title: "Dashboard Overview", desc: "View real-time hospital capacity & referral feed", url: "dashboard.html", icon: "▦", group: "Navigation" },
    { title: "Home Network Hub", desc: "Regional transfer matrix & partner statistics", url: "home.html", icon: "⌂", group: "Navigation" },
    { title: "Bed Management & Theatre", desc: "Inspect ICU beds & update occupancy counts", url: "beds.html", icon: "🛏", group: "Navigation" },
    { title: "Incoming Referral Requests", desc: "Review, triage and accept inbound transfers", url: "requests.html", icon: "📥", group: "Navigation" },
    { title: "Hospital Directory Network", desc: "Browse partner facilities & dispatch transfer", url: "network.html", icon: "🕸", group: "Navigation" },
    { title: "Capacity & Flow Analytics", desc: "7-day trend graphs, donut gauge & demand radar", url: "analytics.html", icon: "📊", group: "Navigation" },
    { title: "Hospital Profile Settings", desc: "Configure medical specialties & capacity limits", url: "profile.html", icon: "🏥", group: "Navigation" },
    { title: "Broadcast Code Red SOS", desc: "Trigger regional emergency critical referral alert", action: "sos", icon: "🚨", group: "Emergency Actions" },
    { title: "Open ReferBot AI Copilot", desc: "Ask clinical referral copilot questions", action: "ai", icon: "🤖", group: "Emergency Actions" },
    { title: "Toggle Light / Dark Theme", desc: "Switch clinical color appearance mode", action: "theme", icon: "🌓", group: "System" }
  ];

  function openCommandPalette() {
    let palette = document.getElementById("cmdPaletteBackdrop");
    if (!palette) {
      palette = document.createElement("div");
      palette.id = "cmdPaletteBackdrop";
      palette.className = "cmd-palette-backdrop";
      palette.innerHTML = `
        <div class="cmd-palette">
          <div class="cmd-search-wrap">
            <span class="cmd-search-icon">🔍</span>
            <input type="text" id="cmdInput" placeholder="Type a command, page, or action..." autocomplete="off">
            <kbd>ESC</kbd>
          </div>
          <div class="cmd-results" id="cmdResults"></div>
        </div>
      `;
      document.body.appendChild(palette);

      const input = document.getElementById("cmdInput");
      input.addEventListener("input", function () {
        renderCommandResults(this.value.trim());
      });
    }

    palette.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const input = document.getElementById("cmdInput");
    if (input) {
      input.value = "";
      input.focus();
    }
    renderCommandResults("");
    window.playSound("click");
  }

  function renderCommandResults(query) {
    const container = document.getElementById("cmdResults");
    if (!container) return;
    container.innerHTML = "";

    const q = query.toLowerCase();
    const filtered = COMMANDS.filter((c) => !q || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding: 24px; text-align:center; color: var(--rb-text-muted); font-size:13px;">No matching commands or pages found.</div>`;
      return;
    }

    const groups = {};
    filtered.forEach((c) => {
      groups[c.group] = groups[c.group] || [];
      groups[c.group].push(c);
    });

    Object.keys(groups).forEach((grp) => {
      const gTitle = document.createElement("div");
      gTitle.className = "cmd-group-title";
      gTitle.textContent = grp;
      container.appendChild(gTitle);

      groups[grp].forEach((cmd) => {
        const item = document.createElement("div");
        item.className = "cmd-item";
        item.innerHTML = `
          <span class="cmd-item-icon">${cmd.icon}</span>
          <div>
            <strong>${cmd.title}</strong>
            <div style="font-size:11px; color:var(--rb-text-muted); margin-top:2px;">${cmd.desc}</div>
          </div>
          <span class="cmd-item-desc">${cmd.url ? 'Jump →' : 'Run ⚡'}</span>
        `;

        item.addEventListener("click", () => {
          document.getElementById("cmdPaletteBackdrop").classList.add("hidden");
          document.body.style.overflow = "";

          if (cmd.url) {
            window.location.href = cmd.url;
          } else if (cmd.action === "sos") {
            window.openModal("emergencySosModal");
          } else if (cmd.action === "ai") {
            toggleReferBot(true);
          } else if (cmd.action === "theme") {
            const current = localStorage.getItem("theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            if (window.applyTheme) window.applyTheme(next);
            else {
              if (next === "light") document.documentElement.setAttribute("data-theme", "light");
              else document.documentElement.removeAttribute("data-theme");
            }
            window.showToast(`Theme set to ${next}`, "info");
          } else if (cmd.action === "sound") {
            const muted = localStorage.getItem(KEY_SOUND) === "1";
            localStorage.setItem(KEY_SOUND, muted ? "0" : "1");
            window.showToast(`UI Audio ${muted ? "Enabled" : "Muted"}`, "info", muted ? "🔊" : "🔇");
          }
        });

        container.appendChild(item);
      });
    });
  }

  // Global Ctrl+K binding
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCommandPalette();
    }
  });

  window.openCommandPalette = openCommandPalette;

  /* --------------------------------------------------------------------------
     6. REFERBOT AI COPILOT ENGINE (INTELLIGENT MEDICAL REFERRAL ASSISTANT)
     -------------------------------------------------------------------------- */
  function getLiveContext() {
    let profile = JSON.parse(localStorage.getItem("referbridge_profile") || "{}");
    let requests = JSON.parse(localStorage.getItem("referbridge_requests") || "[]");

    const totalBeds = profile.totalBeds || 120;
    const occupiedBeds = profile.occupiedBeds || 78;
    const totalICU = profile.totalICU || 20;
    const occupiedICU = profile.occupiedICU || 14;

    const availableBeds = Math.max(totalBeds - occupiedBeds, 0);
    const availableICU = Math.max(totalICU - occupiedICU, 0);

    let pending = 0, accepted = 0;
    requests.forEach((r) => {
      if (r.status === "Pending") pending++;
      else if (r.status === "Accepted") accepted++;
    });

    return {
      hospitalName: profile.hospitalName || "ReferBridge General Hospital",
      location: profile.location || "Sector 12, Chandigarh",
      specialties: profile.specialties || "Cardiology, Neurology, Orthopedics",
      availableBeds,
      totalBeds,
      availableICU,
      totalICU,
      pendingRequests: pending,
      acceptedRequests: accepted,
      totalRequests: requests.length
    };
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    const ctx = getLiveContext();

    if (q.includes("icu") || q.includes("ventilator") || q.includes("critical bed")) {
      return `Currently, **${ctx.hospitalName}** has **${ctx.availableICU} open ICU beds** out of ${ctx.totalICU} total units.\n\n• Available: **${ctx.availableICU} beds**\n• Occupancy: **${Math.round(((ctx.totalICU - ctx.availableICU) / ctx.totalICU) * 100)}%**\n\n*Would you like me to hold an emergency ICU bed for an incoming patient?*`;
    }

    if (q.includes("bed") || q.includes("capacity") || q.includes("available")) {
      return `Live capacity breakdown for **${ctx.hospitalName}**:\n\n• **General Ward:** ${ctx.availableBeds} beds available (${ctx.totalBeds} total)\n• **ICU / Critical:** ${ctx.availableICU} beds open (${ctx.totalICU} total)\n• **Overall Status:** ${ctx.availableBeds > 10 ? '🟢 Available for Intake' : '🟡 Limited Beds'}`;
    }

    if (q.includes("pending") || q.includes("request") || q.includes("triage")) {
      return `You have **${ctx.pendingRequests} pending referral requests** awaiting clinical triage.\n\n• **Total Inbound:** ${ctx.totalRequests} referrals\n• **Accepted Admissions:** ${ctx.acceptedRequests}\n• **Pending Triage:** ${ctx.pendingRequests}\n\n*Tip: Go to **Incoming Requests** to inspect patient medical dossiers.*`;
    }

    if (q.includes("cardiac") || q.includes("heart") || q.includes("infarction") || q.includes("chest pain")) {
      return `🚨 **Cardiac Triage Protocol Active:**\n\n1. Check STEMI/NSTEMI ECG telemetry.\n2. Inbound cath lab activation recommended.\n3. Available cardiology beds at **Lotus Care Hospital** (3.2 km) and **Apex Medical Institute** (8.0 km).\n4. Ambulance unit ETA: approx. **12–14 minutes**.`;
    }

    if (q.includes("stroke") || q.includes("neuro") || q.includes("brain")) {
      return `🧠 **Acute Stroke Triage Protocol:**\n\n• Nearest Comprehensive Stroke Center: **Green Valley Hospital** (9.4 km) & **Apex Medical** (8.0 km).\n• Recommended action: Schedule emergency CT/MRI head perfusion scan immediately upon transfer arrival.`;
    }

    if (q.includes("ambulance") || q.includes("eta") || q.includes("transfer time")) {
      return `🚑 **Regional Ambulance Transit Estimates:**\n\n• Lotus Care Hospital: **8–11 mins** (3.2 km)\n• Sunrise Multispecialty: **14–18 mins** (6.8 km)\n• Green Valley Hospital: **20–25 mins** (9.4 km)\n• Riverside Hospital: **26–32 mins** (12.1 km)`;
    }

    if (q.includes("report") || q.includes("shift") || q.includes("summary")) {
      return `📋 **Executive Capacity Summary:**\n\n• **Facility:** ${ctx.hospitalName}\n• **Active Referrals:** ${ctx.totalRequests} handled\n• **Bed Availability:** ${ctx.availableBeds} General / ${ctx.availableICU} ICU\n• **System Status:** Fully synchronized with regional emergency network.`;
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hello Dr. Admin! 👋 I'm **ReferBot AI**, your clinical referral & capacity copilot. How can I assist you with regional patient transfers or bed availability today?`;
    }

    return `I analyzed your query regarding *"${query}"* against the live **ReferBridge Hospital Alliance Database**.\n\n• **Facility:** ${ctx.hospitalName}\n• **Open Beds:** ${ctx.availableBeds} General / ${ctx.availableICU} ICU open\n• **Pending Inbound:** ${ctx.pendingRequests} requests\n\nYou can ask me to triage specific cases, check partner hospital distances, or calculate ambulance transit times!`;
  }

  function injectReferBot() {
    if (document.getElementById("referbotLauncher")) return;

    // 1. Floating Launcher Button
    const launcher = document.createElement("button");
    launcher.id = "referbotLauncher";
    launcher.className = "referbot-launcher";
    launcher.type = "button";
    launcher.innerHTML = `
      <span class="referbot-sparkle">✦</span>
      <span>ReferBot AI</span>
    `;
    launcher.title = "Open ReferBot AI Medical Copilot (Ctrl + K -> AI)";
    document.body.appendChild(launcher);

    // 2. Chat Window
    const win = document.createElement("div");
    win.id = "referbotWindow";
    win.className = "referbot-window hidden";
    win.innerHTML = `
      <div class="referbot-header">
        <div class="referbot-profile">
          <div class="referbot-avatar">✦</div>
          <div>
            <b>ReferBot AI Copilot</b>
            <small><span class="live-radar-dot"></span> Online • Medical Triage v2.4</small>
          </div>
        </div>
        <div class="referbot-controls">
          <button type="button" class="referbot-ctrl-btn" id="botClearBtn" title="Clear chat history">🗑</button>
          <button type="button" class="referbot-ctrl-btn" id="botCloseBtn" title="Close chat">×</button>
        </div>
      </div>

      <div class="referbot-messages" id="botMessages">
        <div class="bot-msg">
          Hello! 👋 I'm <strong>ReferBot AI</strong>, your medical referral copilot. Ask me about live bed capacity, cardiac/stroke triage protocols, or ambulance transfer transit times.
        </div>
      </div>

      <div class="referbot-chips">
        <button type="button" class="bot-chip" data-query="Check live ICU beds">🛏 Check ICU Beds</button>
        <button type="button" class="bot-chip" data-query="Triage cardiac patient transfer">🚨 Cardiac Triage</button>
        <button type="button" class="bot-chip" data-query="Find nearest stroke center">🧠 Stroke Center</button>
        <button type="button" class="bot-chip" data-query="Calculate ambulance transit times">🚑 Ambulance ETA</button>
        <button type="button" class="bot-chip" data-query="Generate shift capacity summary">📋 Shift Summary</button>
      </div>

      <div class="referbot-input-row">
        <input type="text" id="botInput" placeholder="Ask ReferBot AI anything..." autocomplete="off">
        <button type="button" class="btn-bot-mic" id="botMicBtn" title="Simulate voice medical dictation">🎙</button>
        <button type="button" class="btn-bot-send" id="botSendBtn" title="Send message">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    // Attach Event Listeners
    launcher.addEventListener("click", () => toggleReferBot());
    document.getElementById("botCloseBtn").addEventListener("click", () => toggleReferBot(false));

    document.getElementById("botClearBtn").addEventListener("click", () => {
      const msgs = document.getElementById("botMessages");
      if (msgs) {
        msgs.innerHTML = `<div class="bot-msg">Chat history cleared. How can I help you coordinate patient transfers today?</div>`;
        window.playSound("click");
      }
    });

    const sendBtn = document.getElementById("botSendBtn");
    const input = document.getElementById("botInput");

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      sendUserMessage(text);
    }

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSend();
    });

    // Voice Dictation Simulation
    const micBtn = document.getElementById("botMicBtn");
    micBtn.addEventListener("click", function () {
      if (micBtn.classList.contains("recording")) {
        micBtn.classList.remove("recording");
        return;
      }
      micBtn.classList.add("recording");
      window.playSound("ai");
      if (window.showToast) window.showToast("Listening... (Simulated Voice Dictation)", "info", "🎙");

      setTimeout(() => {
        micBtn.classList.remove("recording");
        input.value = "Emergency ICU bed availability for incoming trauma transfer";
        handleSend();
      }, 1800);
    });

    // Suggestion Chips
    win.querySelectorAll(".bot-chip").forEach((chip) => {
      chip.addEventListener("click", function () {
        const q = this.getAttribute("data-query");
        sendUserMessage(q);
      });
    });
  }

  function toggleReferBot(forceOpen = null) {
    const win = document.getElementById("referbotWindow");
    if (!win) return;
    const shouldOpen = forceOpen !== null ? forceOpen : win.classList.contains("hidden");
    if (shouldOpen) {
      win.classList.remove("hidden");
      window.playSound("ai");
      const input = document.getElementById("botInput");
      if (input) input.focus();
    } else {
      win.classList.add("hidden");
      window.playSound("click");
    }
  }

  function sendUserMessage(text) {
    const msgContainer = document.getElementById("botMessages");
    if (!msgContainer) return;

    // Append User Message
    const userDiv = document.createElement("div");
    userDiv.className = "user-msg";
    userDiv.textContent = text;
    msgContainer.appendChild(userDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    window.playSound("click");

    // Append Typing Indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Simulate AI Response Delay
    setTimeout(() => {
      if (typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);

      const botDiv = document.createElement("div");
      botDiv.className = "bot-msg";
      const reply = generateAIResponse(text);
      botDiv.innerHTML = reply.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      msgContainer.appendChild(botDiv);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      window.playSound("ai");
    }, 600);
  }

  /* --------------------------------------------------------------------------
     7. EMERGENCY SOS FAST-TRACK BROADCAST MODAL
     -------------------------------------------------------------------------- */
  function injectEmergencySosModal() {
    if (document.getElementById("emergencySosModal")) return;

    const modal = document.createElement("div");
    modal.id = "emergencySosModal";
    modal.className = "rb-modal-backdrop hidden";
    modal.innerHTML = `
      <div class="rb-modal" style="border-color: rgba(255,84,101,0.5); box-shadow: 0 28px 75px rgba(0,0,0,0.7), 0 0 50px rgba(255,84,101,0.3);">
        <div class="rb-modal-head" style="border-bottom-color: rgba(255,84,101,0.3);">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px; animation: rbFloat 1.2s infinite;">🚨</span>
            <div>
              <h3 style="color:var(--rb-red);">CODE RED EMERGENCY SOS BROADCAST</h3>
              <small style="color:var(--rb-text-muted); font-size:11px;">Regional Emergency Medical Alliance Alert Protocol</small>
            </div>
          </div>
          <button type="button" class="rb-modal-close-btn" onclick="closeModal('emergencySosModal')">×</button>
        </div>
        <div class="rb-modal-body">
          <div style="padding:14px; border-radius:10px; background:var(--rb-red-soft); border:1px solid rgba(255,84,101,0.4); margin-bottom:18px;">
            <strong style="color:#ff9a9d; display:block; font-size:13.5px; margin-bottom:4px;">Emergency Fast-Track Referral Activation</strong>
            <span style="font-size:12px; color:var(--rb-text-main);">Broadcasting a Code Red alert instantly notifies all 8 regional partner trauma &amp; ICU facilities to clear bays and deploy advanced life support units.</span>
          </div>

          <div style="margin-bottom:14px;">
            <label style="font-size:12px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:6px;">Emergency Clinical Category</label>
            <select id="sosCategorySelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-red); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px; font-weight:700;">
              <option value="Severe Poly-Trauma / Mass Casualty">🔴 Severe Poly-Trauma / Mass Casualty</option>
              <option value="Acute Massive STEMI (Cath Lab Ready)">🔴 Acute Massive STEMI (Cath Lab Ready)</option>
              <option value="Acute Ischemic Stroke (< 3 Hr Window)">🔴 Acute Ischemic Stroke (< 3 Hr Window)</option>
              <option value="Critical Pediatric Respiratory Failure">🔴 Critical Pediatric Respiratory Failure</option>
            </select>
          </div>

          <div style="margin-bottom:14px;">
            <label style="font-size:12px; font-weight:600; color:var(--rb-text-muted); display:block; margin-bottom:6px;">Patient Demographics / Identifier</label>
            <input type="text" id="sosPatientId" value="EMERGENCY-PT-${Math.floor(1000 + Math.random() * 9000)}" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(255,255,255,0.04); color:var(--rb-text-main); font-size:13px;">
          </div>
        </div>
        <div class="rb-modal-foot">
          <button type="button" class="btn-ghost" onclick="closeModal('emergencySosModal')">Cancel</button>
          <button type="button" class="btn-primary" id="btnDispatchSos" style="background: linear-gradient(135deg, #ff5465, #ff8c42); color:#ffffff; font-weight:800;">
            🚨 DISPATCH REGIONAL SOS BROADCAST
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("btnDispatchSos").addEventListener("click", function () {
      const category = document.getElementById("sosCategorySelect").value;
      const patient = document.getElementById("sosPatientId").value;

      const newReq = {
        id: "SOS-" + Math.floor(900 + Math.random() * 99),
        patientId: patient,
        age: 42,
        specialty: "Trauma / Emergency",
        condition: `CODE RED: ${category}`,
        history: "Emergency SOS fast-track broadcast protocol",
        urgency: "Critical",
        hospital: "Regional Emergency Dispatch",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Pending"
      };

      let reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "[]");
      reqs.unshift(newReq);
      localStorage.setItem("referbridge_requests", JSON.stringify(reqs));

      window.closeModal("emergencySosModal");
      window.playSound("sos");

      if (window.showToast) {
        window.showToast(`🚨 CODE RED DISPATCHED: ${category} broadcasted to all hospitals!`, "danger", "🚨", 5000);
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. SIDEBAR & AUDIO TOGGLE INITIALIZATION
     -------------------------------------------------------------------------- */
  function updateButtonState(collapsed) {
    const btn = document.querySelector(".sidebar-collapse-toggle");
    if (!btn) return;
    btn.setAttribute("aria-label", collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation");
    btn.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
    btn.dataset.state = collapsed ? "closed" : "open";
  }

  function setCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    try {
      localStorage.setItem(KEY_SIDEBAR, collapsed ? "1" : "0");
    } catch (e) {}
    updateButtonState(collapsed);
  }

  function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.querySelectorAll(".nav-link, nav a").forEach((link) => {
      const textSpan = link.querySelector("span:not(.nav-icon)") || link;
      const label = (textSpan.textContent || link.textContent || "").trim();
      if (label && !link.hasAttribute("data-tooltip")) {
        link.setAttribute("data-tooltip", label);
      }
    });

    let btn = document.querySelector(".sidebar-collapse-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sidebar-collapse-toggle";
      btn.innerHTML = "<span>&#8249;</span>";
      document.body.appendChild(btn);
    }

    btn.onclick = function (e) {
      e.stopPropagation();
      setCollapsed(!document.body.classList.contains("sidebar-collapsed"));
    };

    let saved = false;
    try {
      saved = localStorage.getItem(KEY_SIDEBAR) === "1";
    } catch (e) {}
    setCollapsed(saved);

    // Attach Topbar Command Search & SOS Buttons if present
    document.querySelectorAll(".btn-open-cmd, .topbar-cmd-chip").forEach((el) => {
      el.addEventListener("click", openCommandPalette);
    });

    document.querySelectorAll(".btn-emergency-sos").forEach((el) => {
      el.addEventListener("click", () => window.openModal("emergencySosModal"));
    });
  }

  function initGlobal() {
    initSidebar();
    injectReferBot();
    injectEmergencySosModal();
    initVoiceAssistant();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobal);
  } else {
    initGlobal();
  }


  /* --------------------------------------------------------------------------
     TOPBAR MIC / VOICE ASSISTANT  � redirect-on-recognition
     -------------------------------------------------------------------------- */
  function initVoiceAssistant() {
    var micBtn = document.getElementById("topbarMicBtn");
    if (!micBtn) return;

    // Remove any stale modal
    var existing = document.getElementById("rb-voice-modal");
    if (existing) existing.remove();

    // Detect base path so links work from any page depth
    var base = (function() {
      var s = window.location.pathname;
      var parts = s.split("/");
      parts.pop(); // remove filename
      return parts.join("/") + "/";
    })();

    // Intent ? page mapping
    var routes = [
      { pattern: /\b(icu|intensive care|critical care)\b/,             page: "beds.html",      label: "ICU / Bed Management" },
      { pattern: /\b(bed|beds|ward|general ward|occupancy|vacant)\b/,  page: "beds.html",      label: "Bed Management" },
      { pattern: /\b(dashboard|overview|status|summary|capacity)\b/,   page: "dashboard.html", label: "Dashboard" },
      { pattern: /\b(request|referral|incoming|transfer|admit)\b/,     page: "requests.html",  label: "Referral Requests" },
      { pattern: /\b(network|partner|hospital|nearby|available)\b/,    page: "network.html",   label: "Hospital Network" },
      { pattern: /\b(analytic|report|trend|graph|chart|data)\b/,       page: "analytics.html", label: "Analytics" },
      { pattern: /\b(profile|setting|detail|info|about)\b/,            page: "profile.html",   label: "Hospital Profile" },
      { pattern: /\b(home|start|main|welcome)\b/,                      page: "home.html",      label: "Home" }
    ];

    function matchRoute(q) {
      q = q.toLowerCase();
      for (var i = 0; i < routes.length; i++) {
        if (routes[i].pattern.test(q)) return routes[i];
      }
      return null;
    }

    // Build modal
    var modal = document.createElement("div");
    modal.id = "rb-voice-modal";
    modal.innerHTML =
      '<div class="rb-voice-header">' +
        '<span class="rb-voice-title">&#127897;&nbsp; Voice Navigation</span>' +
        '<button type="button" class="rb-voice-close" id="rbVoiceClose" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="rb-voice-waves" id="rbVoiceWaves">' +
        '<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>' +
      '</div>' +
      '<div class="rb-voice-status" id="rbVoiceStatus">Click <b>Tap to Speak</b> and ask anything � e.g. <em>"Show ICU beds"</em></div>' +
      '<div class="rb-voice-transcript" id="rbVoiceTranscript"></div>' +
      '<div class="rb-voice-answer" id="rbVoiceAnswer"></div>' +
      '<button type="button" class="rb-voice-speak-btn" id="rbVoiceSpeakBtn">&#127897;&nbsp; Tap to Speak</button>';
    document.body.appendChild(modal);

    function setStatus(html) {
      document.getElementById("rbVoiceStatus").innerHTML = html;
    }
    function setTranscript(txt) {
      var el = document.getElementById("rbVoiceTranscript");
      if (txt) { el.textContent = "\u201c" + txt + "\u201d"; el.style.display = "block"; }
      else      { el.style.display = "none"; el.textContent = ""; }
    }
    function showAnswer(html, type) {
      var el = document.getElementById("rbVoiceAnswer");
      el.innerHTML = html;
      el.className = "rb-voice-answer show" + (type ? " " + type : "");
    }
    function resetSpeakBtn() {
      var btn = document.getElementById("rbVoiceSpeakBtn");
      btn.innerHTML = "&#127897;&nbsp; Tap to Speak";
      btn.disabled = false;
    }

    function doRedirect(route) {
      setStatus("&#10003; Redirecting to <strong>" + route.label + "</strong>&hellip;");
      showAnswer('<span style="font-size:20px">&#128640;</span> Taking you to <strong>' + route.label + '</strong>', "success");
      setTimeout(function() {
        window.location.href = route.page;
      }, 900);
    }

    function handleResult(q) {
      micBtn.classList.remove("mic-listening");
      document.getElementById("rbVoiceWaves").classList.remove("active");
      resetSpeakBtn();

      if (!q || !q.trim()) {
        setStatus("&#9888; No speech detected. Try again.");
        return;
      }

      setTranscript(q);
      var route = matchRoute(q);
      if (route) {
        doRedirect(route);
      } else {
        setStatus("&#10006; Not sure where to go. Try: <em>\"ICU beds\"</em>, <em>\"referrals\"</em>, <em>\"analytics\"</em>");
        showAnswer("Try saying: <em>ICU beds, referral requests, hospital network, analytics, dashboard</em>", "hint");
      }
    }

    function startListening() {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        setStatus("&#10006; Voice not supported. Use Chrome or Edge.");
        return;
      }

      var recog = new SR();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = "en-IN";
      var finalText = "";

      recog.onstart = function() {
        finalText = "";
        micBtn.classList.add("mic-listening");
        var speakBtn = document.getElementById("rbVoiceSpeakBtn");
        speakBtn.innerHTML = "&#128308;&nbsp; Listening&hellip;";
        speakBtn.disabled = true;
        setStatus("&#127897; Listening&hellip; speak your question");
        document.getElementById("rbVoiceWaves").classList.add("active");
        setTranscript("");
        var ansEl = document.getElementById("rbVoiceAnswer");
        ansEl.className = "rb-voice-answer";
        ansEl.innerHTML = "";
      };

      recog.onresult = function(evt) {
        var interim = "";
        finalText = "";
        for (var i = evt.resultIndex; i < evt.results.length; i++) {
          if (evt.results[i].isFinal) finalText += evt.results[i][0].transcript;
          else interim += evt.results[i][0].transcript;
        }
        setTranscript(finalText || interim);
      };

      recog.onerror = function(e) {
        micBtn.classList.remove("mic-listening");
        document.getElementById("rbVoiceWaves").classList.remove("active");
        resetSpeakBtn();
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setStatus("&#128274; Microphone blocked. Please allow microphone access in your browser settings.");
        } else {
          setStatus("&#10006; Error: " + (e.error || "unknown") + ". Please try again.");
        }
      };

      recog.onend = function() {
        handleResult(finalText);
      };

      try { recog.start(); } catch(e) {
        setStatus("Could not start mic. Please try again.");
        resetSpeakBtn();
      }
    }

    // Wire buttons
    document.getElementById("rbVoiceClose").addEventListener("click", function() {
      modal.classList.remove("rb-voice-open");
      micBtn.classList.remove("mic-listening");
    });

    document.getElementById("rbVoiceSpeakBtn").addEventListener("click", startListening);

    // Topbar mic button: toggle modal + auto-start listening
    micBtn.addEventListener("click", function() {
      if (modal.classList.contains("rb-voice-open")) {
        modal.classList.remove("rb-voice-open");
        micBtn.classList.remove("mic-listening");
      } else {
        modal.classList.add("rb-voice-open");
        startListening();
      }
    });
  }
})();