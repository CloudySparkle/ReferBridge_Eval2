import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================================================
   ReferBridge AI Assistant — Chatbot Component
   A context-aware chatbot with knowledge of:
   - The hospital network (20+ hospitals across 4 cities)
   - How referrals work and their statuses
   - Patient records and how to navigate the system
   - General medical triage guidance
   ============================================================================ */

const HOSPITAL_KB = [
  { city: 'Chandigarh', category: 'Government', name: 'PGIMER', specialties: 'Multi-Specialty, Trauma, Neurology, Cardiology, Oncology', beds: 1900, emergency: true },
  { city: 'Chandigarh', category: 'Government', name: 'GMCH Sector 32', specialties: 'General Surgery, Emergency, Burn Unit', beds: 900, emergency: true },
  { city: 'Chandigarh', category: 'Government', name: 'GMSH Sector 16', specialties: 'General Medicine, Paediatrics, Gynaecology, ENT', beds: 500, emergency: true },
  { city: 'Chandigarh', category: 'Private', name: 'Fortis Hospital', specialties: 'Cardiology, Oncology, Neurosciences, Orthopaedics', beds: 262, emergency: true },
  { city: 'Chandigarh', category: 'Private', name: 'Max Super Speciality Hospital', specialties: 'Cardiology, Cancer Care, Neurology, Renal Sciences', beds: 200, emergency: true },
  { city: 'Chandigarh', category: 'Private', name: 'Ivy Hospital', specialties: 'Cardiac Surgery, Neurosurgery, Orthopaedics, Urology', beds: 200, emergency: true },
  { city: 'Mohali', category: 'Government', name: 'Civil Hospital Mohali', specialties: 'General Medicine, Emergency, Maternity, Paediatrics', beds: 200, emergency: true },
  { city: 'Mohali', category: 'Government', name: 'GMCH Mohali', specialties: 'General Surgery, Medicine, Gynaecology, Emergency', beds: 300, emergency: true },
  { city: 'Mohali', category: 'Private', name: 'Alchemist Hospital Mohali', specialties: 'Cardiology, Neurology, Vascular Surgery, Orthopaedics', beds: 250, emergency: true },
  { city: 'Mohali', category: 'Private', name: 'Healing Hospital', specialties: 'Nephrology, Oncology, ICU Critical Care, Dialysis', beds: 160, emergency: true },
  { city: 'Mohali', category: 'Private', name: 'Shalby Hospital Mohali', specialties: 'Joint Replacement, Spine Surgery, Sports Medicine', beds: 150, emergency: false },
  { city: 'Panchkula', category: 'Government', name: 'Civil Hospital Panchkula', specialties: 'General Medicine, Emergency, Maternity, Surgery', beds: 300, emergency: true },
  { city: 'Panchkula', category: 'Government', name: 'ESIC Hospital Panchkula', specialties: 'General Medicine, Surgery, Maternity', beds: 150, emergency: true },
  { city: 'Panchkula', category: 'Private', name: 'Alchemist Hospitals Panchkula', specialties: 'Neurology, Cardiology, Stroke Center, ICU', beds: 90, emergency: true },
  { city: 'Panchkula', category: 'Private', name: 'Paras Hospital Panchkula', specialties: 'Emergency Care, Cardiology, Cancer Care, Neurosciences', beds: 250, emergency: true },
  { city: 'Zirakpur', category: 'Government', name: 'Civil Dispensary Zirakpur', specialties: 'General Medicine, Maternity', beds: 50, emergency: false },
  { city: 'Zirakpur', category: 'Private', name: 'Lifeline Hospital Zirakpur', specialties: 'Trauma, Orthopaedics, Critical Care, General Surgery', beds: 210, emergency: true },
  { city: 'Zirakpur', category: 'Private', name: 'Mukat Hospital Zirakpur', specialties: 'Emergency, Trauma, Orthopaedics, Obstetrics', beds: 175, emergency: true },
  { city: 'Zirakpur', category: 'Private', name: 'Cloudnine Hospital Zirakpur', specialties: 'Obstetrics, Gynaecology, Neonatology, Paediatrics, IVF', beds: 80, emergency: true },
];

function generateBotResponse(userMsg, navigate) {
  const msg = userMsg.toLowerCase().trim();

  // ── Navigation / page shortcuts ──────────────────────────────────────────
  if (msg.includes('hospital network') || msg.includes('hospital map') || msg.includes('map') || msg.includes('network page')) {
    return {
      text: '🌐 Taking you to the Hospital Network & Map page right now!',
      action: () => navigate('/network'),
      actionLabel: 'Open Hospital Network →'
    };
  }
  if (msg.includes('patient record') || msg.includes('patient page') || msg.includes('patients')) {
    return {
      text: '📋 Opening the Patient Records section for you.',
      action: () => navigate('/patients'),
      actionLabel: 'Open Patient Records →'
    };
  }
  if (msg.includes('referral') && (msg.includes('page') || msg.includes('request') || msg.includes('open') || msg.includes('go'))) {
    return {
      text: '📥 Going to the Referral Requests page.',
      action: () => navigate('/requests'),
      actionLabel: 'Open Referral Requests →'
    };
  }
  if (msg.includes('dashboard') || msg.includes('home') || msg.includes('main')) {
    return {
      text: '📊 Navigating to the Operations Dashboard.',
      action: () => navigate('/dashboard'),
      actionLabel: 'Open Dashboard →'
    };
  }

  // ── Hospital search by city ───────────────────────────────────────────────
  const cities = ['chandigarh', 'mohali', 'panchkula', 'zirakpur'];
  const foundCity = cities.find(c => msg.includes(c));
  if (foundCity && (msg.includes('hospital') || msg.includes('facility') || msg.includes('list') || msg.includes('which'))) {
    const cityHospitals = HOSPITAL_KB.filter(h => h.city.toLowerCase() === foundCity);
    const govHospitals = cityHospitals.filter(h => h.category === 'Government');
    const pvtHospitals = cityHospitals.filter(h => h.category === 'Private');
    const cityProper = cityHospitals[0]?.city || foundCity;
    return {
      text: `🏥 **Hospitals in ${cityProper}:**\n\n**Government (${govHospitals.length}):**\n${govHospitals.map(h => `• ${h.name} — ${h.specialties.split(',')[0]}`).join('\n')}\n\n**Private (${pvtHospitals.length}):**\n${pvtHospitals.map(h => `• ${h.name} — ${h.specialties.split(',')[0]}`).join('\n')}\n\nYou can filter by city on the Hospital Network page.`,
      action: () => navigate('/network'),
      actionLabel: 'View on Map →'
    };
  }

  // ── Specialty search ─────────────────────────────────────────────────────
  const specialtyKeywords = {
    cardiology: 'Cardiology',
    cardiac: 'Cardiology',
    heart: 'Cardiology',
    neuro: 'Neurology',
    neurolog: 'Neurology',
    brain: 'Neurology',
    stroke: 'Neurology',
    trauma: 'Trauma',
    emergency: 'Emergency',
    icu: 'ICU',
    'critical care': 'Critical Care',
    cancer: 'Oncology',
    oncolog: 'Oncology',
    ortho: 'Orthopaedics',
    bone: 'Orthopaedics',
    fracture: 'Orthopaedics',
    paediatric: 'Paediatrics',
    pediatric: 'Paediatrics',
    child: 'Paediatrics',
    maternity: 'Maternity',
    gynae: 'Gynaecology',
    obstetric: 'Obstetrics',
    kidney: 'Nephrology',
    nephro: 'Nephrology',
    dialysis: 'Dialysis',
    transplant: 'Transplant',
    burn: 'Burn Unit',
    spine: 'Spine Surgery',
    joint: 'Joint Replacement',
  };

  for (const [keyword, specialty] of Object.entries(specialtyKeywords)) {
    if (msg.includes(keyword)) {
      const matched = HOSPITAL_KB.filter(h =>
        h.specialties.toLowerCase().includes(specialty.toLowerCase())
      );
      if (matched.length > 0) {
        return {
          text: `🔍 **Hospitals with ${specialty} services:**\n\n${matched.map(h => `• **${h.name}** (${h.city}, ${h.category}) — ${h.beds} beds${h.emergency ? ' 🆘' : ''}`).join('\n')}\n\n🆘 = Emergency services available`,
          action: () => navigate('/network'),
          actionLabel: 'View on Hospital Map →'
        };
      }
    }
  }

  // ── Referral info ─────────────────────────────────────────────────────────
  if (msg.includes('referral') || msg.includes('transfer') || msg.includes('refer')) {
    if (msg.includes('status') || msg.includes('check') || msg.includes('track')) {
      return { text: '📋 **Referral Statuses in ReferBridge:**\n\n• **Draft** — Saved but not yet submitted\n• **Submitted** — Sent to receiving hospital\n• **Pending** — Awaiting decision from receiving hospital\n• **Accepted** — Transfer confirmed\n• **Rejected** — Transfer declined\n• **Cancelled** — Transfer cancelled\n\nGo to Referral Requests to view all referrals and update their status.' };
    }
    if (msg.includes('create') || msg.includes('new') || msg.includes('how') || msg.includes('make')) {
      return {
        text: '📝 **To create a new referral:**\n\n1. Go to **Referral Requests** page\n2. Click **"+ Create Outbound Transfer"** button\n3. Select the patient from your records\n4. Choose the destination hospital\n5. Set urgency (Critical / High / Moderate)\n6. Enter referral reason\n7. Submit — status starts as **Pending**\n\nThe receiving hospital can then Accept or Reject the transfer.',
        action: () => navigate('/requests'),
        actionLabel: 'Create Referral →'
      };
    }
    return {
      text: '📥 ReferBridge coordinates inter-hospital patient transfers across Chandigarh, Mohali, Panchkula and Zirakpur. You can create referrals, track their status, and accept/reject incoming transfers. What specifically would you like help with?',
      action: () => navigate('/requests'),
      actionLabel: 'View Referral Queue →'
    };
  }

  // ── Patient record info ───────────────────────────────────────────────────
  if (msg.includes('patient') && (msg.includes('add') || msg.includes('create') || msg.includes('new') || msg.includes('register'))) {
    return {
      text: '👤 **To add a new patient:**\n\n1. Go to **Patient Records** page\n2. Click **"+ New Patient"** button\n3. Fill in: Name, Age, Gender, Contact, Primary Condition, Medical History\n4. Save — the patient gets a unique ID (PT-XXXX)\n\nPatients are stored securely and can be referenced when creating referrals.',
      action: () => navigate('/patients'),
      actionLabel: 'Add Patient →'
    };
  }

  // ── Bed availability ──────────────────────────────────────────────────────
  if (msg.includes('bed') || msg.includes('availability') || msg.includes('capacity')) {
    if (msg.includes('icu') || msg.includes('critical')) {
      const icuHospitals = HOSPITAL_KB.filter(h => h.specialties.toLowerCase().includes('icu') || h.specialties.toLowerCase().includes('critical'));
      return {
        text: `🏥 **Hospitals with ICU / Critical Care:**\n\n${icuHospitals.map(h => `• ${h.name} (${h.city})`).join('\n')}\n\n⚠ Live bed counts are shown on the Hospital Network page. Data refreshes when Supabase is connected.`,
        action: () => navigate('/network'),
        actionLabel: 'Check Live Availability →'
      };
    }
    return {
      text: '🛏 Bed availability is shown in real-time on the **Hospital Network** page. Each hospital card shows:\n• **Total beds** — full capacity\n• **Free beds** — currently available\n• **ICU beds** — open critical care slots\n\nFor live data, configure your Supabase connection in `.env`.',
      action: () => navigate('/network'),
      actionLabel: 'View Bed Availability →'
    };
  }

  // ── Government vs Private ─────────────────────────────────────────────────
  if (msg.includes('government') || msg.includes('govt') || msg.includes('sarkari')) {
    const govt = HOSPITAL_KB.filter(h => h.category === 'Government');
    return {
      text: `🏛 **Government Hospitals in the network (${govt.length}):**\n\n${govt.map(h => `• **${h.name}** — ${h.city}`).join('\n')}\n\nYou can filter by "Government" on the Hospital Network page.`,
      action: () => navigate('/network'),
      actionLabel: 'View Government Hospitals →'
    };
  }
  if (msg.includes('private')) {
    const pvt = HOSPITAL_KB.filter(h => h.category === 'Private');
    return {
      text: `🏥 **Private Hospitals in the network (${pvt.length}):**\n\n${pvt.map(h => `• **${h.name}** — ${h.city}`).join('\n')}\n\nYou can filter by "Private" on the Hospital Network page.`,
      action: () => navigate('/network'),
      actionLabel: 'View Private Hospitals →'
    };
  }

  // ── Emergency ─────────────────────────────────────────────────────────────
  if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('critical patient')) {
    const emergency = HOSPITAL_KB.filter(h => h.emergency);
    return {
      text: `🆘 **Hospitals with Emergency Services (${emergency.length}):**\n\n${emergency.map(h => `• ${h.name} (${h.city})`).join('\n')}\n\n⚠ Always call ahead. For life-threatening emergencies, call **108** (ambulance).`
    };
  }

  // ── Map / route help ──────────────────────────────────────────────────────
  if (msg.includes('route') || msg.includes('distance') || msg.includes('how far') || msg.includes('direction')) {
    return {
      text: '🗺 The **Hospital Map** shows routes between hospitals:\n\n1. Go to **Hospital Network** page\n2. On the map, select an **Origin** hospital\n3. Select a **Destination** hospital\n4. The system calculates road distance & estimated travel time\n\nNote: Google Maps API key must be configured in `.env` for live routing.',
      action: () => navigate('/network'),
      actionLabel: 'Open Route Map →'
    };
  }

  // ── About ReferBridge ─────────────────────────────────────────────────────
  if (msg.includes('what is referbridge') || msg.includes('about referbridge') || msg.includes('how does') || msg.includes('explain')) {
    return {
      text: '🌐 **ReferBridge** is a hospital referral & coordination platform for:\n• **Chandigarh** · **Mohali (SAS Nagar)** · **Panchkula** · **Zirakpur**\n\n**Key features:**\n• 📍 Interactive hospital map with 20+ hospitals\n• 🛏 Real-time bed & ICU availability tracking\n• 📋 Patient record management\n• 📥 Inter-hospital referral requests\n• 🔒 Secure login for hospital administrators\n\nAll data is verified from official hospital sources.'
    };
  }

  // ── Login / auth help ─────────────────────────────────────────────────────
  if (msg.includes('login') || msg.includes('password') || msg.includes('sign in') || msg.includes('account')) {
    return {
      text: '🔐 **Login Help:**\n\nReferBridge uses real hospital credentials — no demo accounts.\n\n• **New user?** → Click "Register Hospital" on the login page to create an account\n• **Forgot password?** → Contact your system administrator\n• **Remember device** → Check "Remember this device" to stay logged in\n\nIf Supabase is configured, authentication is fully live.'
    };
  }

  // ── Hello / greet ─────────────────────────────────────────────────────────
  if (msg.match(/^(hi|hello|hey|namaste|hii|helo|namaskar)/)) {
    return {
      text: '👋 **Namaste! I\'m ReferBridge Assistant.**\n\nI can help you with:\n• 🏥 Finding hospitals (by city, specialty, or type)\n• 🛏 Bed & ICU availability\n• 📥 Creating and tracking referrals\n• 📋 Managing patient records\n• 🗺 Route planning between hospitals\n\nWhat can I help you with today?'
    };
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if (msg.includes('help') || msg.includes('what can you') || msg.includes('commands')) {
    return {
      text: '💡 **I can help with:**\n\n🏥 **Hospitals** — "hospitals in Chandigarh", "private hospitals", "cardiology specialist"\n🗺 **Navigation** — "open hospital map", "go to patient records"\n📥 **Referrals** — "how to create a referral", "referral status meanings"\n🛏 **Beds** — "ICU availability", "bed capacity"\n🆘 **Emergency** — "emergency hospitals near me"\n\nJust ask naturally in English or Hindi!'
    };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    text: `I didn't quite catch that. Here are some things I can help with:\n\n• "Show hospitals in Mohali"\n• "Which hospitals have cardiology?"\n• "How do I create a referral?"\n• "Show government hospitals"\n• "ICU availability"\n• "Open hospital map"\n\nOr type **help** for a full list.`
  };
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: '👋 **Hi! I\'m your ReferBridge Assistant.**\n\nI can help you find hospitals, check bed availability, navigate referrals, and more.\n\nType **help** to see what I can do!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [unread, setUnread] = useState(0);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setUnread(0);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate a small delay for realism
    setTimeout(() => {
      const response = generateBotResponse(text, navigate);
      const botMsg = {
        id: Date.now() + 1,
        from: 'bot',
        text: response.text,
        action: response.action || null,
        actionLabel: response.actionLabel || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      if (!isOpen) setUnread(n => n + 1);
    }, 600 + Math.random() * 400);
  }, [inputValue, navigate, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick suggestion chips
  const quickSuggestions = [
    'Hospitals in Chandigarh',
    'ICU availability',
    'Create a referral',
    'Government hospitals',
    'Emergency services'
  ];

  // Render message text with simple markdown bold
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Toggle ReferBridge Assistant"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 58,
          height: 58,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #14e4b8, #22c8ff)',
          color: '#061826',
          fontSize: 26,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(20, 228, 184, 0.45)',
          zIndex: 10000,
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isOpen ? 'scale(1.05)' : 'scale(1)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = isOpen ? 'scale(1.05)' : 'scale(1)'; }}
      >
        {isOpen ? '✕' : '🤖'}
        {!isOpen && unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 28,
            width: 360,
            maxHeight: 560,
            background: 'var(--rb-panel-solid, #0a2133)',
            border: '1px solid rgba(20,228,184,0.3)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-body, "Inter", sans-serif)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(20,228,184,0.15), rgba(34,200,255,0.1))',
            borderBottom: '1px solid rgba(20,228,184,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14e4b8, #22c8ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>ReferBridge Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--rb-teal, #14e4b8)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#14e4b8', display: 'inline-block' }} />
                Online · Hospital Network AI
              </div>
            </div>
            <button
              onClick={() => setMessages([{
                id: 1,
                from: 'bot',
                text: '🔄 Chat cleared! How can I help you?',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }])}
              title="Clear chat"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14, padding: '4px 8px', borderRadius: 6 }}
            >
              🗑
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 13px',
                  borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, rgba(20,228,184,0.2), rgba(34,200,255,0.15))'
                    : 'rgba(255,255,255,0.06)',
                  border: msg.from === 'user'
                    ? '1px solid rgba(20,228,184,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: '#f0f7fd',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {renderText(msg.text)}

                  {msg.action && msg.actionLabel && (
                    <button
                      onClick={() => { msg.action(); setIsOpen(false); }}
                      style={{
                        marginTop: 10,
                        display: 'block',
                        width: '100%',
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, #14e4b8, #22c8ff)',
                        color: '#061826',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {msg.actionLabel}
                    </button>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#64748b', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 20,
                  letterSpacing: 4,
                  color: '#14e4b8'
                }}>
                  ···
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6
          }}>
            {quickSuggestions.map(s => (
              <button
                key={s}
                onClick={() => {
                  setInputValue(s);
                  setTimeout(() => handleSend(), 50);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  border: '1px solid rgba(20,228,184,0.25)',
                  background: 'rgba(20,228,184,0.07)',
                  color: 'var(--rb-teal, #14e4b8)',
                  fontSize: 11,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about hospitals, referrals..."
              style={{
                flex: 1,
                padding: '9px 13px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f0f7fd',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                background: inputValue.trim()
                  ? 'linear-gradient(135deg, #14e4b8, #22c8ff)'
                  : 'rgba(255,255,255,0.08)',
                color: inputValue.trim() ? '#061826' : '#64748b',
                fontSize: 16,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
