import { createSlice } from '@reduxjs/toolkit';

export const INITIAL_HOSPITALS = [
  // ── CHANDIGARH — GOVERNMENT ──────────────────────────────────────────────
  {
    id: "H1",
    name: "PGIMER (Post Graduate Institute of Medical Education and Research)",
    category: "Government",
    type: "Govt",
    city: "Chandigarh",
    location: "Sector 12, Chandigarh",
    address: "Sector 12, Chandigarh - 160012",
    latitude: 30.7673,
    longitude: 76.7770,
    distanceKm: 1.5,
    phone: "0172-2746018",
    specialties: ["Cardiology", "Trauma Center", "Neurology", "ICU", "Research", "Organ Transplant"],
    totalBeds: 1900,
    availableBeds: 14,
    icuAvailable: 2,
    emergencyServices: true,
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
    distanceKm: 4.2,
    phone: "0172-2601023",
    specialties: ["Cardiology", "General Surgery", "Emergency Medicine", "Burn Unit", "Trauma", "ICU"],
    totalBeds: 900,
    availableBeds: 45,
    icuAvailable: 4,
    emergencyServices: true,
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
    distanceKm: 2.8,
    phone: "0172-2700491",
    specialties: ["Emergency Care", "Cardiology", "General Medicine", "Paediatrics", "ICU"],
    totalBeds: 500,
    availableBeds: 32,
    icuAvailable: 5,
    emergencyServices: true,
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
    distanceKm: 1.6,
    phone: "0172-2746018",
    specialties: ["Cardiology", "Cardiothoracic Surgery", "Advanced ICU", "Neurosurgery"],
    totalBeds: 800,
    availableBeds: 18,
    icuAvailable: 6,
    emergencyServices: true,
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
    distanceKm: 6.2,
    phone: "0172-2228010",
    specialties: ["Emergency Medicine", "General Medicine", "Cardiology", "Maternity", "ICU"],
    totalBeds: 300,
    availableBeds: 28,
    icuAvailable: 3,
    emergencyServices: true,
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
    distanceKm: 6.0,
    phone: "0172-5095001",
    specialties: ["Trauma", "General Surgery", "Cardiology", "Critical Care", "ICU"],
    totalBeds: 350,
    availableBeds: 36,
    icuAvailable: 4,
    emergencyServices: true,
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
    distanceKm: 7.1,
    phone: "0172-2224500",
    specialties: ["General Medicine", "Cardiology Screening", "Trauma First Aid", "ICU"],
    totalBeds: 120,
    availableBeds: 19,
    icuAvailable: 2,
    emergencyServices: true,
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
    distanceKm: 8.5,
    phone: "0172-2560073",
    specialties: ["Emergency", "Trauma Center", "Cardiology", "Surgery", "ICU"],
    totalBeds: 300,
    availableBeds: 24,
    icuAvailable: 3,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H9",
    name: "ESIC Model Hospital Panchkula",
    category: "Government",
    type: "Govt",
    city: "Panchkula",
    location: "Sector 21 / Ind Area, Panchkula",
    address: "Plot 1, Industrial Area Phase-1, Panchkula - 134113",
    latitude: 30.6720,
    longitude: 76.8620,
    distanceKm: 10.2,
    phone: "0172-2590001",
    specialties: ["General Medicine", "Occupational Health", "Cardiology", "ICU"],
    totalBeds: 150,
    availableBeds: 22,
    icuAvailable: 3,
    emergencyServices: true,
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
    distanceKm: 11.4,
    phone: "0172-2240090",
    specialties: ["Emergency First Aid", "General Medicine", "Cardiology Stabilization", "Trauma"],
    totalBeds: 100,
    availableBeds: 18,
    icuAvailable: 2,
    emergencyServices: true,
    status: "Available"
  },

  // ── NATIONAL GOVERNMENT CARDIOLOGY & APEX HUBS ───────────────────────────
  {
    id: "H11",
    name: "AIIMS New Delhi (All India Institute of Medical Sciences)",
    category: "Government",
    type: "Govt",
    city: "Delhi NCR",
    location: "Ansari Nagar, New Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
    latitude: 28.5672,
    longitude: 77.2100,
    distanceKm: 245.0,
    phone: "011-26588500",
    specialties: ["Cardiology", "CTVS", "Trauma Center", "Critical Care ICU", "Organ Transplant", "Advanced Research"],
    totalBeds: 2500,
    availableBeds: 42,
    icuAvailable: 12,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H12",
    name: "Safdarjung Hospital & VMMC (Apex Emergency & Burns)",
    category: "Government",
    type: "Govt",
    city: "Delhi NCR",
    location: "Ring Road, New Delhi",
    address: "Ring Road, Opposite AIIMS, New Delhi - 110029",
    latitude: 28.5700,
    longitude: 77.2075,
    distanceKm: 246.0,
    phone: "011-26165060",
    specialties: ["Cardiology", "Emergency Medicine", "Burn & Trauma Center", "Surgery", "ICU"],
    totalBeds: 1800,
    availableBeds: 35,
    icuAvailable: 8,
    emergencyServices: true,
    status: "Available"
  },
  // ── PRIVATE / PARTNER HOSPITALS (PREMIER CARDIAC & SPECIALTY) ───────────
  {
    id: "H15",
    name: "Fortis Escorts Heart Institute",
    category: "Private",
    type: "Private",
    city: "Delhi NCR",
    location: "Okhla Road, New Delhi",
    address: "Okhla Road, Sukhdev Vihar Metro Station, New Delhi - 110025",
    latitude: 28.5603,
    longitude: 77.2844,
    distanceKm: 252.0,
    phone: "011-47135000",
    specialties: ["Cardiology", "Cardiac Surgery", "Electrophysiology", "Pediatric Cardiac ICU", "Heart Transplant"],
    totalBeds: 310,
    availableBeds: 29,
    icuAvailable: 14,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H16",
    name: "Lotus Care Hospital",
    category: "Private",
    type: "Private",
    city: "Chandigarh",
    location: "Sector 22, Chandigarh",
    address: "Sector 22-C, Chandigarh - 160022",
    latitude: 30.7320,
    longitude: 76.7650,
    distanceKm: 3.2,
    phone: "+91 98141 12345",
    specialties: ["Cardiology", "Orthopedics", "Emergency Care", "Critical Care ICU"],
    totalBeds: 180,
    availableBeds: 24,
    icuAvailable: 6,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H17",
    name: "Fortis Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Sector 62, Mohali",
    address: "Sector 62, Phase VIII, Mohali - 160062",
    latitude: 30.7012,
    longitude: 76.7342,
    distanceKm: 5.8,
    phone: "0172-4692222",
    specialties: ["Cardiology", "Oncology", "Neurosciences", "Orthopaedics", "Emergency Care", "ICU"],
    totalBeds: 262,
    availableBeds: 24,
    icuAvailable: 6,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H18",
    name: "Max Super Speciality Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Phase 6, Mohali",
    address: "Near Civil Hospital, Phase 6, Mohali - 160055",
    latitude: 30.7145,
    longitude: 76.7180,
    distanceKm: 6.4,
    phone: "0172-6652000",
    specialties: ["Cardiology", "Cancer Care", "Neurology", "Renal Sciences", "Advanced ICU"],
    totalBeds: 200,
    availableBeds: 19,
    icuAvailable: 4,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H19",
    name: "Alchemist Hospital Panchkula",
    category: "Private",
    type: "Private",
    city: "Panchkula",
    location: "Sector 21, Panchkula",
    address: "Sector 21, Panchkula, Haryana - 134112",
    latitude: 30.6865,
    longitude: 76.8530,
    distanceKm: 9.1,
    phone: "+91 172-5095001",
    specialties: ["Cardiology", "Neurology", "Vascular Surgery", "Orthopaedics", "ICU"],
    totalBeds: 250,
    availableBeds: 12,
    icuAvailable: 3,
    emergencyServices: true,
    status: "Limited"
  },
  {
    id: "H20",
    name: "Sunrise Multispecialty Hospital",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Phase 7, Mohali",
    address: "Phase 7, SAS Nagar, Mohali - 160062",
    latitude: 30.7180,
    longitude: 76.7280,
    distanceKm: 6.8,
    phone: "+91 98722 54321",
    specialties: ["Pediatrics", "Trauma", "General Surgery", "Cardiology"],
    totalBeds: 140,
    availableBeds: 8,
    icuAvailable: 2,
    emergencyServices: true,
    status: "Limited"
  },
  {
    id: "H21",
    name: "Green Valley Hospital",
    category: "Private",
    type: "Private",
    city: "Panchkula",
    location: "Sector 11, Panchkula",
    address: "Sector 11, Panchkula - 134109",
    latitude: 30.6860,
    longitude: 76.8450,
    distanceKm: 9.4,
    phone: "+91 98888 11223",
    specialties: ["Neurology", "Cardiology", "Stroke Center"],
    totalBeds: 90,
    availableBeds: 0,
    icuAvailable: 0,
    emergencyServices: true,
    status: "Full"
  },
  {
    id: "H22",
    name: "Riverside Hospital & Trauma Centre",
    category: "Private",
    type: "Private",
    city: "Zirakpur",
    location: "Zirakpur Bypass, NH-22",
    address: "VIP Road, Zirakpur - 140603",
    latitude: 30.6425,
    longitude: 76.8180,
    distanceKm: 12.1,
    phone: "+91 99150 99887",
    specialties: ["Trauma", "Orthopedics", "Critical Care", "Cardiology"],
    totalBeds: 210,
    availableBeds: 38,
    icuAvailable: 9,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H23",
    name: "Om Research Centre",
    category: "Private",
    type: "Private",
    city: "Chandigarh",
    location: "Sector 34, Chandigarh",
    address: "SCO 18-19, Sector 34-A, Chandigarh",
    latitude: 30.7225,
    longitude: 76.7680,
    distanceKm: 4.5,
    phone: "+91 98155 33445",
    specialties: ["Nephrology", "Oncology", "Cardiology", "ICU"],
    totalBeds: 160,
    availableBeds: 19,
    icuAvailable: 4,
    emergencyServices: true,
    status: "Available"
  },
  {
    id: "H24",
    name: "Ivy Hospital Mohali",
    category: "Private",
    type: "Private",
    city: "Mohali",
    location: "Sector 71, Mohali",
    address: "Sector 71, Mohali - 160071",
    latitude: 30.6936,
    longitude: 76.7217,
    distanceKm: 7.8,
    phone: "0172-5200000",
    specialties: ["Cardiac Surgery", "Neurosurgery", "Orthopaedics", "ICU", "Dialysis"],
    totalBeds: 200,
    availableBeds: 15,
    icuAvailable: 5,
    emergencyServices: true,
    status: "Available"
  }
];

const initialState = {
  hospitals: INITIAL_HOSPITALS,
  selectedHospital: null,
  activeCity: "All",
  activeCategory: "All",
  activeSpecialty: "All",
  searchQuery: "",
  loading: false,
  error: null
};

export const hospitalsSlice = createSlice({
  name: 'hospitals',
  initialState,
  reducers: {
    setHospitals: (state, action) => {
      state.hospitals = action.payload;
    },
    selectHospital: (state, action) => {
      state.selectedHospital = action.payload;
    },
    setCityFilter: (state, action) => {
      state.activeCity = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSpecialtyFilter: (state, action) => {
      state.activeSpecialty = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    updateHospitalBeds: (state, action) => {
      const { id, availableBeds, icuAvailable } = action.payload;
      const target = state.hospitals.find(h => h.id === id);
      if (target) {
        if (availableBeds !== undefined) target.availableBeds = availableBeds;
        if (icuAvailable !== undefined) target.icuAvailable = icuAvailable;
        if (target.availableBeds === 0 && target.icuAvailable === 0) {
          target.status = 'Full';
        } else if (target.availableBeds < 10) {
          target.status = 'Limited';
        } else {
          target.status = 'Available';
        }
      }
    }
  }
});

export const {
  setHospitals,
  selectHospital,
  setCityFilter,
  setCategoryFilter,
  setSpecialtyFilter,
  setSearchQuery,
  updateHospitalBeds
} = hospitalsSlice.actions;

export default hospitalsSlice.reducer;
