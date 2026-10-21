import fs from 'fs';

const pages = [
  { file: 'dashboard.html', route: 'index.html#/dashboard', title: 'Dashboard' },
  { file: 'network.html', route: 'index.html#/network', title: 'Hospital Network' },
  { file: 'requests.html', route: 'index.html#/requests', title: 'Incoming Requests' }
];

const navOld = /<nav[^>]*>[\s\S]*?<\/nav>/;
const navNew = `    <nav class="nav-links">
      <a href="home.html" class="nav-link" data-tooltip="Home"><span class="nav-icon">&#127968;</span><span>Home</span></a>
      <a href="index.html#/dashboard" class="nav-link" data-tooltip="Dashboard"><span class="nav-icon">&#128202;</span><span>Dashboard</span></a>
      <a href="index.html#/network" class="nav-link" data-tooltip="Hospital Network"><span class="nav-icon">&#127760;</span><span>Hospital Network &amp; Map</span></a>
      <a href="index.html#/patients" class="nav-link" data-tooltip="Patient Records"><span class="nav-icon">&#128203;</span><span>Patient Records</span></a>
      <a href="index.html#/requests" class="nav-link" data-tooltip="Incoming Requests"><span class="nav-icon">&#128229;</span><span>Incoming Requests</span></a>
      <a href="beds.html" class="nav-link" data-tooltip="Bed Management"><span class="nav-icon">&#128719;</span><span>Bed Management</span></a>
      <a href="profile.html" class="nav-link" data-tooltip="Hospital Profile"><span class="nav-icon">&#127973;</span><span>Hospital Profile</span></a>
      <a href="analytics.html" class="nav-link" data-tooltip="Analytics"><span class="nav-icon">&#128200;</span><span>Analytics</span></a>
    </nav>`;

pages.forEach(({ file, route, title }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Update nav
    if (navOld.test(content)) {
      content = content.replace(navOld, navNew);
    }

    // Add prominent React banner right after <main class="main"> if not already added
    const banner = `    <!-- React Hub Switcher Banner -->
    <div style="background:rgba(20,228,184,0.12); border-bottom:1px solid rgba(20,228,184,0.3); padding:8px 24px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--rb-teal, #14e4b8); font-family:var(--font-mono, monospace);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="width:8px; height:8px; border-radius:50%; background:#14e4b8; display:inline-block; box-shadow:0 0 6px #14e4b8;"></span>
        <span>LEGACY VIEW &bull; Live database-backed React ${title} is available</span>
      </div>
      <a href="${route}" style="color:#061826; background:#14e4b8; text-decoration:none; padding:4px 12px; border-radius:12px; font-weight:700;">Open Connected React Version &rarr;</a>
    </div>\n`;

    if (!content.includes('React Hub Switcher Banner')) {
      content = content.replace('<main class="main">', '<main class="main">\n' + banner);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file} with React navigation and banner.`);
  }
});
