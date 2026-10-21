import fs from 'fs';

let content = fs.readFileSync('network.js', 'utf8');

const routeLogic = `
// ── Transit Route Estimator ──────────────────────────────────────────
function setupRouteEstimator() {
  const origSelect = document.getElementById("routeOriginSelect");
  const destSelect = document.getElementById("routeDestSelect");
  const btn = document.getElementById("btnCalculateDirectRoute");
  const box = document.getElementById("routeResultBox");
  const corridorText = document.getElementById("routeCorridorText");
  const distText = document.getElementById("routeDistanceText");
  const durText = document.getElementById("routeDurationText");

  if (!origSelect || !destSelect || !btn) return;

  // Populate options
  const optionsHtml = HOSPITALS.map((h, i) => \`<option value="\${h.id}">\${h.name} (\${h.location})</option>\`).join("");
  origSelect.innerHTML = optionsHtml;
  destSelect.innerHTML = optionsHtml;

  if (HOSPITALS.length > 1) {
    destSelect.selectedIndex = 1;
  }

  btn.addEventListener("click", () => {
    const oId = origSelect.value;
    const dId = destSelect.value;

    if (oId === dId) {
      if (window.showToast) window.showToast("Origin and destination must be different hospitals.", "warning", "⚠");
      return;
    }

    const oH = HOSPITALS.find(h => h.id === oId);
    const dH = HOSPITALS.find(h => h.id === dId);
    if (!oH || !dH) return;

    // Estimate road route distance
    const distKm = Math.abs(dH.distanceKm - oH.distanceKm) + 2.5;
    const roundedDist = Math.max(Number(distKm.toFixed(1)), 1.8);
    const estMinutes = Math.max(Math.round((roundedDist / 32) * 60), 6);

    corridorText.textContent = \`\${oH.name} ➔ \${dH.name} (Priority Patient Transfer Corridor)\`;
    distText.textContent = \`\${roundedDist} km\`;
    durText.textContent = \`~\${estMinutes} mins\`;
    box.style.display = "flex";

    if (window.showToast) {
      window.showToast(\`Transit route: \${roundedDist} km · Est \${estMinutes} mins\`, "success", "🚗");
    }
  });
}
`;

if (!content.includes('setupRouteEstimator')) {
  content = content.replace('setupTransferSubmit();', 'setupTransferSubmit();\n  setupRouteEstimator();\n');
  content += '\n' + routeLogic;
  fs.writeFileSync('network.js', content, 'utf8');
  console.log('Appended setupRouteEstimator to network.js');
}
