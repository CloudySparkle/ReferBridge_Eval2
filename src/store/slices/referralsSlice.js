import { createSlice } from '@reduxjs/toolkit';

const getInitialRequests = () => {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem('referbridge_requests') || 'null');
  } catch (e) {
    stored = null;
  }

  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  return [
    {
      id: "REQ-101",
      patientId: "PT-2291",
      patientName: "Paramjit Singh",
      age: 54,
      specialty: "Cardiology",
      condition: "Acute Myocardial Infarction (Severe ST-Elevation)",
      history: "Hypertension, Prior Stent, Type 2 Diabetes",
      urgency: "Critical",
      hospital: "Lotus Care Hospital",
      originCity: "Chandigarh",
      time: "09:12 AM",
      status: "Accepted",
      notes: "Direct CCU admission pre-cleared."
    },
    {
      id: "REQ-102",
      patientId: "PT-2292",
      patientName: "Sunita Verma",
      age: 29,
      specialty: "Orthopedics",
      condition: "Compound Femur Fracture with Vascular Impingement",
      history: "Highway accident, no prior surgeries",
      urgency: "High",
      hospital: "Sunrise Multispecialty",
      originCity: "Mohali",
      time: "09:47 AM",
      status: "Rejected",
      notes: "Orthopedic OT fully booked for next 6 hours."
    },
    {
      id: "REQ-103",
      patientId: "PT-2293",
      patientName: "Harbans Lal",
      age: 67,
      specialty: "Cardiology",
      condition: "Acute Coronary Syndrome & Cardiogenic Shock",
      history: "Chronic Kidney Disease, Atrial Fibrillation",
      urgency: "Critical",
      hospital: "Green Valley Hospital",
      originCity: "Panchkula",
      time: "10:05 AM",
      status: "Pending",
      notes: "Need immediate cath lab & ventilator bed."
    },
    {
      id: "REQ-104",
      patientId: "PT-2294",
      patientName: "Baby Ananya",
      age: 8,
      specialty: "Pediatrics",
      condition: "Severe Bronchiolitis with Respiratory Distress",
      history: "Asthmatic diathesis",
      urgency: "Moderate",
      hospital: "City Care Clinic",
      originCity: "Chandigarh",
      time: "10:32 AM",
      status: "Pending",
      notes: "Requires pediatric high-flow oxygen."
    },
    {
      id: "REQ-105",
      patientId: "PT-2295",
      patientName: "Gurpreet K.",
      age: 41,
      specialty: "General Surgery",
      condition: "Perforated Appendicitis with Peritonitis",
      history: "No known drug allergies",
      urgency: "High",
      hospital: "Riverside Hospital",
      originCity: "Zirakpur",
      time: "11:15 AM",
      status: "Pending",
      notes: "Emergency laparotomy indicated."
    }
  ];
};

const initialState = {
  requests: getInitialRequests(),
  filterStatus: "All",
  filterUrgency: "All",
  searchQuery: "",
  selectedRequest: null,
  rerouteModalOpen: false,
  targetRequestForReroute: null
};

export const referralsSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterUrgency: (state, action) => {
      state.filterUrgency = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    openRerouteModal: (state, action) => {
      state.rerouteModalOpen = true;
      state.targetRequestForReroute = action.payload;
    },
    closeRerouteModal: (state) => {
      state.rerouteModalOpen = false;
      state.targetRequestForReroute = null;
    },
    acceptReferral: (state, action) => {
      const id = action.payload;
      const target = state.requests.find(r => r.id === id);
      if (target) {
        target.status = 'Accepted';
        localStorage.setItem('referbridge_requests', JSON.stringify(state.requests));
      }
    },
    denyAndRerouteReferral: (state, action) => {
      const { id, destinationHospital, reason, handoffNotes } = action.payload;
      const target = state.requests.find(r => r.id === id);
      if (target) {
        target.status = `Rerouted to ${destinationHospital.name}`;
        target.reroutedTo = destinationHospital.name;
        target.reroutedHospitalId = destinationHospital.id;
        target.reroutedReason = reason || "Local facility at capacity / Beds full";
        target.reroutedNotes = handoffNotes || "";
        target.reroutedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem('referbridge_requests', JSON.stringify(state.requests));
      }
      state.rerouteModalOpen = false;
      state.targetRequestForReroute = null;
    },
    rejectReferralDirectly: (state, action) => {
      const { id, reason } = action.payload;
      const target = state.requests.find(r => r.id === id);
      if (target) {
        target.status = 'Rejected';
        target.rejectionReason = reason || 'Facility unable to accept transfer';
        localStorage.setItem('referbridge_requests', JSON.stringify(state.requests));
      }
      state.rerouteModalOpen = false;
      state.targetRequestForReroute = null;
    },
    addReferral: (state, action) => {
      state.requests.unshift(action.payload);
      localStorage.setItem('referbridge_requests', JSON.stringify(state.requests));
    }
  }
});

export const {
  setFilterStatus,
  setFilterUrgency,
  setSearchQuery,
  setSelectedRequest,
  openRerouteModal,
  closeRerouteModal,
  acceptReferral,
  denyAndRerouteReferral,
  rejectReferralDirectly,
  addReferral
} = referralsSlice.actions;

export default referralsSlice.reducer;
