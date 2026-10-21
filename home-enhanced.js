/* ==========================================================================
   REFERBRIDGE — HOME ENHANCED CONTROLLER (home-enhanced.js)
   Journey Card, ReferBot Chat UI, Animated Counters, Ticker
   ========================================================================== */

/* ─── ReferBot Simulated Responses ────────────────────────────────────────── */
const REFERBOT_RESPONSES = {
  default: [
    "I'm checking the live network now... 🔍 Based on current bed availability, <strong>Sunrise Multispecialty</strong> has <strong>6 available ICU beds</strong> and <strong>Om Research Centre</strong> has 4 general beds open.",
    "ReferBot is scanning partner hospitals... ✅ <strong>3 facilities</strong> can accept emergency transfers right now. Shall I initiate a referral request to the nearest available one?",
    "I've pulled the latest capacity report 📊. Network-wide occupancy is at <strong>68%</strong>. ICU availability: 14 beds across 4 hospitals. Highest-capacity option: Lotus Care Hospital (22 beds).",
    "Emergency broadcast sent 🚨! All 8 partner hospitals have been notified. You'll see live acceptance responses appearing in <strong>Incoming Requests</strong> within 2–3 minutes.",
  ],
  icu: "Checking ICU availability across the network... 🛏<br><br>🟢 <strong>Sunrise Multispecialty</strong> — 6 ICU beds<br>🟢 <strong>Om Research Centre</strong> — 4 ICU beds<br>🟡 <strong>Lotus Care Hospital</strong> — 2 ICU beds (limited)<br>🔴 <strong>Green Valley Hospital</strong> — 0 (Full)<br><br>Shall I initiate a transfer request?",
  emergency: "🚨 <strong>Emergency SOS mode activated!</strong><br><br>Broadcasting to all 8 partner hospitals now... Alert sent at <strong>" + new Date().toLocaleTimeString() + "</strong>.<br><br>Hospitals notified:<br>• Sunrise Multispecialty ✓<br>• Lotus Care Hospital ✓<br>• Riverside Hospital ✓<br>• Om Research Centre ✓<br><br>Live responses will appear in <a href='requests.html' style='color:var(--rb-teal)'>Incoming Requests</a>.",
  network: "📡 Live Network Status:<br><br>🟢 <strong>8 hospitals</strong> connected<br>✅ <strong>52 beds</strong> available network-wide<br>⚡ <strong>12 ICU beds</strong> across 3 facilities<br>🔄 Last sync: <strong>just now</strong><br><br>All hospitals are reporting normal response times.",
  nearest: "📍 Finding nearest available hospital to your location...<br><br>Closest with capacity:<br>1. <strong>Sunrise Multispecialty</strong> — 2.4 km · 6 ICU beds<br>2. <strong>Lotus Care Hospital</strong> — 3.8 km · 22 beds<br>3. <strong>Riverside Hospital</strong> — 5.1 km · 18 beds<br><br>Want me to initiate a transfer to Sunrise?",
  pending: "📋 Current Pending Requests:<br><br>🟡 <strong>REQ-448</strong> — Stroke Unit · 8 min ago<br>🟡 <strong>REQ-451</strong> — Cardiac ICU · 4 min ago<br>🟡 <strong>REQ-453</strong> — Pediatric Trauma · 1 min ago<br><br><a href='requests.html' style='color:var(--rb-teal)'>→ View all in Requests panel</a>",
};

function getRobotResponse(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('icu') || q.includes('bed') || q.includes('beds')) return REFERBOT_RESPONSES.icu;
  if (q.includes('emergency') || q.includes('sos') || q.includes('urgent')) return REFERBOT_RESPONSES.emergency;
  if (q.includes('network') || q.includes('status') || q.includes('capacity')) return REFERBOT_RESPONSES.network;
  if (q.includes('nearest') || q.includes('closest') || q.includes('nearby')) return REFERBOT_RESPONSES.nearest;
  if (q.includes('pending') || q.includes('request') || q.includes('incoming')) return REFERBOT_RESPONSES.pending;
  // Random default
  return REFERBOT_RESPONSES.default[Math.floor(Math.random() * REFERBOT_RESPONSES.default.length)];
}

/* ─── ReferBot Chat Controller ─────────────────────────────────────────────── */
function initReferBot() {
  const launcher = document.getElementById('referbotLauncher');
  const win      = document.getElementById('referbotWindow');
  const closeBtn = document.getElementById('referbotClose');
  const input    = document.getElementById('referbotInput');
  const sendBtn  = document.getElementById('referbotSend');
  const messages = document.getElementById('referbotMessages');
  const typing   = document.getElementById('botTyping');

  if (!launcher || !win) return;

  // Toggle open/close
  launcher.addEventListener('click', () => {
    win.classList.toggle('hidden');
    if (!win.classList.contains('hidden') && input) {
      setTimeout(() => input.focus(), 300);
    }
  });
  if (closeBtn) closeBtn.addEventListener('click', () => win.classList.add('hidden'));

  // Send message function
  function sendMessage(text) {
    if (!text || !text.trim()) return;
    const userMsg = text.trim();

    // Add user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'user-msg';
    userBubble.textContent = userMsg;
    messages.appendChild(userBubble);
    messages.scrollTop = messages.scrollHeight;

    if (input) input.value = '';

    // Show typing indicator
    if (typing) typing.style.display = 'flex';
    messages.scrollTop = messages.scrollHeight;

    // After delay, show bot response
    setTimeout(() => {
      if (typing) typing.style.display = 'none';
      const botBubble = document.createElement('div');
      botBubble.className = 'bot-msg';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      botBubble.innerHTML = `
        <div class="bot-msg-head">
          <span class="bot-msg-avatar">✚</span>
          <span class="bot-msg-name">ReferBot</span>
          <span class="bot-msg-time">${now}</span>
        </div>
        ${getRobotResponse(userMsg)}
      `;
      messages.appendChild(botBubble);
      messages.scrollTop = messages.scrollHeight;
    }, 1400 + Math.random() * 600);
  }

  // Send on button click
  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(input ? input.value : ''));

  // Send on Enter key
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
  }
}

// Chip click handler (called from HTML onclick)
window.rbSendChip = function(btn) {
  const text = btn.textContent.trim().replace(/^[^\s]+\s/, ''); // strip emoji
  const input = document.getElementById('referbotInput');
  if (input) input.value = text;
  // Trigger send
  const sendBtn = document.getElementById('referbotSend');
  if (sendBtn) sendBtn.click();
};

/* ─── Journey Card Step Animations ─────────────────────────────────────────── */
function initJourneyCard() {
  const steps = document.querySelectorAll('.journey-step');
  if (!steps.length) return;

  // Add hover interaction to each step node
  steps.forEach((step) => {
    const node = step.querySelector('.journey-node');
    if (!node) return;
    node.addEventListener('mouseenter', () => {
      node.style.transform = 'scale(1.12)';
    });
    node.addEventListener('mouseleave', () => {
      node.style.transform = '';
    });
  });

  // Loop through step highlights
  let currentStep = 0;
  const stepEls = Array.from(steps);

  function highlightStep(idx) {
    stepEls.forEach((s, i) => {
      const n = s.querySelector('.journey-node');
      if (n) n.style.boxShadow = i === idx ? '0 0 30px rgba(20,228,184,0.55)' : '';
    });
  }

  setInterval(() => {
    currentStep = (currentStep + 1) % stepEls.length;
    highlightStep(currentStep);
  }, 2000);
}

/* ─── Animated Stat Counters ────────────────────────────────────────────────── */
window.animateCounter = function(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const from = 0;
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (target - from) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
};

/* ─── Floating Particles ────────────────────────────────────────────────────── */
function initParticles() {
  const field = document.querySelector('.particle-field');
  if (!field) return;
  // Already populated via HTML, just ensure they're alive
}

/* ─── Init on DOMContentLoaded ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initReferBot();
  initJourneyCard();
  initParticles();

  // Animate extra counter
  if (window.animateCounter) {
    setTimeout(() => {
      window.animateCounter('statSaved', 142, 1200);
    }, 600);
  }

  // Intersection Observer for fade-in animations
  const fadeEls = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => {
      el.style.animationPlayState = 'paused';
      obs.observe(el);
    });
  }
});
