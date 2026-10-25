import { createSlice } from '@reduxjs/toolkit';

const CITY_COORDINATES = {
  "All": { lat: 30.7333, lng: 76.7794, zoom: 11 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "Mohali": { lat: 30.7046, lng: 76.7179, zoom: 13 },
  "Panchkula": { lat: 30.6942, lng: 76.8606, zoom: 13 },
  "Zirakpur": { lat: 30.6425, lng: 76.8173, zoom: 13 },
  "Delhi NCR": { lat: 28.6139, lng: 77.2090, zoom: 11 }
};

const initialState = {
  activeCity: "All",
  centerCoords: [30.7333, 76.7794],
  zoom: 11,
  selectedHospitalId: null,
  patientOrigin: {
    name: "Sector 17 City Center, Chandigarh",
    lat: 30.7410,
    lng: 76.7820
  },
  destinationHospital: null,
  routeStats: {
    distanceKm: null,
    durationMins: null,
    corridorName: ""
  },
  mapFilterSpecialty: "All",
  mapFilterCategory: "All" // "All", "Government", "Private"
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setActiveCity: (state, action) => {
      const city = action.payload;
      state.activeCity = city;
      if (CITY_COORDINATES[city]) {
        state.centerCoords = [CITY_COORDINATES[city].lat, CITY_COORDINATES[city].lng];
        state.zoom = CITY_COORDINATES[city].zoom;
      }
    },
    setSelectedHospitalPin: (state, action) => {
      state.selectedHospitalId = action.payload;
    },
    setPatientOrigin: (state, action) => {
      state.patientOrigin = action.payload;
    },
    setDestinationHospital: (state, action) => {
      state.destinationHospital = action.payload;
    },
    calculateRouteStats: (state, action) => {
      const { origin, destination } = action.payload;
      if (origin && destination) {
        // Haversine formula calculation
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(destination.latitude - origin.lat);
        const dLon = toRad(destination.longitude - origin.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(origin.lat)) *
            Math.cos(toRad(destination.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const directDist = R * c;
        // Urban road winding factor (~1.25x)
        const roadDist = Math.max(Number((directDist * 1.25).toFixed(1)), 1.2);
        // Urban ambulance transit time estimation (~35 km/h + 3 min overhead)
        const travelMins = Math.max(Math.round((roadDist / 35) * 60) + 3, 5);

        state.routeStats = {
          distanceKm: roadDist,
          durationMins: travelMins,
          corridorName: `${origin.name || "Patient Location"} ➔ ${destination.name}`
        };
      }
    },
    setMapFilterSpecialty: (state, action) => {
      state.mapFilterSpecialty = action.payload;
    },
    setMapFilterCategory: (state, action) => {
      state.mapFilterCategory = action.payload;
    }
  }
});

export const {
  setActiveCity,
  setSelectedHospitalPin,
  setPatientOrigin,
  setDestinationHospital,
  calculateRouteStats,
  setMapFilterSpecialty,
  setMapFilterCategory
} = mapSlice.actions;

export default mapSlice.reducer;
