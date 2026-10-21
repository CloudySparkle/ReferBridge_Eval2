/* ==========================================================================
   REFERBRIDGE — ANALYTICS CONTROLLER (analytics.js)
   ========================================================================== */






function getProfile() {
  let profile = JSON.parse(localStorage.getItem("referbridge_profile") || "null");
  if (!profile) {
    profile = { totalBeds: 120, occupiedBeds: 78, totalICU: 20, occupiedICU: 14 };
  }
  return profile;
}

function getRequests() {
  let reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "null");
  if (!reqs) {
    reqs = [
      { id: "REQ-101", status: "Accepted" },
      { id: "REQ-102", status: "Rejected" },
      { id: "REQ-103", status: "Pending" },
      { id: "REQ-104", status: "Pending" },
      { id: "REQ-105", status: "Pending" }
    ];
  }
  return reqs;
}

// Analytics Datasets for Time Ranges
const FLOW_DATA = {
  7: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    incoming: [12, 18, 15, 22, 19, 24, 16],
    accepted: [8, 14, 11, 16, 15, 18, 12],
    weeklyBars: [
      { day: "M", val: 55 },
      { day: "T", val: 80 },
      { day: "W", val: 65 },
      { day: "T", val: 95 },
      { day: "F", val: 85 },
      { day: "S", val: 100 },
      { day: "S", val: 70 }
    ],
    radar: "150,45 225,85 210,165 150,195 80,160 85,90"
  },
  30: {
    days: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
    incoming: [78, 92, 85, 110, 98, 105, 94],
    accepted: [56, 68, 62, 82, 74, 80, 70],
    weeklyBars: [
      { day: "W1", val: 70 },
      { day: "W2", val: 85 },
      { day: "W3", val: 78 },
      { day: "W4", val: 100 },
      { day: "W5", val: 90 },
      { day: "W6", val: 95 },
      { day: "W7", val: 88 }
    ],
    radar: "150,40 230,80 220,165 150,200 75,165 80,85"
  },
  90: {
    days: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    incoming: [280, 310, 340, 290, 360, 390, 320],
    accepted: [205, 230, 255, 210, 275, 295, 240],
    weeklyBars: [
      { day: "O", val: 75 },
      { day: "N", val: 82 },
      { day: "D", val: 90 },
      { day: "J", val: 78 },
      { day: "F", val: 95 },
      { day: "M", val: 100 },
      { day: "A", val: 85 }
    ],
    radar: "150,35 235,75 225,170 150,205 70,170 75,80"
  }
};

let currentRange = 7;

function renderFlowChart(range) {
  const data = FLOW_DATA[range] || FLOW_DATA[7];
  const svg = document.getElementById("flowSvg");
  const chartLine = document.getElementById("chartLine");
  const chartLineAccepted = document.getElementById("chartLineAccepted");
  const areaIncoming = document.getElementById("areaIncoming");
  const areaAccepted = document.getElementById("areaAccepted");
  const pointsGroup = document.getElementById("chartPoints");
  const tooltip = document.getElementById("chartTooltip");
  const xAxisLabels = document.getElementById("xAxisLabels");

  if (!svg || !chartLine || !chartLineAccepted || !pointsGroup) return;

  pointsGroup.innerHTML = "";

  // Render X-axis labels
  if (xAxisLabels) {
    xAxisLabels.innerHTML = data.days.map((d) => `<span>${d}</span>`).join("");
  }

  const maxVal = Math.max(...data.incoming) * 1.15 || 1;
  const startX = 60;
  const endX = 660;
  const width = endX - startX;
  const stepX = width / (data.incoming.length - 1);
  const bottomY = 180;
  const topY = 30;
  const height = bottomY - topY;

  function getY(val) {
    return bottomY - (val / maxVal) * height;
  }

  let linePathInc = "";
  let linePathAcc = "";
  let areaPathInc = "";
  let areaPathAcc = "";

  data.incoming.forEach((val, i) => {
    const x = startX + i * stepX;
    const yInc = getY(val);
    const yAcc = getY(data.accepted[i]);

    if (i === 0) {
      linePathInc += `M ${x} ${yInc}`;
      linePathAcc += `M ${x} ${yAcc}`;
      areaPathInc += `M ${x} ${bottomY} L ${x} ${yInc}`;
      areaPathAcc += `M ${x} ${bottomY} L ${x} ${yAcc}`;
    } else {
      // Smooth cubic bezier curves
      const prevX = startX + (i - 1) * stepX;
      const prevYInc = getY(data.incoming[i - 1]);
      const prevYAcc = getY(data.accepted[i - 1]);
      const cpX1 = prevX + stepX * 0.45;
      const cpX2 = x - stepX * 0.45;

      linePathInc += ` C ${cpX1} ${prevYInc}, ${cpX2} ${yInc}, ${x} ${yInc}`;
      linePathAcc += ` C ${cpX1} ${prevYAcc}, ${cpX2} ${yAcc}, ${x} ${yAcc}`;
      areaPathInc += ` C ${cpX1} ${prevYInc}, ${cpX2} ${yInc}, ${x} ${yInc}`;
      areaPathAcc += ` C ${cpX1} ${prevYAcc}, ${cpX2} ${yAcc}, ${x} ${yAcc}`;
    }

    // Points
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(x));
    circle.setAttribute("cy", String(yInc));
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", "#22c8ff");
    circle.setAttribute("stroke", "#041822");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("class", "chart-point");

    circle.addEventListener("mouseenter", function (e) {
      if (tooltip) {
        document.getElementById("tipDay").textContent = data.days[i];
        document.getElementById("tipIncoming").textContent = val;
        document.getElementById("tipAccepted").textContent = data.accepted[i];
        tooltip.classList.add("show");
        const rect = svg.getBoundingClientRect();
        tooltip.style.left = `${(x / 700) * 100}%`;
        tooltip.style.top = `${yInc - 45}px`;
      }
    });

    circle.addEventListener("mouseleave", function () {
      if (tooltip) tooltip.classList.remove("show");
    });

    pointsGroup.appendChild(circle);
  });

  areaPathInc += ` L ${endX} ${bottomY} Z`;
  areaPathAcc += ` L ${endX} ${bottomY} Z`;

  chartLine.setAttribute("d", linePathInc);
  chartLineAccepted.setAttribute("d", linePathAcc);
  areaIncoming.setAttribute("d", areaPathInc);
  areaAccepted.setAttribute("d", areaPathAcc);
}

function renderDonutGauge(profile) {
  const gauge = document.getElementById("donutGauge");
  const percentEl = document.getElementById("donutPercent");
  const statusEl = document.getElementById("donutStatus");
  if (!gauge || !percentEl) return;

  const total = profile.totalBeds || 1;
  const occupied = profile.occupiedBeds || 0;
  const pct = Math.min(Math.round((occupied / total) * 100), 100);

  percentEl.textContent = `${pct}%`;

  // Circumference = 2 * PI * 74 ≈ 465
  const circumference = 465;
  const offset = circumference - (circumference * pct) / 100;
  gauge.style.strokeDashoffset = String(offset);

  if (pct >= 90) {
    gauge.style.stroke = "var(--rb-red)";
    if (statusEl) statusEl.innerHTML = `<span class="live-radar-dot" style="background:var(--rb-red);"></span><span style="color:var(--rb-red);">Critical Capacity Warning (>=90%)</span>`;
  } else if (pct >= 75) {
    gauge.style.stroke = "var(--rb-yellow)";
    if (statusEl) statusEl.innerHTML = `<span class="live-radar-dot" style="background:var(--rb-yellow);"></span><span style="color:var(--rb-yellow);">High Capacity Load (75-90%)</span>`;
  } else {
    gauge.style.stroke = "var(--rb-teal)";
    if (statusEl) statusEl.innerHTML = `<span class="live-radar-dot"></span><span>Optimal Available Capacity</span>`;
  }
}

function renderWeeklyBars(range) {
  const container = document.getElementById("barChart");
  if (!container) return;

  const data = FLOW_DATA[range] || FLOW_DATA[7];
  container.innerHTML = "";

  data.weeklyBars.forEach((b) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML = `
      <div class="bar-track">
        <div class="bar-fill" style="height: 0%;" data-val="${b.val}%"></div>
      </div>
      <span class="bar-label">${b.day}</span>
    `;
    container.appendChild(col);
  });

  // Animate bars rising
  setTimeout(() => {
    container.querySelectorAll(".bar-fill").forEach((f) => {
      f.style.height = f.getAttribute("data-val");
    });
  }, 100);
}

function renderDecisionMix(requests) {
  let pending = 0, accepted = 0, rejected = 0;
  requests.forEach((r) => {
    if (r.status === "Pending") pending++;
    else if (r.status === "Accepted") accepted++;
    else if (r.status === "Rejected") rejected++;
  });

  const total = requests.length || 1;
  const accPct = Math.round((accepted / total) * 100);
  const rejPct = Math.round((rejected / total) * 100);
  const pendPct = Math.round((pending / total) * 100);

  const accFill = document.getElementById("mixAccepted");
  const rejFill = document.getElementById("mixRejected");
  const pendFill = document.getElementById("mixPending");

  if (accFill) {
    accFill.style.width = `${accPct}%`;
    document.getElementById("mixAcceptedLabel").textContent = `${accPct}% (${accepted})`;
  }
  if (rejFill) {
    rejFill.style.width = `${rejPct}%`;
    document.getElementById("mixRejectedLabel").textContent = `${rejPct}% (${rejected})`;
  }
  if (pendFill) {
    pendFill.style.width = `${pendPct}%`;
    document.getElementById("mixPendingLabel").textContent = `${pendPct}% (${pending})`;
  }
}

function renderRadar(range) {
  const radarShape = document.getElementById("radarShape");
  if (!radarShape) return;
  const data = FLOW_DATA[range] || FLOW_DATA[7];
  radarShape.setAttribute("points", data.radar);
}

function renderAll() {
  const profile = getProfile();
  
  // Get data for the selected range
  const data = FLOW_DATA[currentRange] || FLOW_DATA[7];
  
  let total = data.incoming.reduce((a, b) => a + b, 0);
  let accepted = data.accepted.reduce((a, b) => a + b, 0);
  
  // Calculate mock pending and rejected based on the range total
  let pending = Math.floor(total * 0.08); // 8% pending
  let rejected = total - accepted - pending;

  // Top Odometer Stats
  if (window.animateCounter) {
    window.animateCounter("anTotal", total, 700);
    window.animateCounter("anAccepted", accepted, 700);
    window.animateCounter("anRejected", rejected, 700);
    window.animateCounter("anPending", pending, 700);
  } else {
    document.getElementById("anTotal").textContent = total;
    document.getElementById("anAccepted").textContent = accepted;
    document.getElementById("anRejected").textContent = rejected;
    document.getElementById("anPending").textContent = pending;
  }

  // Generate a mock requests array for renderDecisionMix so the progress bars update properly
  const mockRequests = [];
  for(let i=0; i<pending; i++) mockRequests.push({status: "Pending"});
  for(let i=0; i<accepted; i++) mockRequests.push({status: "Accepted"});
  for(let i=0; i<rejected; i++) mockRequests.push({status: "Rejected"});

  renderFlowChart(currentRange);
  renderDonutGauge(profile);
  renderWeeklyBars(currentRange);
  renderDecisionMix(mockRequests);
  renderRadar(currentRange);
}

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  const auth = requireLogin();
  if (!auth) return;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Range Buttons
  document.querySelectorAll(".range-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".range-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentRange = Number(this.dataset.range) || 7;
      renderAll();
      if (window.showToast) {
        window.showToast(`Analytics filtered: Past ${currentRange} Days`, "info", "📊");
      }
    });
  });

  // Export Button
  const exportBtn = document.getElementById("btnExportAnalytics");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      if (window.showToast) {
        window.showToast("Compiling Analytics & Referral Summary Report...", "info", "📄");
        setTimeout(() => {
          window.showToast("ReferBridge_Analytics_Report.pdf downloaded!", "success", "✓");
        }, 1200);
      }
    });
  }

  renderAll();
});
