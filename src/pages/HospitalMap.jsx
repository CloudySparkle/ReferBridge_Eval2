import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Topbar from '../components/layout/Topbar';
import {
  setActiveCity,
  setSelectedHospitalPin,
  setPatientOrigin,
  setDestinationHospital,
  calculateRouteStats,
  setMapFilterSpecialty,
  setMapFilterCategory
} from '../store/slices/mapSlice';
import { useToast } from '../context/ToastContext';

export default function HospitalMap() {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const hospitals = useSelector((state) => state.hospitals.hospitals);
  const activeCity = useSelector((state) => state.map.activeCity);
  const patientOrigin = useSelector((state) => state.map.patientOrigin);
  const destinationHospital = useSelector((state) => state.map.destinationHospital);
  const routeStats = useSelector((state) => state.map.routeStats);
  const mapFilterSpecialty = useSelector((state) => state.map.mapFilterSpecialty);
  const mapFilterCategory = useSelector((state) => state.map.mapFilterCategory);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchCity = activeCity === 'All' || h.city === activeCity;
      const matchCategory = mapFilterCategory === 'All' || h.category === mapFilterCategory;
      const matchSpecialty =
        mapFilterSpecialty === 'All' ||
        h.specialties.some((s) =>
          s.toLowerCase().includes(mapFilterSpecialty.toLowerCase())
        );
      const matchQuery =
        !searchQuery ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCity && matchCategory && matchSpecialty && matchQuery;
    });
  }, [hospitals, activeCity, mapFilterCategory, mapFilterSpecialty, searchQuery]);

  // Load Leaflet dynamically if not loaded
  useEffect(() => {
    let isMounted = true;

    const loadLeafletAssets = async () => {
      // Check if Leaflet CSS already in head
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Check if L is loaded
      if (typeof window.L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          if (isMounted) setMapLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        if (isMounted) setMapLoaded(true);
      }
    };

    loadLeafletAssets();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || leafletMapRef.current) return;

    const L = window.L;
    if (!L) return;

    // Center on Chandigarh region by default
    const map = L.map(mapContainerRef.current, {
      center: [30.7333, 76.7794],
      zoom: 12,
      zoomControl: true
    });

    // OpenStreetMap free tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | ReferBridge Healthcare Network'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    leafletMapRef.current = map;

    // Click on map to relocate patient
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      dispatch(
        setPatientOrigin({
          name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng
        })
      );
      showToast(`Patient pickup location updated!`, 'info', '📍');
    });
  }, [mapLoaded, dispatch, showToast]);

  // Update Markers and View when filters or activeCity changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const L = window.L;
    if (!map || !L || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Add Patient Marker
    if (patientOrigin) {
      const patientIcon = L.divIcon({
        className: 'patient-custom-pin',
        html: `
          <div style="background:#ff3366; width:34px; height:34px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 16px rgba(255,51,102,0.8); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            🚨
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const pMarker = L.marker([patientOrigin.lat, patientOrigin.lng], {
        icon: patientIcon
      }).addTo(markersLayerRef.current);

      pMarker.bindPopup(`
        <div style="font-family:sans-serif; min-width:180px;">
          <b style="color:#ff3366;">🚨 Patient Emergency Origin</b>
          <p style="margin:4px 0 0; font-size:12px; color:#555;">${patientOrigin.name}</p>
        </div>
      `);
    }

    // Add Hospital Markers
    const bounds = [];
    if (patientOrigin) bounds.push([patientOrigin.lat, patientOrigin.lng]);

    filteredHospitals.forEach((h) => {
      const isGovt = h.category === 'Government' || h.type === 'Govt';
      const isFull = h.status === 'Full';
      const isAvailable = h.status === 'Available';
      
      const pinColor = isFull ? '#ef4444' : isAvailable ? '#10b981' : '#f59e0b';
      const badgeText = isGovt ? 'GOVT' : 'PVT';
      const badgeBg = isGovt ? '#0284c7' : '#8b5cf6';

      const customIcon = L.divIcon({
        className: 'hospital-map-pin',
        html: `
          <div style="position:relative; width:38px; height:38px; background:${pinColor}; border:2.5px solid #fff; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 14px rgba(0,0,0,0.35); transform:rotate(-45deg);">
            <div style="transform:rotate(45deg); font-size:18px; color:#fff; font-weight:800;">🏥</div>
            <span style="position:absolute; top:-9px; right:-9px; background:${badgeBg}; color:#fff; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; transform:rotate(45deg); box-shadow:0 2px 4px rgba(0,0,0,0.4);">${badgeText}</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: customIcon }).addTo(
        markersLayerRef.current
      );

      bounds.push([h.latitude, h.longitude]);

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Inter, sans-serif';
      popupContent.style.minWidth = '240px';
      popupContent.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-size:10px; font-weight:800; color:${badgeBg}; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px;">${h.category.toUpperCase()}</span>
          <span style="font-size:11px; font-weight:700; color:${pinColor};">${h.status.toUpperCase()}</span>
        </div>
        <h4 style="margin:2px 0 6px; font-size:14px; font-weight:700; color:#0f172a;">${h.name}</h4>
        <p style="margin:0 0 6px; font-size:12px; color:#64748b;">📍 ${h.location} (${h.city})</p>
        
        <div style="display:flex; gap:8px; margin-bottom:8px; background:#f1f5f9; padding:6px 8px; border-radius:6px; font-size:11px;">
          <div><b>Beds:</b> ${h.availableBeds}/${h.totalBeds}</div>
          <div><b>ICU:</b> <span style="color:#0284c7; font-weight:700;">${h.icuAvailable}</span></div>
          <div><b>Tel:</b> ${h.phone}</div>
        </div>

        <div style="font-size:11px; color:#475569; margin-bottom:8px;">
          <b>Specialties:</b> ${h.specialties.slice(0, 3).join(', ')}
        </div>

        <button id="btnSetDest-${h.id}" style="width:100%; padding:6px 10px; background:#0ea5e9; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
          ➔ Calculate Route & Distance
        </button>
      `;

      popupContent.querySelector(`#btnSetDest-${h.id}`).addEventListener('click', () => {
        handleSelectDestination(h);
      });

      marker.bindPopup(popupContent);
    });

    // Auto-fit bounds if hospitals exist
    if (bounds.length > 0) {
      if (activeCity === 'All') {
        map.setView([30.7333, 76.7794], 11);
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [filteredHospitals, patientOrigin, activeCity]);

  // Handle Route drawing when destinationHospital changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const L = window.L;
    if (!map || !L || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (patientOrigin && destinationHospital) {
      const latlngs = [
        [patientOrigin.lat, patientOrigin.lng],
        [destinationHospital.latitude, destinationHospital.longitude]
      ];

      // Draw glowing ambulance route polyline
      const polyline = L.polyline(latlngs, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.85,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(routeLayerRef.current);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [patientOrigin, destinationHospital]);

  const handleSelectDestination = (hospital) => {
    dispatch(setDestinationHospital(hospital));
    dispatch(
      calculateRouteStats({
        origin: patientOrigin,
        destination: hospital
      })
    );
    showToast(
      `Route calculated to ${hospital.name}: ~${hospital.distanceKm} km`,
      'success',
      '🚗'
    );
  };

  // Suggest best cardio hospital
  const handleSuggestCardioHospital = () => {
    dispatch(setMapFilterSpecialty('Cardiology'));

    // Filter cardio with ICU > 0
    const cardioHospitals = hospitals.filter(
      (h) =>
        h.specialties.some((s) => s.toLowerCase().includes('cardio')) &&
        (h.icuAvailable > 0 || h.availableBeds > 0)
    );

    if (cardioHospitals.length > 0) {
      // Sort by available ICU beds or closest
      cardioHospitals.sort((a, b) => b.icuAvailable - a.icuAvailable || a.distanceKm - b.distanceKm);
      const best = cardioHospitals[0];
      handleSelectDestination(best);
      showToast(
        `Cardio Emergency Match: ${best.name} (${best.icuAvailable} ICU beds open)`,
        'success',
        '❤️'
      );
    } else {
      showToast('No immediate cardio capacity open in selected filter', 'warning', '⚠');
    }
  };

  return (
    <>
      <Topbar
        eyebrow="EMERGENCY GEOSPATIAL MATRIX"
        title="Live Hospital Map & Route Suggestion"
        rightContent={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleSuggestCardioHospital}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
              }}
            >
              <span>❤️</span>
              <span>Find Best Cardio Hospital</span>
            </button>
          </div>
        }
      />

      <div style={{ padding: '0 28px 28px' }}>
        {/* City Filter Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rb-text-muted)' }}>
            SELECT REGION / CITY:
          </span>
          {['All', 'Chandigarh', 'Mohali', 'Panchkula', 'Zirakpur', 'Delhi NCR'].map(
            (city) => (
              <button
                key={city}
                type="button"
                onClick={() => dispatch(setActiveCity(city))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor:
                    activeCity === city ? 'var(--rb-cyan, #22c8ff)' : 'var(--rb-border, #1e3a5f)',
                  background:
                    activeCity === city
                      ? 'rgba(34, 200, 255, 0.18)'
                      : 'var(--rb-panel-solid, #0a2133)',
                  color: activeCity === city ? 'var(--rb-cyan, #22c8ff)' : 'var(--rb-text-muted, #94a3b8)'
                }}
              >
                {city === 'All' ? '🌟 All Cities' : city}
              </button>
            )
          )}
        </div>

        {/* Secondary Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 16,
            background: 'var(--rb-panel-solid, #0a2133)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--rb-border, #1e3a5f)'
          }}
        >
          <input
            type="text"
            placeholder="Search hospital name, location, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--rb-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--rb-text-main, #fff)',
              fontSize: 13
            }}
          />

          <select
            value={mapFilterCategory}
            onChange={(e) => dispatch(setMapFilterCategory(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--rb-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--rb-text-main, #fff)',
              fontSize: 13
            }}
          >
            <option value="All">All Facility Types (Govt & Private)</option>
            <option value="Government">🏛️ Government Hospitals Only</option>
            <option value="Private">🏥 Private Hospitals</option>
          </select>

          <select
            value={mapFilterSpecialty}
            onChange={(e) => dispatch(setMapFilterSpecialty(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--rb-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--rb-text-main, #fff)',
              fontSize: 13
            }}
          >
            <option value="All">All Medical Specialties</option>
            <option value="Cardiology">❤️ Cardiology & Heart Emergency</option>
            <option value="Trauma">🚨 Trauma & Critical Care</option>
            <option value="Neurology">🧠 Neurology & Stroke Unit</option>
            <option value="Pediatrics">👶 Pediatrics</option>
            <option value="Burn Unit">🔥 Burn Unit</option>
          </select>
        </div>

        {/* Map and Route Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          {/* Main Leaflet Map Viewport */}
          <div
            style={{
              position: 'relative',
              height: 580,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--rb-border, #1e3a5f)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
            }}
          >
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Floating Map Legend */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 1000,
                background: 'rgba(6, 24, 38, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--rb-border, #1e3a5f)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 11,
                color: 'var(--rb-text-main, #fff)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <span>Available Beds</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <span>Limited Capacity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span>Ward/ICU Full</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#0284c7', padding: '1px 4px', borderRadius: 3, fontSize: 9, fontWeight: 800 }}>GOVT</span>
                <span>Government Facility</span>
              </div>
            </div>
          </div>

          {/* Route Distance Suggester & Facility List Sidebar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              height: 580,
              overflowY: 'auto'
            }}
          >
            {/* Transit Route Estimator Box */}
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border, #1e3a5f)'
              }}
            >
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--rb-cyan, #22c8ff)' }}>
                🚑 Transit & Distance Estimator
              </h4>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--rb-text-muted)' }}>
                Calculates real-world road transit corridors using Haversine & urban telemetry factors.
              </p>

              {routeStats.distanceKm ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(34,200,255,0.08)',
                    border: '1px solid rgba(34,200,255,0.25)'
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>Target Corridor</div>
                  <strong style={{ display: 'block', fontSize: 13, color: 'var(--rb-text-main)', margin: '2px 0 8px' }}>
                    {destinationHospital?.name}
                  </strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--rb-border)', paddingTop: 8 }}>
                    <div>
                      <small style={{ color: 'var(--rb-text-muted)', fontSize: 11 }}>Est Distance</small>
                      <b style={{ display: 'block', fontSize: 16, color: 'var(--rb-teal, #14e4b8)' }}>
                        {routeStats.distanceKm} km
                      </b>
                    </div>
                    <div>
                      <small style={{ color: 'var(--rb-text-muted)', fontSize: 11 }}>Ambulance ETA</small>
                      <b style={{ display: 'block', fontSize: 16, color: 'var(--rb-cyan, #22c8ff)' }}>
                        ~{routeStats.durationMins} mins
                      </b>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 10, textAlign: 'center', background: 'rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--rb-text-muted)' }}>
                  Click any hospital marker on the map to estimate route & driving distance.
                </div>
              )}
            </div>

            {/* List of Hospitals in Scope */}
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border, #1e3a5f)',
                flex: 1,
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rb-text-muted)' }}>
                  HOSPITALS ({filteredHospitals.length})
                </span>
                <span style={{ fontSize: 11, color: 'var(--rb-teal)' }}>
                  {filteredHospitals.filter((h) => h.category === 'Government').length} Govt
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredHospitals.map((h) => {
                  const isSelected = destinationHospital?.id === h.id;
                  const isGovt = h.category === 'Government';
                  return (
                    <div
                      key={h.id}
                      onClick={() => handleSelectDestination(h)}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isSelected
                          ? 'rgba(34, 200, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '1px solid var(--rb-cyan)'
                          : '1px solid var(--rb-border)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                          {h.name}
                        </span>
                        {isGovt && (
                          <span style={{ fontSize: 9, fontWeight: 800, background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>
                            GOVT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--rb-text-muted)', margin: '3px 0' }}>
                        📍 {h.city} · {h.distanceKm} km
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: h.availableBeds > 0 ? 'var(--rb-green)' : 'var(--rb-red)' }}>
                          Beds: {h.availableBeds}/{h.totalBeds}
                        </span>
                        <span style={{ color: h.icuAvailable > 0 ? 'var(--rb-cyan)' : 'var(--rb-red)' }}>
                          ICU: {h.icuAvailable}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
