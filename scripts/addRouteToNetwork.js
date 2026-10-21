import fs from 'fs';

let content = fs.readFileSync('network.html', 'utf8');

const routeSection = `
    <!-- Transit & Route Estimator Card -->
    <section class="fade-in-up" style="margin: 0 0 24px; padding: 20px 24px; background: var(--rb-panel-solid, #0a2133); border: 1px solid var(--rb-border); border-radius: 14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:18px;">🗺️</span>
          <h3 style="margin:0; font-size:16px; color:#fff;">Inter-Hospital Transit Route &amp; Distance Estimator</h3>
        </div>
        <span style="font-size:11px; font-family:var(--font-mono); color:var(--rb-teal);">LIVE TRANSIT ADVISORY</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:14px; margin-bottom:14px;">
        <div>
          <label style="display:block; font-size:11px; color:var(--rb-text-muted); margin-bottom:4px;">ORIGIN HOSPITAL</label>
          <select id="routeOriginSelect" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(6,24,38,0.8); color:#fff; font-size:13px;"></select>
        </div>
        <div>
          <label style="display:block; font-size:11px; color:var(--rb-text-muted); margin-bottom:4px;">DESTINATION FACILITY</label>
          <select id="routeDestSelect" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--rb-border); background:rgba(6,24,38,0.8); color:#fff; font-size:13px;"></select>
        </div>
        <div style="display:flex; align-items:flex-end;">
          <button type="button" id="btnCalculateDirectRoute" style="width:100%; height:38px; border-radius:8px; border:none; background:linear-gradient(135deg, var(--rb-teal, #14e4b8), var(--rb-cyan, #22c8ff)); color:#061826; font-weight:700; cursor:pointer;">
            ⚡ Calculate Road Route
          </button>
        </div>
      </div>

      <div id="routeResultBox" style="display:none; padding:14px 18px; border-radius:10px; background:rgba(20,228,184,0.08); border:1px solid rgba(20,228,184,0.3); justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span style="font-size:10px; font-family:var(--font-mono); color:var(--rb-teal);">ESTIMATED DISPATCH CORRIDOR</span>
          <div id="routeCorridorText" style="font-weight:700; font-size:14px; color:#fff; margin-top:2px;">-</div>
        </div>
        <div style="display:flex; gap:20px;">
          <div>
            <span style="font-size:10px; color:var(--rb-text-muted); display:block;">DISTANCE</span>
            <strong id="routeDistanceText" style="font-size:18px; color:var(--rb-cyan);">-</strong>
          </div>
          <div>
            <span style="font-size:10px; color:var(--rb-text-muted); display:block;">EST. TRAVEL TIME</span>
            <strong id="routeDurationText" style="font-size:18px; color:var(--rb-teal);">-</strong>
          </div>
        </div>
      </div>
    </section>
`;

if (!content.includes('Inter-Hospital Transit Route')) {
  content = content.replace('<!-- Hospital Grid -->', routeSection + '\n    <!-- Hospital Grid -->');
  fs.writeFileSync('network.html', content, 'utf8');
  console.log('Added routeSection to network.html');
}
