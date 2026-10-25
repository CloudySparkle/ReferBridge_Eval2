/* ==========================================================================
   REFERBRIDGE — 4 CITIES LEAFLET GOOGLE-STYLE MAP & DISTANCE SUGGESTER (map.js)
   Powered by CartoDB Voyager & Esri Maps (Unrestricted, 100% Free, Zero 403 Errors)
   ========================================================================== */

const TRICITY_HOSPITALS = [
  // ── CHANDIGARH — GOVERNMENT ──────────────────────────────────────────────
  {
    id: "H1",
    name: "PGIMER (Post Graduate Institute of Medical Education & Research)",
    category: "Government",
    type: "Govt",
    city: "Chandigarh",
    location: "Sector 12, Chandigarh",
    address: "Sector 12, Chandigarh - 160012",
    latitude: 30.7673,
    longitude: 76.7770,
    phone: "0172-2746018",
    specialties: ["Cardiology", "Trauma Center", "Neurology", "ICU", "Research", "Organ Transplant"],
    totalBeds: 1900,
    availableBeds: 14,
    icuAvailable: 2,
    status: "Limited"
  },
  {
    id: "H2",
    name: "GMCH Sector 32 (Government Medical College & Hospital)",
    category: "Government",
    type: "Govt",
    city: "Chandigarh",
    location: "Sector 32, Chandigarh",
    address: "Sector 32-B, Chandigarh - 160047",
    latitude: 30.7095,
    longitude: 76.7725,
    phone: "0172-2601023",
    specialties: ["Cardiology", "General Surgery", "Emergency Medicine", "Burn Unit", "Trauma", "ICU"],
    totalBeds: 900,
    availableBeds: 45,
    icuAvailable: 4,
    status: "Available"
  },
  {
    id: "H3",
    name: "GMSH Sector 16 (Government Multi-Specialty Hospital)",
    category: "Government",
    type: "Govt",
    city: "Chandigarh",
    location: "Sector 16, Chandigarh",
    address: "Sector 16, Chandigarh - 160015",
    latitude: 30.7406,
    longitude: 76.7854,
    phone: "0172-2700491",
    specialties: ["Emergency Care", "Cardiology", "General Medicine", "Paediatrics", "ICU"],
    totalBeds: 500,
    availableBeds: 32,
    icuAvailable: 5,
    status: "Available"
  },
  {
    id: "H4",
    name: "Nehru Hospital (PGIMER Apex Cardio-Thoracic Centre)",
    category: "Government",
    type: "Govt",
    city: "Chandigarh",
    location: "Sector 12, Chandigarh",
    address: "Sector 12, Chandigarh - 160012",
    latitude: 30.7660,
    longitude: 76.7780,
    phone: "0172-2746018",
    specialties: ["Cardiology", "Cardiothoracic Surgery", "Advanced ICU", "Neurosurgery"],
    totalBeds: 800,
    availableBeds: 18,
    icuAvailable: 6,
    status: "Limited"
  },

  // ── MOHALI (SAS NAGAR) — GOVERNMENT ─────────────────────────────────────
  {
    id: "H5",
    name: "Civil Hospital Mohali (Dr. BR Ambedkar State Institute)",
    category: "Government",
    type: "Govt",
    city: "Mohali",
    location: "Phase 6, Mohali",
    address: "Phase 6, SAS Nagar, Mohali - 160055",
    latitude: 30.7135,
    longitude: 76.7160,
    phone: "0172-2228010",
    specialties: ["Emergency Medicine", "General Medicine", "Cardiology", "Maternity", "ICU"],
    totalBeds: 300,
    availableBeds: 28,
    icuAvailable: 3,
    status: "Available"
  },
  {
    id: "H6",
    name: "GMCH Mohali (Government Medical College & Hospital)",
    category: "Government",
    type: "Govt",
    city: "Mohali",
    location: "Phase 6, Mohali",
    address: "Phase 6, SAS Nagar, Mohali - 160055",
    latitude: 30.7150,
    longitude: 76.7170,
    phone: "0172-5095001",
    specialties: ["Trauma", "General Surgery", "Cardiology", "Critical Care", "ICU"],
    totalBeds: 350,
    availableBeds: 36,
    icuAvailable: 4,
    status: "Available"
  },
  {
    id: "H7",
    name: "ESI Hospital & Diagnostic Centre Mohali",
    category: "Government",
    type: "Govt",
    city: "Mohali",
    location: "Phase 7, Mohali",
    address: "Industrial Area Phase 7, Mohali - 160055",
    latitude: 30.7040,
    longitude: 76.7120,
    phone: "0172-2224500",
    specialties: ["General Medicine", "Cardiology Screening", "Trauma First Aid", "ICU"],
    totalBeds: 120,
    availableBeds: 19,
    icuAvailable: 2,
    status: "Available"
  },

  // ── PANCHKULA — GOVERNMENT ───────────────────────────────────────────────
  {
    id: "H8",
    name: "Civil Hospital Panchkula (District Hospital Sector 6)",
    category: "Government",
    type: "Govt",
    city: "Panchkula",
    location: "Sector 6, Panchkula",
    address: "Sector 6, Panchkula, Haryana - 134109",
    latitude: 30.6956,
    longitude: 76.8546,
    phone: "0172-2560073",
    specialties: ["Emergency", "Trauma Center", "Cardiology", "Surgery", "ICU"],
    totalBeds: 300,
    availableBeds: 24,
    icuAvailable: 3,
    status: "Available"
  },
  {
    id: "H9",
    name: "ESIC Model Hospital Panchkula",
    category: "Government",
    type: "Govt",
    city: "Panchkula",
    location: "Industrial Area Phase 1, Panchkula",
    address: "Plot 1, Industrial Area Phase-1, Panchkula - 134113",
    latitude: 30.6720,
    longitude: 76.8620,
    phone: "0172-2590001",
    specialties: ["General Medicine", "Occupational Health", "Cardiology", "ICU"],
    totalBeds: 150,
    availableBeds: 22,
    icuAvailable: 3,
    status: "Available"
  },

  // ── ZIRAKPUR — GOVERNMENT ─────────────────────────────────────────────────
  {
    id: "H10",
    name: "Civil Hospital / Community Health Centre Zirakpur",
    category: "Government",
    type: "Govt",
    city: "Zirakpur",
    location: "NH-22 Highway, Zirakpur",
    address: "Zirakpur Bypass, SAS Nagar - 140603",
    latitude: 30.6480,
    longitude: 76.8250,
    phone: "0172-2240090",
    specialties: ["Emergency First Aid", "General Medicine", "Cardiology Stabilization", "Trauma"],
    totalBeds: 100,
    availableBeds: 18,
    icuAvailable: 2,
    status: "Available"
  },

  // ── 4 CITIES PRIVATE / PARTNER CENTERS (CARDIOLOGY & SPECIALTY) ───────────
  {
    id: "H11",
    name: "Lotus Care Hospital",
    category: "Private",
    type: "Private",
    city: "Chandigarh",
    location: "Sector 22, Chandigarh",
    address: "Sector 22-C, Chandigarh - 160022",
    latitude: 30.7320,
    longitude: 76.7650,
    phone: "+91 98141 12345",
    specialties: ["Cardiology", "Orthopedics", "Emergency Care", "Critical Care ICU"],
    totalBeds: 180,
    availableBeds: 24,
    icuAvailable: 6,
    status: "Available"
  },
  {
    id: "H12",
    name: "Fortis Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Sector 62, Mohali",
    address: "Sector 62, Phase VIII, Mohali - 160062",
    latitude: 30.7012,
    longitude: 76.7342,
    phone: "0172-4692222",
    specialties: ["Cardiology", "Oncology", "Neurosciences", "Orthopaedics", "Emergency Care", "ICU"],
    totalBeds: 262,
    availableBeds: 24,
    icuAvailable: 6,
    status: "Available"
  },
  {
    id: "H13",
    name: "Max Super Speciality Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Phase 6, Mohali",
    address: "Near Civil Hospital, Phase 6, Mohali - 160055",
    latitude: 30.7145,
    longitude: 76.7180,
    phone: "0172-6652000",
    specialties: ["Cardiology", "Cancer Care", "Neurology", "Renal Sciences", "Advanced ICU"],
    totalBeds: 200,
    availableBeds: 19,
    icuAvailable: 4,
    status: "Available"
  },
  {
    id: "H14",
    name: "Alchemist Hospital Panchkula",
    category: "Private",
    type: "Private",
    city: "Panchkula",
    location: "Sector 21, Panchkula",
    address: "Sector 21, Panchkula, Haryana - 134112",
    latitude: 30.6865,
    longitude: 76.8530,
    phone: "+91 172-5095001",
    specialties: ["Cardiology", "Neurology", "Vascular Surgery", "Orthopaedics", "ICU"],
    totalBeds: 250,
    availableBeds: 12,
    icuAvailable: 3,
    status: "Limited"
  },
  {
    id: "H15",
    name: "Sunrise Multispecialty Hospital",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Phase 7, Mohali",
    address: "Phase 7, SAS Nagar, Mohali - 160062",
    latitude: 30.7180,
    longitude: 76.7280,
    phone: "+91 98722 54321",
    specialties: ["Pediatrics", "Trauma", "General Surgery", "Cardiology"],
    totalBeds: 140,
    availableBeds: 8,
    icuAvailable: 2,
    status: "Limited"
  },
  {
    id: "H16",
    name: "Green Valley Hospital",
    category: "Private",
    type: "Private",
    city: "Panchkula",
    location: "Sector 11, Panchkula",
    address: "Sector 11, Panchkula - 134109",
    latitude: 30.6860,
    longitude: 76.8450,
    phone: "+91 98888 11223",
    specialties: ["Neurology", "Cardiology", "Stroke Center"],
    totalBeds: 90,
    availableBeds: 0,
    icuAvailable: 0,
    status: "Full"
  },
  {
    id: "H17",
    name: "Riverside Hospital & Trauma Centre",
    category: "Private",
    type: "Private",
    city: "Zirakpur",
    location: "Zirakpur Bypass, NH-22",
    address: "VIP Road, Zirakpur - 140603",
    latitude: 30.6425,
    longitude: 76.8180,
    phone: "+91 99150 99887",
    specialties: ["Trauma", "Orthopedics", "Critical Care", "Cardiology"],
    totalBeds: 210,
    availableBeds: 38,
    icuAvailable: 9,
    status: "Available"
  },
  {
    id: "H18",
    name: "Om Research Centre",
    category: "Private",
    type: "Private",
    city: "Chandigarh",
    location: "Sector 34, Chandigarh",
    address: "SCO 18-19, Sector 34-A, Chandigarh",
    latitude: 30.7225,
    longitude: 76.7680,
    phone: "+91 98155 33445",
    specialties: ["Nephrology", "Oncology", "Cardiology", "ICU"],
    totalBeds: 160,
    availableBeds: 19,
    icuAvailable: 4,
    status: "Available"
  },
  {
    id: "H19",
    name: "Ivy Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Sector 71, Mohali",
    address: "Sector 71, Mohali - 160071",
    latitude: 30.6936,
    longitude: 76.7217,
    phone: "0172-5200000",
    specialties: ["Cardiac Surgery", "Neurosurgery", "Orthopaedics", "ICU"],
    totalBeds: 200,
    availableBeds: 15,
    icuAvailable: 5,
    status: "Available"
  },
  {
    id: "H20",
    name: "Apex Medical Institute",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Sector 62, Mohali",
    address: "Sector 62, Mohali - 160062",
    latitude: 30.7020,
    longitude: 76.7310,
    phone: "+91 98760 00112",
    specialties: ["Cardiology", "Neurology", "Vascular Surgery"],
    totalBeds: 250,
    availableBeds: 12,
    icuAvailable: 3,
    status: "Limited"
  },

  // ── WORST-CASE NATIONAL APEX FALLBACK (ONLY IF ACTIVATED) ─────────────────
  {
    id: "H21",
    name: "AIIMS New Delhi (National Apex Fallback)",
    category: "Government",
    type: "Govt",
    city: "Delhi NCR",
    location: "Ansari Nagar, New Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
    latitude: 28.5672,
    longitude: 77.2100,
    phone: "011-26588500",
    specialties: ["Cardiology", "CTVS", "Trauma Center", "Critical Care ICU"],
    totalBeds: 2500,
    availableBeds: 42,
    icuAvailable: 12,
    status: "Available",
    isWorstCaseApex: true
  },
  {
    id: "H22",
    name: "Fortis Escorts Heart Institute (National Apex Fallback)",
    category: "Private",
    type: "Private",
    city: "Delhi NCR",
    location: "Okhla Road, New Delhi",
    address: "Okhla Road, New Delhi - 110025",
    latitude: 28.5603,
    longitude: 77.2844,
    phone: "011-47135000",
    specialties: ["Cardiology", "Cardiac Surgery", "Pediatric Cardiac ICU"],
    totalBeds: 310,
    availableBeds: 29,
    icuAvailable: 14,
    status: "Available",
    isWorstCaseApex: true
  }
];

// Focus Strictly on 4 Cities
const THE_4_CITIES = ["Chandigarh", "Mohali", "Panchkula", "Zirakpur"];

const CITY_CENTERS = {
  "All": { lat: 30.7220, lng: 76.7750, zoom: 12 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 13 },
  "Mohali": { lat: 30.7046, lng: 76.7179, zoom: 13 },
  "Panchkula": { lat: 30.6942, lng: 76.8606, zoom: 13 },
  "Zirakpur": { lat: 30.6425, lng: 76.8173, zoom: 13 },
  "WorstCase": { lat: 28.5672, lng: 77.2100, zoom: 10 }
};

let mapInstance = null;
let markersGroup = null;
let routeLineGroup = null;
let patientMarker = null;

let currentCity = "All";
let currentType = "All";
let currentSpecialty = "All";
let currentSearch = "";
let showWorstCase = false;

let currentTravelMode = "ambulance"; // "ambulance" | "personal"
let currentOriginAddress = "Sector 17 City Center, Chandigarh";
let currentViewMode = "google"; // "google" | "leaflet"

function formatClockTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function generateStepDirections(originStr, targetHosp) {
  const isAmb = currentTravelMode === "ambulance";
  return [
    { step: 1, text: `Depart from ${originStr}. Head toward main connecting road.`, dist: "350 m" },
    { step: 2, text: `Merge onto primary road corridor toward ${targetHosp.city}. ${isAmb ? "Emergency light & siren corridor active." : "Follow emergency casualty hospital signage."}`, dist: "850 m" },
    { step: 3, text: `Continue straight past major sector junction; stay in ${isAmb ? "priority fast lane" : "left approach lane"}.`, dist: "1.1 km" },
    { step: 4, text: `Turn into ${targetHosp.name} campus entrance road.`, dist: "400 m" },
    { step: 5, text: `Arrive at Emergency & Trauma Casualty Bay. ${isAmb ? "Stretcher & triage team receiving." : "Present Express Gate Pass — proceed directly to triage bay without OPD registration."}`, dist: "Arrived" }
  ];
}

// Default Patient Location (Sector 17, Chandigarh)
let patientLocation = {
  name: "Sector 17 City Center, Chandigarh",
  lat: 30.7410,
  lng: 76.7820,
  isLiveGPS: false
};

let selectedDestinationHospital = TRICITY_HOSPITALS[0];

// ─────────────────────────────────────────────────────────────
// Comprehensive Tricity Locations & Intelligent Resolution Engine
// Covers Chandigarh (all sectors), Mohali (phases & sectors),
// Panchkula (sectors & MDC), Zirakpur (localities & highways)
// ─────────────────────────────────────────────────────────────
const TRICITY_LOCATIONS = [
  // --- Chandigarh Sectors & Key Landmarks ---
  { name: "Sector 1 (Capitol Complex), Chandigarh", lat: 30.7589, lng: 76.8056, aliases: ["sec 1", "sector 1", "capitol complex", "high court"] },
  { name: "Sector 2, Chandigarh", lat: 30.7560, lng: 76.7970, aliases: ["sec 2", "sector 2"] },
  { name: "Sector 3, Chandigarh", lat: 30.7530, lng: 76.7890, aliases: ["sec 3", "sector 3"] },
  { name: "Sector 4, Chandigarh", lat: 30.7500, lng: 76.7820, aliases: ["sec 4", "sector 4"] },
  { name: "Sector 5, Chandigarh", lat: 30.7480, lng: 76.7930, aliases: ["sec 5", "sector 5"] },
  { name: "Sector 7, Chandigarh", lat: 30.7370, lng: 76.8040, aliases: ["sec 7", "sector 7"] },
  { name: "Sector 8, Chandigarh", lat: 30.7390, lng: 76.7960, aliases: ["sec 8", "sector 8"] },
  { name: "Sector 9, Chandigarh", lat: 30.7440, lng: 76.7890, aliases: ["sec 9", "sector 9"] },
  { name: "Sector 10, Chandigarh", lat: 30.7480, lng: 76.7800, aliases: ["sec 10", "sector 10", "art gallery"] },
  { name: "Sector 11, Chandigarh", lat: 30.7530, lng: 76.7720, aliases: ["sec 11", "sector 11"] },
  { name: "Sector 12 (PGIMER Complex), Chandigarh", lat: 30.7645, lng: 76.7766, aliases: ["sec 12", "sector 12", "pgi complex", "pgimer"] },
  { name: "Sector 14 (Panjab University), Chandigarh", lat: 30.7600, lng: 76.7680, aliases: ["sec 14 chd", "sector 14 chandigarh", "panjab university", "pu"] },
  { name: "Sector 15, Chandigarh", lat: 30.7540, lng: 76.7630, aliases: ["sec 15", "sector 15"] },
  { name: "Sector 16 (General Hospital), Chandigarh", lat: 30.7445, lng: 76.7770, aliases: ["sec 16", "sector 16", "gmsh 16", "gmsh"] },
  { name: "Sector 17 City Center, Chandigarh", lat: 30.7398, lng: 76.7827, aliases: ["sec 17", "sector 17", "city center", "sector 17 isbt", "isbt 17", "sector 17 chandigarh", "sector 17, chandigarh"] },
  { name: "Sector 18, Chandigarh", lat: 30.7360, lng: 76.7910, aliases: ["sec 18", "sector 18"] },
  { name: "Sector 19, Chandigarh", lat: 30.7300, lng: 76.7980, aliases: ["sec 19", "sector 19"] },
  { name: "Sector 20, Chandigarh", lat: 30.7240, lng: 76.7900, aliases: ["sec 20 chd", "sector 20 chandigarh"] },
  { name: "Sector 21, Chandigarh", lat: 30.7280, lng: 76.7830, aliases: ["sec 21", "sector 21"] },
  { name: "Sector 22-B, Chandigarh", lat: 30.7335, lng: 76.7720, aliases: ["sec 22", "sector 22", "sector 22-b", "sector 22b", "sector 22, chandigarh", "aroma"] },
  { name: "Sector 23, Chandigarh", lat: 30.7390, lng: 76.7660, aliases: ["sec 23", "sector 23"] },
  { name: "Sector 24, Chandigarh", lat: 30.7440, lng: 76.7580, aliases: ["sec 24", "sector 24"] },
  { name: "Sector 25, Chandigarh", lat: 30.7480, lng: 76.7500, aliases: ["sec 25", "sector 25"] },
  { name: "Sector 26, Chandigarh", lat: 30.7260, lng: 76.8120, aliases: ["sec 26", "sector 26", "grain market"] },
  { name: "Sector 27, Chandigarh", lat: 30.7210, lng: 76.8050, aliases: ["sec 27", "sector 27"] },
  { name: "Sector 28, Chandigarh", lat: 30.7160, lng: 76.8000, aliases: ["sec 28", "sector 28"] },
  { name: "Sector 32 (GMCH Area), Chandigarh", lat: 30.7088, lng: 76.7734, aliases: ["sec 32", "sector 32", "gmch 32", "gmch"] },
  { name: "Sector 34 (Sub-City Center), Chandigarh", lat: 30.7220, lng: 76.7680, aliases: ["sec 34", "sector 34"] },
  { name: "Sector 35, Chandigarh", lat: 30.7240, lng: 76.7620, aliases: ["sec 35", "sector 35"] },
  { name: "Sector 36, Chandigarh", lat: 30.7280, lng: 76.7540, aliases: ["sec 36", "sector 36"] },
  { name: "Sector 37, Chandigarh", lat: 30.7340, lng: 76.7460, aliases: ["sec 37", "sector 37"] },
  { name: "Sector 38, Chandigarh", lat: 30.7400, lng: 76.7400, aliases: ["sec 38", "sector 38"] },
  { name: "Sector 43 (ISBT), Chandigarh", lat: 30.7180, lng: 76.7450, aliases: ["sec 43", "sector 43", "isbt 43", "bus stand 43"] },
  { name: "Sector 44, Chandigarh", lat: 30.7130, lng: 76.7550, aliases: ["sec 44", "sector 44"] },
  { name: "Sector 45, Chandigarh", lat: 30.7070, lng: 76.7630, aliases: ["sec 45", "sector 45"] },
  { name: "Sector 46, Chandigarh", lat: 30.7010, lng: 76.7710, aliases: ["sec 46", "sector 46"] },
  { name: "Sector 47, Chandigarh", lat: 30.6960, lng: 76.7800, aliases: ["sec 47", "sector 47"] },
  { name: "IT Park (Kishangarh), Chandigarh", lat: 30.7240, lng: 76.8420, aliases: ["it park", "rajiv gandhi it park", "manimajra", "kishangarh"] },
  { name: "Sukhna Lake, Chandigarh", lat: 30.7420, lng: 76.8180, aliases: ["sukhna lake", "lake"] },
  { name: "Chandigarh Railway Station", lat: 30.7050, lng: 76.8280, aliases: ["railway station", "chd railway station", "station"] },

  // --- Mohali (SAS Nagar) Phases & Sectors ---
  { name: "Phase 1, Mohali", lat: 30.7320, lng: 76.7280, aliases: ["phase 1", "phase 1 mohali", "sec 55"] },
  { name: "Phase 2, Mohali", lat: 30.7260, lng: 76.7240, aliases: ["phase 2", "phase 2 mohali", "sec 54"] },
  { name: "Phase 3A, Mohali", lat: 30.7210, lng: 76.7190, aliases: ["phase 3a", "phase 3a mohali"] },
  { name: "Phase 3B2, Mohali", lat: 30.7170, lng: 76.7160, aliases: ["phase 3b2", "phase 3b-2", "3b2", "sector 60"] },
  { name: "Phase 4, Mohali", lat: 30.7210, lng: 76.7270, aliases: ["phase 4", "phase 4 mohali", "sec 59"] },
  { name: "Phase 5, Mohali", lat: 30.7140, lng: 76.7230, aliases: ["phase 5", "phase 5 mohali"] },
  { name: "Phase 6 (Civil Hospital Area), Mohali", lat: 30.7225, lng: 76.7170, aliases: ["phase 6", "phase 6 mohali", "civil hospital mohali", "sec 56"] },
  { name: "Phase 7, Sector 61, Mohali", lat: 30.7055, lng: 76.7115, aliases: ["phase 7", "phase 7 mohali", "sec 61", "sector 61", "phase 7, sector 61, mohali", "phase 7, mohali"] },
  { name: "Phase 8 / Industrial Area, Mohali", lat: 30.7090, lng: 76.7230, aliases: ["phase 8", "phase 8 mohali", "industrial area mohali"] },
  { name: "Phase 9, Mohali", lat: 30.6980, lng: 76.7320, aliases: ["phase 9", "phase 9 mohali", "sec 63"] },
  { name: "Phase 10, Mohali", lat: 30.6930, lng: 76.7380, aliases: ["phase 10", "phase 10 mohali", "sec 64"] },
  { name: "Phase 11, Mohali", lat: 30.6860, lng: 76.7440, aliases: ["phase 11", "phase 11 mohali", "sec 65"] },
  { name: "Sector 62 (City Center), Mohali", lat: 30.7120, lng: 76.7290, aliases: ["sector 62", "sec 62", "mohali city center"] },
  { name: "Sector 68, Mohali", lat: 30.6980, lng: 76.7160, aliases: ["sector 68", "sec 68"] },
  { name: "Sector 69, Mohali", lat: 30.7020, lng: 76.7220, aliases: ["sector 69", "sec 69"] },
  { name: "Sector 70, Mohali", lat: 30.6974, lng: 76.7236, aliases: ["sector 70", "sec 70", "mattaur"] },
  { name: "Sector 71, Mohali", lat: 30.7050, lng: 76.7020, aliases: ["sector 71", "sec 71"] },
  { name: "Sector 76-80, Mohali", lat: 30.6780, lng: 76.7120, aliases: ["sector 76", "sector 77", "sector 78", "sector 79", "sector 80", "sec 76", "sec 77", "sec 78", "sec 79", "sec 80"] },
  { name: "Sector 82 (JLPL / Industrial), Mohali", lat: 30.6650, lng: 76.7380, aliases: ["sector 82", "sec 82", "jlpl"] },
  { name: "Airport Road (PR7), Mohali", lat: 30.6620, lng: 76.7550, aliases: ["airport road", "pr7", "aerocity", "it city mohali"] },
  { name: "Shaheed Bhagat Singh Intl Airport, Mohali", lat: 30.6730, lng: 76.7885, aliases: ["airport", "chandigarh airport", "ixc"] },
  { name: "Kharar / Landran Chowk", lat: 30.7450, lng: 76.6480, aliases: ["kharar", "landran", "landran chowk"] },

  // --- Panchkula Sectors & Localities ---
  { name: "Sector 5, Panchkula", lat: 30.6942, lng: 76.8606, aliases: ["sec 5 pkl", "sector 5 panchkula", "town park"] },
  { name: "Sector 6 (Civil Hospital), Panchkula", lat: 30.6970, lng: 76.8530, aliases: ["sec 6 pkl", "sector 6 panchkula", "civil hospital panchkula"] },
  { name: "MDC Sector 4, Panchkula", lat: 30.7180, lng: 76.8450, aliases: ["mdc", "mdc sector 4", "mansa devi", "mansa devi complex"] },
  { name: "Sector 2, Panchkula", lat: 30.6910, lng: 76.8490, aliases: ["sec 2 pkl", "sector 2 panchkula"] },
  { name: "Sector 4, Panchkula", lat: 30.6950, lng: 76.8670, aliases: ["sec 4 pkl", "sector 4 panchkula"] },
  { name: "Sector 7, Panchkula", lat: 30.6860, lng: 76.8580, aliases: ["sec 7 pkl", "sector 7 panchkula"] },
  { name: "Sector 8, Panchkula", lat: 30.6830, lng: 76.8510, aliases: ["sec 8 pkl", "sector 8 panchkula"] },
  { name: "Sector 9, Panchkula", lat: 30.6800, lng: 76.8450, aliases: ["sec 9 pkl", "sector 9 panchkula"] },
  { name: "Sector 10, Panchkula", lat: 30.6820, lng: 76.8640, aliases: ["sec 10 pkl", "sector 10 panchkula"] },
  { name: "Sector 11, Panchkula", lat: 30.6770, lng: 76.8580, aliases: ["sec 11 pkl", "sector 11 panchkula"] },
  { name: "Sector 12, Panchkula", lat: 30.6720, lng: 76.8520, aliases: ["sec 12 pkl", "sector 12 panchkula"] },
  { name: "Sector 14, Panchkula", lat: 30.6780, lng: 76.8520, aliases: ["sec 14 pkl", "sector 14 panchkula"] },
  { name: "Sector 15, Panchkula", lat: 30.6870, lng: 76.8660, aliases: ["sec 15 pkl", "sector 15 panchkula"] },
  { name: "Sector 20, Panchkula", lat: 30.6780, lng: 76.8520, aliases: ["sec 20 pkl", "sector 20 panchkula", "sector 20, panchkula", "sector 20"] },
  { name: "Sector 21, Panchkula", lat: 30.6690, lng: 76.8580, aliases: ["sec 21 pkl", "sector 21 panchkula", "sector 21"] },
  { name: "Sector 25-26, Panchkula", lat: 30.6620, lng: 76.8720, aliases: ["sector 25", "sector 26 panchkula", "sec 25 pkl"] },
  { name: "Pinjore / Kalka Highway", lat: 30.7960, lng: 76.9180, aliases: ["pinjore", "kalka"] },

  // --- Zirakpur Localities ---
  { name: "VIP Road, Zirakpur", lat: 30.6425, lng: 76.8173, aliases: ["vip road", "vip road zirakpur", "vip road, zirakpur", "savtry greens", "pentahomes"] },
  { name: "Chandigarh-Ambala Highway, Zirakpur", lat: 30.6480, lng: 76.8240, aliases: ["zirakpur highway", "ambala highway", "zirakpur flyover", "chd ambala highway", "zirakpur"] },
  { name: "Dhakoli, Zirakpur", lat: 30.6550, lng: 76.8420, aliases: ["dhakoli", "dhakoli zirakpur", "ms enclave"] },
  { name: "Baltana, Zirakpur", lat: 30.6610, lng: 76.8320, aliases: ["baltana", "baltana zirakpur"] },
  { name: "Peer Muchalla, Zirakpur", lat: 30.6580, lng: 76.8550, aliases: ["peer muchalla", "peer machalla"] },
  { name: "Patiala Road, Zirakpur", lat: 30.6380, lng: 76.8080, aliases: ["patiala road", "patiala road zirakpur", "maya garden"] },
  { name: "Lohgarh, Zirakpur", lat: 30.6340, lng: 76.8220, aliases: ["lohgarh", "lohgarh zirakpur"] }
];

const TRICITY_SECTORS = TRICITY_LOCATIONS;

// Intelligent Origin Address Resolver
function resolveOriginAddress(str) {
  if (!str) return TRICITY_LOCATIONS[14]; // Default: Sector 17
  const q = String(str).toLowerCase().trim();
  if (!q) return TRICITY_LOCATIONS[14];

  // 1. Direct coordinate format (e.g. "30.7410, 76.7820")
  const coordMatch = q.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { name: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng, isLiveGPS: false };
    }
  }

  // 2. Exact name match
  const direct = TRICITY_LOCATIONS.find(l => l.name.toLowerCase() === q);
  if (direct) return direct;

  // 3. Sector Number Regex (e.g. "Sector 17", "sec-20", "sector 22")
  const secMatch = q.match(/\bsec(?:tor)?\s*[-_]?\s*(\d+)\b/i);
  if (secMatch) {
    const num = secMatch[1];
    if (q.includes("pkl") || q.includes("panchkula")) {
      const matchPkl = TRICITY_LOCATIONS.find(l => l.name.toLowerCase().includes(`sector ${num}`) && l.name.toLowerCase().includes("panchkula"));
      if (matchPkl) return matchPkl;
    }
    const secRegex = new RegExp('\\bsec(?:tor)?\\s*[-_]?\\s*' + num + '\\b', 'i');
    const matchByNum = TRICITY_LOCATIONS.find(l => {
      const lq = l.name.toLowerCase();
      return secRegex.test(lq) || (l.aliases && l.aliases.some(a => secRegex.test(a)));
    });
    if (matchByNum) return matchByNum;
  }

  // 4. Phase Number Regex for Mohali (e.g. "Phase 7", "phase 3b2")
  const phaseMatch = q.match(/\bphase\s*[-_]?\s*([0-9a-z]+)\b/i);
  if (phaseMatch) {
    const pnum = phaseMatch[1].toLowerCase();
    const phaseRegex = new RegExp('\\bphase\\s*[-_]?\\s*' + pnum + '\\b', 'i');
    const matchByPhase = TRICITY_LOCATIONS.find(l => {
      const lq = l.name.toLowerCase();
      return phaseRegex.test(lq) || (l.aliases && l.aliases.some(a => phaseRegex.test(a)));
    });
    if (matchByPhase) return matchByPhase;
  }

  // 5. Specific landmark aliases (VIP Road, Dhakoli, Baltana, ISBT, IT Park, Airport, etc.)
  const aliasMatch = TRICITY_LOCATIONS.find(l => l.aliases && l.aliases.some(a => {
    const aLower = a.toLowerCase();
    return q === aLower || q.includes(aLower);
  }));
  if (aliasMatch) return aliasMatch;

  // 6. Substring in name
  const nameSub = TRICITY_LOCATIONS.find(l => l.name.toLowerCase().includes(q) || q.includes(l.name.toLowerCase()));
  if (nameSub) return nameSub;

  // 7. City Centroids Fallbacks
  if (q.includes("mohali") || q.includes("sas nagar")) {
    return TRICITY_LOCATIONS.find(l => l.name.includes("Phase 7")) || TRICITY_LOCATIONS[14];
  }
  if (q.includes("panchkula")) {
    return TRICITY_LOCATIONS.find(l => l.name.includes("Sector 5")) || TRICITY_LOCATIONS[14];
  }
  if (q.includes("zirakpur")) {
    return TRICITY_LOCATIONS.find(l => l.name.includes("VIP Road")) || TRICITY_LOCATIONS[14];
  }
  if (q.includes("delhi")) {
    return { name: "Delhi NCR Apex Hub", lat: 28.5672, lng: 77.2100, isLiveGPS: false };
  }

  return TRICITY_LOCATIONS[14];
}

// Master Origin Setter: Re-calculates and updates all distances, routes, and embeds dynamically
function setOriginLocation(addrText, explicitCoords) {
  let locationData = explicitCoords;
  if (!locationData) {
    locationData = resolveOriginAddress(addrText);
  }

  patientLocation = {
    name: locationData.name || addrText,
    lat: locationData.lat,
    lng: locationData.lng,
    isLiveGPS: Boolean(locationData.isLiveGPS)
  };

  currentOriginAddress = patientLocation.name;

  const originInput = document.getElementById("originAddressInput");
  if (originInput && document.activeElement !== originInput) {
    originInput.value = patientLocation.name;
  }

  // Highlight active quick origin chip
  document.querySelectorAll(".quick-origin-chip").forEach(function(chip) {
    const chipAddr = chip.getAttribute("data-addr");
    if (chipAddr && (patientLocation.name.toLowerCase().includes(chipAddr.toLowerCase()) || chipAddr.toLowerCase().includes(patientLocation.name.toLowerCase()))) {
      chip.style.borderColor = "var(--rb-cyan)";
      chip.style.background = "rgba(34,200,255,0.18)";
      chip.style.color = "var(--rb-cyan)";
    } else if (chip.id !== "btnOriginGPS") {
      chip.style.borderColor = "";
      chip.style.background = "";
      chip.style.color = "";
    }
  });

  // Update marker on Leaflet map if initialized
  if (typeof patientMarker !== "undefined" && patientMarker) {
    patientMarker.setLatLng([patientLocation.lat, patientLocation.lng]);
    patientMarker.bindPopup(`
      <div style="font-family:system-ui; min-width:180px;">
        <span style="font-size:10px; font-weight:800; color:${patientLocation.isLiveGPS ? '#10b981' : '#38bdf8'}; letter-spacing:0.05em;">
          ${patientLocation.isLiveGPS ? '✓ LIVE GPS LOCATION' : '📍 PATIENT PICKUP ORIGIN'}
        </span>
        <strong style="display:block; font-size:13px; color:#0f172a; margin:4px 0 2px;">${patientLocation.name}</strong>
        <span style="font-size:11px; color:#64748b;">${patientLocation.lat.toFixed(4)}, ${patientLocation.lng.toFixed(4)}</span>
      </div>
    `);
  }

  updateRouteAndDistanceDisplay();
  renderSidebarList();
}

// Intelligent Destination Hospital Matcher
function findMatchingHospital(query) {
  if (!query) return null;
  const q = String(query).toLowerCase().trim();
  if (!q) return null;

  // 1. Direct ID Match
  const byId = TRICITY_HOSPITALS.find(h => h.id.toLowerCase() === q);
  if (byId) return byId;

  // 2. Exact Name Match
  const byName = TRICITY_HOSPITALS.find(h => h.name.toLowerCase() === q);
  if (byName) return byName;

  // 3. Clinical & Local Acronym / Alias Map
  const aliasMap = [
    { keys: ["pgi", "pgimer", "nehru hospital", "sector 12", "apex pgi"], id: "H1" },
    { keys: ["gmch 32", "gmch sector 32", "gmch", "sec 32", "32"], id: "H2" },
    { keys: ["gmsh 16", "gmsh sector 16", "gmsh", "general hospital", "16"], id: "H3" },
    { keys: ["civil mohali", "dr br ambedkar", "phase 6 hospital"], id: "H5" },
    { keys: ["civil pkl", "civil panchkula", "sec 6 panchkula"], id: "H8" },
    { keys: ["civil zirakpur", "chc zirakpur", "zirakpur civil"], id: "H10" },
    { keys: ["fortis", "fortis mohali", "fortis hospital"], id: "H12" },
    { keys: ["max", "max mohali", "max hospital", "max super speciality"], id: "H13" },
    { keys: ["alchemist", "alchemist panchkula", "alchemist hospital"], id: "H14" },
    { keys: ["sunrise", "sunrise mohali"], id: "H15" },
    { keys: ["green valley", "green valley panchkula"], id: "H16" },
    { keys: ["riverside", "riverside zirakpur", "trauma zirakpur"], id: "H17" },
    { keys: ["ivy", "ivy mohali", "ivy hospital"], id: "H19" },
    { keys: ["apex", "apex mohali"], id: "H20" },
    { keys: ["aiims", "aiims delhi", "aiims new delhi"], id: "H21" },
    { keys: ["escorts", "fortis escorts", "okhla"], id: "H22" }
  ];

  for (let i = 0; i < aliasMap.length; i++) {
    const entry = aliasMap[i];
    for (let k = 0; k < entry.keys.length; k++) {
      const key = entry.keys[k];
      if (q === key || q.includes(key) || key.includes(q)) {
        const h = TRICITY_HOSPITALS.find(x => x.id === entry.id);
        if (h) return h;
      }
    }
  }

  // 4. StartsWith Name Match
  const byStarts = TRICITY_HOSPITALS.find(h => h.name.toLowerCase().startsWith(q));
  if (byStarts) return byStarts;

  // 5. Name includes Match
  const byIncludes = TRICITY_HOSPITALS.find(h => h.name.toLowerCase().includes(q));
  if (byIncludes) return byIncludes;

  // 6. City or Location Match
  const byLocation = TRICITY_HOSPITALS.find(h => h.city.toLowerCase().includes(q) || h.location.toLowerCase().includes(q));
  if (byLocation) return byLocation;

  return null;
}

// Reverse-geocode coordinates to actual Area / Locality Name
async function resolveAreaNameFromCoordinates(lat, lng) {
  // 1. Try Nominatim OpenStreetMap Reverse Geocoding with 3.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const neighborhood = a.suburb || a.neighbourhood || a.residential || a.village || a.subdistrict;
        const road = a.road || "";
        const city = a.city || a.town || a.county || a.state_district || "";
        
        let labelParts = [];
        if (neighborhood) labelParts.push(neighborhood);
        else if (road) labelParts.push(road);
        
        if (city && !labelParts.includes(city)) labelParts.push(city);
        
        if (labelParts.length > 0) {
          return labelParts.join(", ");
        } else if (data.display_name) {
          return data.display_name.split(",").slice(0, 2).join(",").trim();
        }
      }
    }
  } catch (e) {
    console.log("Online reverse geocoding skipped, using geometric area matcher.");
  }

  // 2. High-precision Geometric Landmark Matcher for Tricity Sectors & Localities
  let nearestSector = TRICITY_SECTORS[0];
  let minDistance = Infinity;

  for (const sec of TRICITY_SECTORS) {
    const d = Math.hypot(lat - sec.lat, lng - sec.lng);
    if (d < minDistance) {
      minDistance = d;
      nearestSector = sec;
    }
  }

  if (minDistance < 0.035) {
    return `Near ${nearestSector.name}`;
  }

  return `Live Area (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

// Master Location Handler: Invoked when user allows location access
async function handleUserLocationDetected(lat, lng) {
  // Set immediate state so user sees responsiveness
  patientLocation = {
    name: "Accessing your area...",
    lat: lat,
    lng: lng,
    isLiveGPS: true
  };

  currentOriginAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const originInput = document.getElementById("originAddressInput");
  if (originInput) {
    originInput.value = `📍 Detecting area (${lat.toFixed(4)}, ${lng.toFixed(4)})...`;
  }

  // Focus Leaflet map on detected coordinates
  if (mapInstance) {
    mapInstance.setView([lat, lng], 14);
  }

  updateMapMarkers();
  updateRouteAndDistanceDisplay();

  // Reverse geocode to get the actual Locality / Sector name
  const detectedAreaName = await resolveAreaNameFromCoordinates(lat, lng);

  patientLocation.name = detectedAreaName;
  currentOriginAddress = detectedAreaName;
  if (originInput) {
    originInput.value = detectedAreaName;
  }

  // Find and auto-select the nearest hospital to the user's accessed area
  const sortedHospitals = [...TRICITY_HOSPITALS].sort((a, b) => {
    const distA = calculateDistanceAndDuration(lat, lng, a.latitude, a.longitude).distanceKm;
    const distB = calculateDistanceAndDuration(lat, lng, b.latitude, b.longitude).distanceKm;
    return distA - distB;
  });

  if (sortedHospitals.length > 0) {
    selectedDestinationHospital = sortedHospitals[0];
    const hospSelect = document.getElementById("targetHospitalSelect");
    if (hospSelect) {
      hospSelect.value = selectedDestinationHospital.id;
    }
  }

  // Re-render markers, route embed, reaching time, and sidebar
  updateMapMarkers();
  updateRouteAndDistanceDisplay();
  renderSidebarList();

  const stats = calculateDistanceAndDuration(
    lat,
    lng,
    selectedDestinationHospital.latitude,
    selectedDestinationHospital.longitude
  );

  if (window.showToast) {
    window.showToast(
      `📍 Area accessed: ${detectedAreaName}! Nearest: ${selectedDestinationHospital.name} (~${stats.distanceKm} km, ~${stats.durationMins} min)`,
      "success",
      "📍"
    );
  }
}

// Accurate Haversine Distance & Realistic Urban Travel Duration
function calculateDistanceAndDuration(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDist = R * c;

  // Realistic road factor: accounts for urban layout, sectors, roundabouts and ring corridors
  const roadDist = directDist < 0.5
    ? Number(Math.max(directDist * 1.2, 0.4).toFixed(1))
    : Number((directDist * 1.28).toFixed(1));

  // Transit speeds:
  // Ambulance ~38 km/h priority green corridor + 2 min prep/telemetry buffer
  // Personal Car ~24 km/h standard traffic + 4 min casualty parking buffer
  const ambMins = Math.max(Math.round((roadDist / 38) * 60) + 2, 3);
  const carMins = Math.max(Math.round((roadDist / 24) * 60) + 4, 5);

  const durationMins = (typeof currentTravelMode !== "undefined" && currentTravelMode === "personal")
    ? carMins
    : ambMins;

  return { distanceKm: roadDist, durationMins: durationMins, ambMins: ambMins, carMins: carMins };
}

// Filter Hospitals strictly for the 4 cities
function getFilteredHospitals() {
  const q = currentSearch.toLowerCase().trim();
  return TRICITY_HOSPITALS.filter((h) => {
    // Hide worst case national hubs unless specifically requested
    if (h.isWorstCaseApex && !showWorstCase && currentCity !== "WorstCase") return false;

    let matchCity = true;
    if (currentCity === "All") {
      matchCity = THE_4_CITIES.includes(h.city);
    } else if (currentCity === "WorstCase") {
      matchCity = h.isWorstCaseApex === true;
    } else {
      matchCity = h.city === currentCity;
    }

    const matchType = currentType === "All" || h.type === currentType;
    const matchSpec =
      currentSpecialty === "All" ||
      h.specialties.some((s) => s.toLowerCase().includes(currentSpecialty.toLowerCase()));
    const matchQuery =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.specialties.some((s) => s.toLowerCase().includes(q));

    return matchCity && matchType && matchSpec && matchQuery;
  });
}

// Update Map Markers
function updateMapMarkers() {
  if (!mapInstance || !markersGroup) return;

  markersGroup.clearLayers();

  // Render Google-style pulsing User/Patient GPS marker
  const patientIcon = L.divIcon({
    className: "patient-pin-wrapper",
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px;">
        <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(34,200,255,0.4); animation:gpsRipple 1.8s infinite ease-out;"></div>
        <div style="width:20px; height:20px; border-radius:50%; background:#0284c7; border:3px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  patientMarker = L.marker([patientLocation.lat, patientLocation.lng], { icon: patientIcon })
    .addTo(markersGroup)
    .bindPopup(`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <span style="font-size:10px; font-weight:800; color:#0284c7; background:rgba(2,132,199,0.1); padding:2px 6px; border-radius:4px;">
          ${patientLocation.isLiveGPS ? '✓ LIVE GPS LOCATION' : '📍 PATIENT PICKUP ORIGIN'}
        </span>
        <strong style="display:block; font-size:13px; color:#0f172a; margin:4px 0 2px;">${patientLocation.name}</strong>
        <p style="margin:0; font-size:11.5px; color:#64748b;">Click anywhere on map to reposition or test transfer routes.</p>
      </div>
    `);

  const list = getFilteredHospitals();
  const bounds = [[patientLocation.lat, patientLocation.lng]];

  list.forEach((h) => {
    bounds.push([h.latitude, h.longitude]);

    const isGovt = h.type === "Govt";
    const isFull = h.status === "Full";
    const isAvail = h.status === "Available";
    const pinColor = isFull ? "#ef4444" : isAvail ? "#10b981" : "#f59e0b";
    const badgeText = isGovt ? "GOVT" : "PVT";
    const badgeBg = isGovt ? "#0284c7" : "#8b5cf6";

    const customIcon = L.divIcon({
      className: "hospital-pin-box",
      html: `
        <div style="position:relative; width:36px; height:36px; background:${pinColor}; border:2.5px solid #fff; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,0,0,0.4); transform:rotate(-45deg); cursor:pointer;">
          <div style="transform:rotate(45deg); font-size:17px; color:#fff; font-weight:800;">🏥</div>
          <span style="position:absolute; top:-8px; right:-8px; background:${badgeBg}; color:#fff; font-size:8.5px; font-weight:800; padding:1px 5px; border-radius:4px; transform:rotate(45deg); box-shadow:0 2px 4px rgba(0,0,0,0.3);">${badgeText}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([h.latitude, h.longitude], { icon: customIcon }).addTo(markersGroup);

    const stats = calculateDistanceAndDuration(
      patientLocation.lat,
      patientLocation.lng,
      h.latitude,
      h.longitude
    );

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${patientLocation.lat},${patientLocation.lng}&destination=${h.latitude},${h.longitude}`;

    const popupHtml = `
      <div style="font-family:Inter,sans-serif; min-width:250px; padding:2px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:10px; font-weight:800; background:${badgeBg}; color:#fff; padding:2px 6px; border-radius:4px;">${h.category.toUpperCase()}</span>
          <span style="font-size:11px; font-weight:700; color:${pinColor};">${h.status.toUpperCase()}</span>
        </div>
        <h4 style="margin:2px 0 4px; font-size:14px; font-weight:700; color:#0f172a;">${h.name}</h4>
        <p style="margin:0 0 6px; font-size:11.5px; color:#64748b;">📍 ${h.location} (${h.city})</p>
        
        <div style="display:flex; gap:8px; margin-bottom:8px; background:#f8fafc; padding:6px 8px; border-radius:6px; font-size:11px; color:#334155;">
          <div>Beds: <b>${h.availableBeds}/${h.totalBeds}</b></div>
          <div>ICU: <b style="color:#0284c7;">${h.icuAvailable}</b></div>
          <div>ETA: <b style="color:#059669;">~${stats.durationMins}m</b> (${stats.distanceKm}km)</div>
        </div>

        <div style="font-size:11px; color:#475569; margin-bottom:10px;">
          <b>Specialties:</b> ${h.specialties.slice(0, 3).join(", ")}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <button onclick="selectDestinationHospitalById('${h.id}')" style="padding:7px; background:#0ea5e9; color:#fff; border:none; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
            ➔ Route &amp; Transit
          </button>
          <a href="${gmapsUrl}" target="_blank" rel="noopener" style="display:flex; align-items:center; justify-content:center; text-decoration:none; padding:7px; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; border-radius:6px; font-size:11.5px; font-weight:700;">
            Google Maps ↗
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
  });

  // Fit bounds if specific city selected
  if (currentCity !== "All" && bounds.length > 1) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

// Select Destination and Draw Corridor Polyline
window.selectDestinationHospitalById = function (id) {
  const hosp = TRICITY_HOSPITALS.find((h) => h.id === id);
  if (!hosp) return;

  selectedDestinationHospital = hosp;
  updateRouteAndDistanceDisplay();

  if (window.showToast) {
    window.showToast(`Selected destination: ${hosp.name}`, "info", "🏥");
  }
};

function updateRouteAndDistanceDisplay() {
  if (!selectedDestinationHospital || !patientLocation) return;

  const target = selectedDestinationHospital;
  const stats = calculateDistanceAndDuration(
    patientLocation.lat,
    patientLocation.lng,
    target.latitude,
    target.longitude
  );

  // Compute duration based on travel mode
  let durationMins = stats.durationMins;
  if (currentTravelMode === "personal") {
    // Personal car: urban traffic speed (~25 km/h) + 4 mins casualty parking
    durationMins = Math.max(Math.round((stats.distanceKm / 25) * 60) + 4, 6);
  } else {
    // Ambulance: emergency corridor speed (~36 km/h) + 2 mins response buffer
    durationMins = Math.max(Math.round((stats.distanceKm / 36) * 60) + 2, 4);
  }

  const now = new Date();
  const departureStr = formatClockTime(now);
  const arrivalDate = new Date(now.getTime() + durationMins * 60000);
  const arrivalStr = formatClockTime(arrivalDate);

  const nameEl = document.getElementById("targetHospitalName");
  const specEl = document.getElementById("targetSpecialties");
  const distEl = document.getElementById("estDistanceKm");
  const durEl = document.getElementById("estDurationMins");
  const depEl = document.getElementById("estDepartureTime");
  const arrEl = document.getElementById("estArrivalTime");
  const modeBadge = document.getElementById("transitModeBadge");
  const reassuranceEl = document.getElementById("routeReassuranceText");
  const gmapsBtn = document.getElementById("btnExternalGoogleMaps");
  const embedFrame = document.getElementById("gmapsEmbedFrame");
  const hospSelectEl = document.getElementById("targetHospitalSelect");
  const originInput = document.getElementById("originAddressInput");

  if (nameEl) nameEl.textContent = `${target.name} (${target.city})`;
  if (specEl) specEl.textContent = target.specialties.join(", ");
  if (distEl) distEl.textContent = `${stats.distanceKm} km`;
  if (durEl) durEl.textContent = `~${durationMins} mins`;
  if (depEl) depEl.textContent = departureStr;
  if (arrEl) arrEl.textContent = `~${arrivalStr}`;

  if (modeBadge) {
    if (currentTravelMode === "ambulance") {
      modeBadge.textContent = "🚑 AMBULANCE";
      modeBadge.style.color = "var(--rb-cyan)";
      modeBadge.style.background = "rgba(34,200,255,0.15)";
      modeBadge.style.borderColor = "rgba(34,200,255,0.3)";
    } else {
      modeBadge.textContent = "🚗 PERSONAL CAR";
      modeBadge.style.color = "#fbbf24";
      modeBadge.style.background = "rgba(251,191,36,0.15)";
      modeBadge.style.borderColor = "rgba(251,191,36,0.3)";
    }
  }

  if (reassuranceEl) {
    if (currentTravelMode === "ambulance") {
      reassuranceEl.textContent = "Emergency Green Corridor Active · Paramedic team & onboard oxygen prepped.";
    } else {
      reassuranceEl.textContent = "Personal Car Route · Priority Casualty Gate Pass pre-cleared for direct bay entry.";
    }
  }

  if (hospSelectEl && hospSelectEl.value !== target.id) {
    hospSelectEl.value = target.id;
  }

  // Also update autocomplete input text if user hasn't focused it
  const hospInputEl = document.getElementById("targetHospitalInput");
  if (hospInputEl && document.activeElement !== hospInputEl) {
    hospInputEl.value = target.name;
  }

  const originStr = patientLocation.isLiveGPS
    ? `${patientLocation.lat.toFixed(5)},${patientLocation.lng.toFixed(5)}`
    : (currentOriginAddress || patientLocation.name || "Sector 17, Chandigarh");
  const destStr = `${target.name}, ${target.location}, ${target.city}`;

  // Update Google Maps Native App Direction URL
  if (gmapsBtn) {
    gmapsBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`;
  }

  // Update Google Maps Live Embed iframe (100% Free, Zero Blocks)
  if (embedFrame) {
    const embedUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(originStr)}&daddr=${encodeURIComponent(destStr)}&output=embed`;
    if (embedFrame.src !== embedUrl) {
      embedFrame.src = embedUrl;
    }
  }

  // Render Step-by-Step Directions (only if element still exists in DOM)
  const stepsListEl = document.getElementById("directionsStepsList");
  if (stepsListEl) {
    const displayOrigin = patientLocation.name || currentOriginAddress || "Sector 17, Chandigarh";
    const steps = generateStepDirections(displayOrigin, target);
    stepsListEl.innerHTML = steps.map(s => `
      <div class="directions-step-item">
        <span class="step-num-badge">${s.step}</span>
        <div style="flex:1;">
          <div>${s.text}</div>
          <small style="color:var(--rb-teal); font-weight:700;">${s.dist}</small>
        </div>
      </div>
    `).join("");
  }

  // Draw Glowing Route Polyline on Leaflet
  if (routeLineGroup && mapInstance) {
    routeLineGroup.clearLayers();

    const polyline = L.polyline(
      [
        [patientLocation.lat, patientLocation.lng],
        [target.latitude, target.longitude]
      ],
      {
        color: currentTravelMode === "ambulance" ? "#22c8ff" : "#f59e0b",
        weight: 5,
        opacity: 0.9,
        dashArray: "10, 8",
        lineCap: "round"
      }
    ).addTo(routeLineGroup);

    mapInstance.fitBounds(polyline.getBounds(), { padding: [60, 60] });
  }

  renderSidebarList();
}

// Render Sidebar List sorted by nearest first
function renderSidebarList() {
  const container = document.getElementById("facilityListSidebar");
  const countBadge = document.getElementById("hospitalCountBadge");
  const govtBadge = document.getElementById("govtCountBadge");
  if (!container) return;

  let list = getFilteredHospitals();

  // Sort by Distance from Patient/User Location (Nearest First)
  list.sort((a, b) => {
    const distA = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, a.latitude, a.longitude).distanceKm;
    const distB = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, b.latitude, b.longitude).distanceKm;
    return distA - distB;
  });

  if (countBadge) countBadge.textContent = list.length;
  if (govtBadge) {
    const govtCount = list.filter((h) => h.type === "Govt").length;
    govtBadge.textContent = `${govtCount} Government`;
  }

  container.innerHTML = "";

  list.forEach((h, idx) => {
    const isSelected = selectedDestinationHospital && selectedDestinationHospital.id === h.id;
    const isGovt = h.type === "Govt";
    const stats = calculateDistanceAndDuration(
      patientLocation.lat,
      patientLocation.lng,
      h.latitude,
      h.longitude
    );

    const card = document.createElement("div");
    card.className = `facility-mini-card ${isSelected ? "active" : ""}`;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
        <div style="display:flex; align-items:center; gap:6px;">
          ${idx === 0 ? '<span style="font-size:9px; background:#10b981; color:#fff; padding:1px 5px; border-radius:3px; font-weight:800;">NEAREST</span>' : ''}
          <strong style="font-size:13px; color:${isSelected ? 'var(--rb-cyan)' : 'var(--rb-text-main)'}; line-height:1.3;">
            ${h.name}
          </strong>
        </div>
        ${isGovt ? '<span class="custom-govt-pill">GOVT</span>' : ''}
      </div>
      <div style="font-size:11px; color:var(--rb-text-muted); margin-bottom:6px;">
        📍 ${h.city} · ${h.location} · <b style="color:var(--rb-teal);">${stats.distanceKm} km</b> (~${stats.durationMins} mins)
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span style="color:${h.availableBeds > 0 ? 'var(--rb-green)' : 'var(--rb-red)'}; font-weight:600;">
          Beds: ${h.availableBeds}/${h.totalBeds}
        </span>
        <span style="color:${h.icuAvailable > 0 ? 'var(--rb-cyan)' : 'var(--rb-red)'}; font-weight:600;">
          ICU: ${h.icuAvailable}
        </span>
        <span style="color:var(--rb-cyan); font-weight:600;">Select ➔</span>
      </div>
    `;

    card.addEventListener("click", () => {
      selectedDestinationHospital = h;
      updateRouteAndDistanceDisplay();
    });

    container.appendChild(card);
  });
}

// Smart Cardio Emergency Recommendation
function suggestBestCardioHospital() {
  const cardioCandidates = TRICITY_HOSPITALS.filter(
    (h) =>
      THE_4_CITIES.includes(h.city) &&
      h.specialties.some((s) => s.toLowerCase().includes("cardio")) &&
      (h.icuAvailable > 0 || h.availableBeds > 0)
  );

  if (cardioCandidates.length === 0) {
    if (window.showToast) window.showToast("No immediate cardio capacity found in the 4 cities", "warning", "⚠");
    return;
  }

  // Sort by lowest transit duration (critical priority!) and high ICU availability
  cardioCandidates.sort((a, b) => {
    const durA = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, a.latitude, a.longitude).durationMins;
    const durB = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, b.latitude, b.longitude).durationMins;
    return durA - durB || b.icuAvailable - a.icuAvailable;
  });

  const best = cardioCandidates[0];
  selectedDestinationHospital = best;

  const specSelect = document.getElementById("mapSpecialtyFilter");
  if (specSelect) {
    specSelect.value = "Cardiology";
    currentSpecialty = "Cardiology";
  }

  updateMapMarkers();
  updateRouteAndDistanceDisplay();

  const stats = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, best.latitude, best.longitude);
  if (window.showToast) {
    window.showToast(
      `Fastest Cardio Emergency Route: ${best.name} (~${stats.durationMins} mins, ${best.icuAvailable} ICU beds open)`,
      "success",
      "❤️"
    );
  }
}

// Outbound Transfer Modal with Ambulance Booking and Digital Records Forwarding
function setupTransferModal() {
  const btn = document.getElementById("btnInitiateTransferFromMap");
  const modalBackdrop = document.getElementById("modalTransferBackdrop");
  const body = document.getElementById("modalTransferBody");
  const confirmBtn = document.getElementById("btnConfirmMapTransfer");

  if (!btn || !modalBackdrop || !body) return;

  btn.addEventListener("click", () => {
    if (!selectedDestinationHospital) return;

    const stats = calculateDistanceAndDuration(
      patientLocation.lat,
      patientLocation.lng,
      selectedDestinationHospital.latitude,
      selectedDestinationHospital.longitude
    );

    const dur = currentTravelMode === "personal" 
      ? Math.max(Math.round((stats.distanceKm / 25) * 60) + 4, 6)
      : Math.max(Math.round((stats.distanceKm / 36) * 60) + 2, 4);

    const now = new Date();
    const arrTime = formatClockTime(new Date(now.getTime() + dur * 60000));

    body.innerHTML = `
      <div style="padding:12px; border-radius:10px; background:rgba(34,200,255,0.08); border:1px solid var(--rb-border); margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--rb-text-muted);">Transfer Destination Facility</span>
          <span style="font-size:10px; font-weight:800; background:rgba(20,228,184,0.15); color:var(--rb-teal); padding:2px 8px; border-radius:10px;">REACHING BY ~${arrTime}</span>
        </div>
        <strong style="display:block; font-size:15px; color:var(--rb-cyan); margin-top:2px;">${selectedDestinationHospital.name}</strong>
        <p style="margin:4px 0 0; font-size:12px; color:var(--rb-text-muted);">
          📍 ${selectedDestinationHospital.location} (${selectedDestinationHospital.city}) &middot; 🚗 ${stats.distanceKm} km (~${dur} mins)
        </p>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Select Patient Case</label>
        <select id="modalPatientSelect" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px;">
          <option value="PT-2291">PT-2291 — Paramjit Singh (54y, Acute Myocardial Infarction - Cardiology)</option>
          <option value="PT-2292">PT-2292 — Sunita Verma (29y, Compound Femur Fracture - Ortho)</option>
          <option value="PT-2293">PT-2293 — Harbans Lal (67y, Cardiogenic Shock - Cardiology)</option>
          <option value="PT-2294">PT-2294 — Baby Ananya (8y, Severe Bronchiolitis - Pediatrics)</option>
        </select>
      </div>

      <!-- User Choice: Ambulance vs Personal Vehicle -->
      <div style="margin-bottom:14px; padding:12px 14px; border-radius:10px; background:rgba(34,200,255,0.06); border:1px solid rgba(34,200,255,0.25);">
        <p style="font-size:12px; font-weight:700; color:var(--rb-cyan); margin:0 0 10px; text-transform:uppercase; letter-spacing:0.04em;">
          How will the patient travel to the hospital?
        </p>

        <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; margin-bottom:10px; padding:8px 10px; border-radius:8px; background:${currentTravelMode === 'ambulance' ? 'rgba(34,200,255,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${currentTravelMode === 'ambulance' ? 'var(--rb-cyan)' : 'var(--rb-border)'};">
          <input type="radio" name="modalTransitChoice" value="Ambulance" ${currentTravelMode === 'ambulance' ? 'checked' : ''} style="margin-top:3px;" onchange="document.getElementById('modalAmbOptionsWrap').style.display='block';">
          <div>
            <strong style="font-size:13px; display:block; color:var(--rb-cyan);">🚑 Book Hospital Emergency Ambulance</strong>
            <span style="font-size:11.5px; color:var(--rb-text-muted);">Paramedic team with oxygen &amp; telemetry will be dispatched directly to patient location. Priority corridor active.</span>
          </div>
        </label>

        <!-- Ambulance Sub-options -->
        <div id="modalAmbOptionsWrap" style="margin-left:24px; margin-bottom:10px; display:${currentTravelMode === 'ambulance' ? 'flex' : 'none'}; gap:16px;">
          <label style="font-size:11.5px; color:var(--rb-text-main); display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="radio" name="ambType" value="ALS" checked> 🔴 ALS (Ventilator &amp; Defibrillator)
          </label>
          <label style="font-size:11.5px; color:var(--rb-text-main); display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="radio" name="ambType" value="BLS"> 🟡 BLS (Oxygen &amp; EMT)
          </label>
        </div>

        <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; padding:8px 10px; border-radius:8px; background:${currentTravelMode === 'personal' ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${currentTravelMode === 'personal' ? '#fbbf24' : 'var(--rb-border)'};">
          <input type="radio" name="modalTransitChoice" value="Personal Vehicle" ${currentTravelMode === 'personal' ? 'checked' : ''} style="margin-top:3px;" onchange="document.getElementById('modalAmbOptionsWrap').style.display='none';">
          <div>
            <strong style="font-size:13px; display:block; color:#fbbf24;">🚗 Travelling by Personal Vehicle (Own Car / Taxi)</strong>
            <span style="font-size:11.5px; color:var(--rb-text-muted);">No ambulance required. Family brings patient directly. An Express Casualty Gate Pass is issued so you drive straight to emergency bay.</span>
          </div>
        </label>
      </div>

      <div style="margin-bottom:14px; padding:10px 12px; border-radius:8px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25);">
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; color:var(--rb-green); cursor:pointer;">
          <input type="checkbox" id="modalForwardRecordsCheck" checked>
          <span>📋 Forward Patient Past Medical Records &amp; ECG Telemetry (Zero Formalities)</span>
        </label>
        <small style="color:var(--rb-text-muted); display:block; margin-left:24px; margin-top:2px;">
          Whether travelling by ambulance or personal car, all clinical dossiers are pre-transmitted. Registration paperwork is waived.
        </small>
      </div>

      <div>
        <label style="display:block; font-size:12px; font-weight:600; color:var(--rb-text-muted); margin-bottom:6px;">Transfer Physician Handoff Notes</label>
        <textarea id="modalClinicalNotes" rows="2" placeholder="Enter patient vitals, telemetry status or ICU requirements..." style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--rb-border); background:var(--rb-panel-solid); color:var(--rb-text-main); font-size:13px; font-family:var(--font-body);"></textarea>
      </div>
    `;

    modalBackdrop.hidden = false;
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const patientSelect = document.getElementById("modalPatientSelect");
      const notesEl = document.getElementById("modalClinicalNotes");
      const recordsCheck = document.getElementById("modalForwardRecordsCheck");
      const transitRadios = document.querySelectorAll('input[name="modalTransitChoice"]');

      let transitVal = "Ambulance";
      transitRadios.forEach(r => { if (r.checked) transitVal = r.value; });

      const ptVal = patientSelect ? patientSelect.value : "PT-2291";
      const notes = notesEl ? notesEl.value.trim() : "";
      const hasRecords = recordsCheck ? recordsCheck.checked : true;

      const newReq = {
        id: "REQ-" + Math.floor(200 + Math.random() * 800),
        patientId: ptVal,
        age: 52,
        specialty: selectedDestinationHospital.specialties[0] || "Cardiology",
        condition: `Map Outbound Referral: ${notes || "Clinical handoff pre-cleared"}`,
        history: hasRecords ? "Past EHR & ECG Telemetry Forwarded (Formalities Waived)" : "Manual Records",
        urgency: "Critical",
        hospital: selectedDestinationHospital.name,
        transitMode: transitVal,
        ambulanceDispatched: transitVal === "Ambulance" ? "Unit AMB-902 (ALS En-Route)" : "Personal Vehicle (Express Bay Pass)",
        recordsForwarded: hasRecords,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Pending"
      };

      let reqs = JSON.parse(localStorage.getItem("referbridge_requests") || "[]");
      reqs.unshift(newReq);
      localStorage.setItem("referbridge_requests", JSON.stringify(reqs));

      modalBackdrop.hidden = true;

      if (window.showToast) {
        if (transitVal === "Ambulance") {
          window.showToast(`Transfer Created! 🚑 ALS Ambulance AMB-902 dispatched to ${selectedDestinationHospital.name}`, "success", "🚑");
        } else {
          window.showToast(`Transfer Created! 🚗 Personal Vehicle pass issued — Casualty bay reserved & formalities waived!`, "success", "🚗");
        }
      }
    });
  }
}

function initGoogleMapsEmbedAndControls() {
  // Hidden select kept for transfer modal compatibility
  const hospSelect = document.getElementById("targetHospitalSelect");
  if (hospSelect) {
    hospSelect.innerHTML = TRICITY_HOSPITALS.map(function(h) {
      return '<option value="' + h.id + '">' + h.name + '</option>';
    }).join("");
    hospSelect.addEventListener("change", function () {
      var match = TRICITY_HOSPITALS.find(function(h) { return h.id === this.value; }.bind(this));
      if (match) {
        selectedDestinationHospital = match;
        if (hospInput) hospInput.value = match.name;
        updateRouteAndDistanceDisplay();
      }
    });
    if (selectedDestinationHospital) hospSelect.value = selectedDestinationHospital.id;
  }

  // Hospital Autocomplete Search
  var hospInput = document.getElementById("targetHospitalInput");
  var suggBox = document.getElementById("hospitalSuggestionsDropdown");
  var clearBtn = document.getElementById("btnClearHospitalSearch");

  if (hospInput && selectedDestinationHospital) {
    hospInput.value = selectedDestinationHospital.name;
  }

  function selectHospital(h) {
    if (!h) return;
    selectedDestinationHospital = h;
    if (hospInput) hospInput.value = h.name;
    if (hospSelect) hospSelect.value = h.id;
    if (clearBtn) clearBtn.style.display = "inline";
    if (suggBox) suggBox.style.display = "none";
    updateRouteAndDistanceDisplay();
    renderSidebarList();
    if (window.showToast) {
      var s = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, h.latitude, h.longitude);
      window.showToast("Destination: " + h.name + " (" + s.distanceKm + " km, ~" + s.durationMins + " min)", "success", "🏥");
    }
  }

  function buildSuggestionHTML(h) {
    var stats = calculateDistanceAndDuration(
      patientLocation.lat, patientLocation.lng, h.latitude, h.longitude
    );
    var isGovt = h.type === "Govt";
    var isSelected = selectedDestinationHospital && selectedDestinationHospital.id === h.id;
    var bedColor = h.availableBeds > 10 ? "#10b981" : h.availableBeds > 0 ? "#f59e0b" : "#ef4444";
    var tagBg = isGovt ? "rgba(2,132,199,0.2)" : "rgba(139,92,246,0.2)";
    var tagColor = isGovt ? "#38bdf8" : "#a78bfa";
    var icuColor = h.icuAvailable > 0 ? "var(--rb-cyan)" : "#ef4444";
    var modeIcon = currentTravelMode === "ambulance" ? "🚑" : "🚗";
    var selectedClass = isSelected ? " selected" : "";

    var html = '<div class="hosp-suggestion-item' + selectedClass + '" data-id="' + h.id + '">';
    html += '<div>';
    html += '<div class="hosp-sugg-name">';
    html += '🏥 ' + h.name;
    html += '<span class="hosp-sugg-tag" style="background:' + tagBg + '; color:' + tagColor + ';">' + (isGovt ? "GOVT" : "PVT") + '</span>';
    html += '</div>';
    html += '<div class="hosp-sugg-meta">📍 ' + h.city + ' · ' + h.location + ' · <span style="color:var(--rb-teal); font-weight:700;">' + stats.distanceKm + ' km</span> (~' + stats.durationMins + ' min)</div>';
    html += '<div class="hosp-sugg-meta" style="margin-top:2px;">Beds: <span style="color:' + bedColor + '; font-weight:700;">' + h.availableBeds + '/' + h.totalBeds + '</span> · ICU: <span style="color:' + icuColor + '; font-weight:700;">' + h.icuAvailable + '</span></div>';
    html += '</div>';
    html += '<div style="font-size:11px; font-weight:700; color:var(--rb-text-muted);">' + modeIcon + ' ~' + stats.durationMins + ' min</div>';
    html += '</div>';
    return html;
  }

  function renderSuggestions(query) {
    if (!suggBox) return;
    var q = query.toLowerCase().trim();
    var matches = q.length === 0
      ? [...TRICITY_HOSPITALS]
      : TRICITY_HOSPITALS.filter(function(h) {
          return h.name.toLowerCase().includes(q) ||
            h.city.toLowerCase().includes(q) ||
            h.location.toLowerCase().includes(q) ||
            h.specialties.some(function(s) { return s.toLowerCase().includes(q); }) ||
            h.type.toLowerCase().includes(q);
        });

    // Real-time Sort by distance from current patientLocation
    matches.sort(function(a, b) {
      var distA = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, a.latitude, a.longitude).distanceKm;
      var distB = calculateDistanceAndDuration(patientLocation.lat, patientLocation.lng, b.latitude, b.longitude).distanceKm;
      return distA - distB;
    });

    if (matches.length === 0) {
      suggBox.innerHTML = '<div style="padding:14px; font-size:12px; color:var(--rb-text-muted); text-align:center;">No hospitals found for "' + query + '"</div>';
      suggBox.style.display = "block";
      return;
    }

    suggBox.innerHTML = matches.slice(0, 10).map(buildSuggestionHTML).join("");

    suggBox.querySelectorAll(".hosp-suggestion-item").forEach(function(item) {
      function handleItemSelect(e) {
        e.preventDefault();
        var id = item.getAttribute("data-id");
        var match = TRICITY_HOSPITALS.find(function(h) { return h.id === id; });
        if (match) {
          selectHospital(match);
        }
      }
      item.addEventListener("mousedown", handleItemSelect);
      item.addEventListener("click", handleItemSelect);
      item.addEventListener("touchstart", handleItemSelect);
    });

    suggBox.style.display = "block";
  }

  if (hospInput) {
    hospInput.addEventListener("input", function () {
      if (clearBtn) clearBtn.style.display = this.value.length > 0 ? "inline" : "none";
      renderSuggestions(this.value);
    });

    hospInput.addEventListener("focus", function () {
      renderSuggestions(this.value);
    });

    hospInput.addEventListener("blur", function () {
      var self = this;
      setTimeout(function() {
        if (suggBox) suggBox.style.display = "none";
        // Attempt intelligent alias / substring matching instead of strict equality
        var match = findMatchingHospital(self.value);
        if (match) {
          selectHospital(match);
        } else if (selectedDestinationHospital) {
          self.value = selectedDestinationHospital.name;
        }
      }, 250);
    });

    hospInput.addEventListener("keydown", function (e) {
      if (!suggBox) return;
      var items = Array.from(suggBox.querySelectorAll(".hosp-suggestion-item"));
      var idx = items.findIndex(function(el) { return el.classList.contains("kbd-focus"); });

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (idx >= 0) items[idx].classList.remove("kbd-focus");
        idx = Math.min(idx + 1, items.length - 1);
        if (items[idx]) { items[idx].classList.add("kbd-focus"); items[idx].scrollIntoView({ block: "nearest" }); }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx >= 0) items[idx].classList.remove("kbd-focus");
        idx = Math.max(idx - 1, 0);
        if (items[idx]) { items[idx].classList.add("kbd-focus"); items[idx].scrollIntoView({ block: "nearest" }); }
      } else if (e.key === "Enter") {
        e.preventDefault();
        var focused = suggBox.querySelector(".kbd-focus");
        if (focused) {
          var id = focused.getAttribute("data-id");
          var match = TRICITY_HOSPITALS.find(function(h) { return h.id === id; });
          if (match) { selectHospital(match); return; }
        }
        var matchDirect = findMatchingHospital(this.value);
        if (matchDirect) {
          selectHospital(matchDirect);
        }
      } else if (e.key === "Escape") {
        suggBox.style.display = "none";
        this.value = selectedDestinationHospital ? selectedDestinationHospital.name : "";
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      if (hospInput) { hospInput.value = ""; hospInput.focus(); }
      clearBtn.style.display = "none";
      renderSuggestions("");
    });
  }

  document.addEventListener("click", function(e) {
    if (suggBox &&
        !e.target.closest("#targetHospitalInput") &&
        !e.target.closest("#hospitalSuggestionsDropdown") &&
        !e.target.closest("#btnClearHospitalSearch")) {
      suggBox.style.display = "none";
    }
  });

  // View Mode Switcher
  var btnGoogle = document.getElementById("btnViewGoogleEmbed");
  var btnLeaflet = document.getElementById("btnViewLeaflet");
  var gmapsWrap = document.getElementById("googleMapsEmbedWrap");
  var leafletMapEl = document.getElementById("liveLeafletMap");
  var legendOverlay = document.getElementById("mapLegendOverlay");

  if (btnGoogle && btnLeaflet && gmapsWrap && leafletMapEl) {
    btnGoogle.addEventListener("click", function() {
      btnGoogle.classList.add("active"); btnLeaflet.classList.remove("active");
      gmapsWrap.style.display = "block"; leafletMapEl.style.display = "none";
      if (legendOverlay) legendOverlay.style.display = "none";
      currentViewMode = "google";
      updateRouteAndDistanceDisplay();
    });
    btnLeaflet.addEventListener("click", function() {
      btnLeaflet.classList.add("active"); btnGoogle.classList.remove("active");
      gmapsWrap.style.display = "none"; leafletMapEl.style.display = "block";
      if (legendOverlay) legendOverlay.style.display = "flex";
      currentViewMode = "leaflet";
      if (mapInstance) mapInstance.invalidateSize();
      updateRouteAndDistanceDisplay();
    });
  }

  // Travel Mode Switcher (Ambulance vs Personal Vehicle)
  var modeAmb = document.getElementById("modeAmbulanceBtn");
  var modePers = document.getElementById("modePersonalBtn");
  if (modeAmb && modePers) {
    modeAmb.addEventListener("click", function() {
      modeAmb.classList.add("active"); modePers.classList.remove("active");
      currentTravelMode = "ambulance";
      updateRouteAndDistanceDisplay();
    });
    modePers.addEventListener("click", function() {
      modePers.classList.add("active"); modeAmb.classList.remove("active");
      currentTravelMode = "personal";
      updateRouteAndDistanceDisplay();
    });
  }

  // Origin Address Input: Dynamic Geocoding and Location Setter
  var originInput = document.getElementById("originAddressInput");
  if (originInput) {
    originInput.addEventListener("change", function () {
      var val = this.value.trim();
      if (val) {
        setOriginLocation(val);
      }
    });
    originInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var val = this.value.trim();
        if (val) {
          setOriginLocation(val);
          this.blur();
        }
      }
    });
  }

  // Quick Origin Chips: Instant Coordinates & Distance Recalculation
  document.querySelectorAll(".quick-origin-chip").forEach(function(chip) {
    if (chip.id === "btnOriginGPS") return;
    chip.addEventListener("click", function () {
      var addr = this.getAttribute("data-addr");
      if (addr) {
        if (originInput) originInput.value = addr;
        setOriginLocation(addr);
        if (window.showToast) window.showToast("Pickup set to " + addr, "info", "📍");
      }
    });
  });

  // GPS Button for Origin: True Device GPS Access
  var btnOriginGPS = document.getElementById("btnOriginGPS");
  if (btnOriginGPS) {
    btnOriginGPS.addEventListener("click", function() {
      if (navigator.geolocation) {
        if (window.showToast) window.showToast("Accessing device GPS location...", "info", "🛰️");
        navigator.geolocation.getCurrentPosition(
          function(pos) { handleUserLocationDetected(pos.coords.latitude, pos.coords.longitude); },
          function() { if (window.showToast) window.showToast("GPS unavailable or permission denied.", "warning", "⚠️"); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }
}

// Global closeModal helper used by modal HTML onclick attributes
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.hidden = true;
}


// ─────────────────────────────────────────────────────────────
// Map Initialization and Event Setup
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  if (window.loadTheme) window.loadTheme();
  if (window.requireLogin) window.requireLogin();

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle && window.toggleTheme) themeToggle.addEventListener("click", window.toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn && window.handleLogout) logoutBtn.addEventListener("click", window.handleLogout);

  // Initialize Leaflet Map only if element is present in DOM
  const leafletEl = document.getElementById("liveLeafletMap");
  if (leafletEl && typeof L !== "undefined") {
    mapInstance = L.map("liveLeafletMap", {
      center: [CITY_CENTERS["All"].lat, CITY_CENTERS["All"].lng],
      zoom: CITY_CENTERS["All"].zoom,
      zoomControl: true
    });

    // Layer 1: CartoDB Voyager — Crisp Google Maps styling, NO 403, 100% Free & Fast
    const voyagerLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: '© <a href="https://carto.com/">CARTO</a> | ReferBridge Health Matrix'
    });

    // Layer 2: Esri World Street Map (High reliability fallback)
    const esriStreetLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    });

    // Layer 3: Esri Satellite World Imagery
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    });

    // Add primary layer
    voyagerLayer.addTo(mapInstance);

    // Add Google style Layer Switcher
    L.control.layers({
      "🗺️ Google Street (Voyager)": voyagerLayer,
      "🛣️ Esri Street View": esriStreetLayer,
      "🛰️ Satellite Imagery": satelliteLayer
    }, null, { position: "topleft" }).addTo(mapInstance);

    markersGroup = L.layerGroup().addTo(mapInstance);
    routeLineGroup = L.layerGroup().addTo(mapInstance);

    // Click on map to reposition patient
    mapInstance.on("click", async function (e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      patientLocation = {
        name: `Pinning area (${lat.toFixed(4)}, ${lng.toFixed(4)})...`,
        lat: lat,
        lng: lng,
        isLiveGPS: false
      };

      updateMapMarkers();
      updateRouteAndDistanceDisplay();

      const areaName = await resolveAreaNameFromCoordinates(lat, lng);
      patientLocation.name = areaName;
      currentOriginAddress = areaName;

      const originInput = document.getElementById("originAddressInput");
      if (originInput) originInput.value = areaName;

      // Auto-select nearest hospital to clicked point
      const sortedHospitals = [...TRICITY_HOSPITALS].sort((a, b) => {
        const distA = calculateDistanceAndDuration(lat, lng, a.latitude, a.longitude).distanceKm;
        const distB = calculateDistanceAndDuration(lat, lng, b.latitude, b.longitude).distanceKm;
        return distA - distB;
      });

      if (sortedHospitals.length > 0) {
        selectedDestinationHospital = sortedHospitals[0];
        const hospSelect = document.getElementById("targetHospitalSelect");
        if (hospSelect) hospSelect.value = selectedDestinationHospital.id;
      }

      updateMapMarkers();
      updateRouteAndDistanceDisplay();
      renderSidebarList();

      if (window.showToast) {
        window.showToast(`Pickup point set to ${areaName}! Nearest hospital updated.`, "info", "📍");
      }
    });
  }

  // Auto-detect User's True GPS Location on Load when Allowed
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleUserLocationDetected(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.log("GPS prompt skipped or pending:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Also listen for permission changes (when user clicks Allow in permission dialog)
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => handleUserLocationDetected(pos.coords.latitude, pos.coords.longitude),
            () => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      };
    }).catch(() => {});
  }

  // Manual GPS Button
  const btnGeolocate = document.getElementById("btnGeolocateMe");
  if (btnGeolocate) {
    btnGeolocate.addEventListener("click", () => {
      if ("geolocation" in navigator) {
        if (window.showToast) window.showToast("Requesting device GPS coordinates...", "info", "🛰️");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            handleUserLocationDetected(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            if (window.showToast) window.showToast("Permission denied or GPS unavailable. Please enable browser location permissions.", "warning", "⚠");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }

  // 4 Cities Filter Pills
  document.querySelectorAll(".city-pill-btn").forEach((pill) => {
    pill.addEventListener("click", function () {
      document.querySelectorAll(".city-pill-btn").forEach((p) => p.classList.remove("active"));
      this.classList.add("active");
      currentCity = this.getAttribute("data-city");

      showWorstCase = (currentCity === "WorstCase");

      if (CITY_CENTERS[currentCity]) {
        mapInstance.setView([CITY_CENTERS[currentCity].lat, CITY_CENTERS[currentCity].lng], CITY_CENTERS[currentCity].zoom);
      }

      updateMapMarkers();
      renderSidebarList();
    });
  });

  // Search Input
  const searchInput = document.getElementById("mapSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = this.value;
      updateMapMarkers();
      renderSidebarList();
    });
  }

  // Type Filter
  const typeFilter = document.getElementById("mapTypeFilter");
  if (typeFilter) {
    typeFilter.addEventListener("change", function () {
      currentType = this.value;
      updateMapMarkers();
      renderSidebarList();
    });
  }

  // Specialty Filter
  const specFilter = document.getElementById("mapSpecialtyFilter");
  if (specFilter) {
    specFilter.addEventListener("change", function () {
      currentSpecialty = this.value;
      updateMapMarkers();
      renderSidebarList();
    });
  }

  // Cardio Suggestion Button
  const btnCardio = document.getElementById("btnCardioSuggest");
  if (btnCardio) {
    btnCardio.addEventListener("click", suggestBestCardioHospital);
  }

  // Setup Modals and Google Maps Embed controls
  setupTransferModal();
  initGoogleMapsEmbedAndControls();

  // Initial Render
  updateMapMarkers();
  updateRouteAndDistanceDisplay();
  renderSidebarList();
});
