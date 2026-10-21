import fs from 'fs';

const files = ['home.html', 'beds.html', 'profile.html', 'analytics.html'];

const navOld = /<nav[^>]*>[\s\S]*?<\/nav>/;
const navNew = `    <nav>
      <a href="home.html" class="nav-link" data-tooltip="Home"><span class="nav-icon">&#127968;</span><span>Home</span></a>
      <a href="index.html#/dashboard" class="nav-link" data-tooltip="Dashboard"><span class="nav-icon">&#128202;</span><span>Dashboard</span></a>
      <a href="index.html#/network" class="nav-link" data-tooltip="Hospital Network"><span class="nav-icon">&#127760;</span><span>Hospital Network &amp; Map</span></a>
      <a href="index.html#/patients" class="nav-link" data-tooltip="Patient Records"><span class="nav-icon">&#128203;</span><span>Patient Records</span></a>
      <a href="index.html#/requests" class="nav-link" data-tooltip="Incoming Requests"><span class="nav-icon">&#128229;</span><span>Incoming Requests</span></a>
      <a href="beds.html" class="nav-link" data-tooltip="Bed Management"><span class="nav-icon">&#128719;</span><span>Bed Management</span></a>
      <a href="profile.html" class="nav-link" data-tooltip="Hospital Profile"><span class="nav-icon">&#127973;</span><span>Hospital Profile</span></a>
      <a href="analytics.html" class="nav-link" data-tooltip="Analytics"><span class="nav-icon">&#128200;</span><span>Analytics</span></a>
    </nav>`;

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (navOld.test(content)) {
      content = content.replace(navOld, navNew);
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated nav in ' + f);
    }
  }
});
