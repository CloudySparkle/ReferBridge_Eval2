import React, { useState, useEffect, useMemo, useRef } from 'react';
import Topbar from '../components/layout/Topbar';
import { hospitalService } from '../services/hospitalService';
import {
  loadGoogleMaps,
  calculateRoute,
  isGoogleMapsConfigured,
  calculateHaversineDistanceKm
} from '../services/mapsService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function HospitalNetwork() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    category: 'Private',
    city: 'Chandigarh',
    district: '',
    address: '',
    phone: '',
    website: '',
    specialties: '',
    total_beds: 100,
    available_beds: 20,
    icu_beds_available: 4,
    emergency_services: false,
    latitude: 30.7333,
    longitude: 76.7794
  });

  // Map & Route Planning State
  const [originHospitalId, setOriginHospitalId] = useState('');
  const [destHospitalId, setDestHospitalId] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Hospitals
  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hospitalService.getHospitals();
      setHospitals(data);
      if (data.length > 0 && !originHospitalId) {
        setOriginHospitalId(data[0].id);
        if (data.length > 1) setDestHospitalId(data[1].id);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Unable to load hospital records. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Initialize Google Maps if configured
  useEffect(() => {
    if (!isGoogleMapsConfigured) return;

    loadGoogleMaps()
      .then((googleMaps) => {
        setGoogleMapsReady(true);
        if (mapRef.current && !googleMapInstance.current) {
          googleMapInstance.current = new googleMaps.Map(mapRef.current, {
            center: { lat: 30.7333, lng: 76.7794 }, // Chandigarh region center
            zoom: 12,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
            ]
          });

          directionsRendererRef.current = new googleMaps.DirectionsRenderer({
            map: googleMapInstance.current,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#14e4b8',
              strokeWeight: 5
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Google Maps initialization skipped:', err.message);
      });
  }, []);

  // Update map markers when filteredHospitals change
  useEffect(() => {
    if (!googleMapsReady || !googleMapInstance.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredHospitals.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      const isGov = h.category === 'Government';
      const isAvailable = (h.available_beds || 0) > 0;

      // Government hospitals use a square/diamond symbol with teal color; Private use circle with cyan/amber
      const marker = new window.google.maps.Marker({
        position: { lat: Number(h.latitude), lng: Number(h.longitude) },
        map: googleMapInstance.current,
        title: `${h.name} (${h.category || 'Hospital'})`,
        icon: {
          path: isGov ? window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW : window.google.maps.SymbolPath.CIRCLE,
          scale: isGov ? 7 : 8,
          fillColor: isGov ? (isAvailable ? '#14e4b8' : '#0d9488') : (isAvailable ? '#22c8ff' : '#f59e0b'),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: isGov ? 0 : 0
        }
      });

      const infoContent = `
        <div style="color:#061826; padding:8px; font-family:sans-serif; max-width:240px;">
          <div style="font-size:10px; font-weight:700; color:${isGov ? '#0d9488' : '#0284c7'}; text-transform:uppercase;">
            ${isGov ? '🏛 Government Facility' : '🏥 Private Facility'} · ${h.city || 'Tricity'}
          </div>
          <strong style="font-size:14px; display:block; margin:2px 0 4px;">${h.name}</strong>
          <span style="font-size:11px; color:#555; display:block; margin-bottom:6px;">${h.address}</span>
          <div style="padding:4px 6px; background:#f1f5f9; border-radius:4px; font-size:11px; margin-bottom:6px;">
            <b>Available:</b> <span style="color:${isAvailable ? '#16a34a' : '#dc2626'}; font-weight:700;">${h.available_beds} beds</span> · <b>ICU:</b> ${h.icu_beds_available}
            ${h.emergency_services ? ' · <span style="color:#dc2626; font-weight:700;">🆘 Emergency</span>' : ''}
          </div>
          <div style="font-size:11px; color:#475569;">
            <b>Specialties:</b> ${Array.isArray(h.specialties) ? h.specialties.join(', ') : (h.specialties || 'General')}
          </div>
          ${h.phone ? `<div style="font-size:11px; color:#0284c7; margin-top:4px;">📞 ${h.phone}</div>` : ''}
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', () => {
        infoWindow.open(googleMapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [filteredHospitals, googleMapsReady]);

  // Unique specialties for filter
  const allSpecialties = useMemo(() => {
    const set = new Set();
    hospitals.forEach((h) => {
      if (Array.isArray(h.specialties)) {
        h.specialties.forEach((s) => set.add(s));
      } else if (typeof h.specialties === 'string') {
        h.specialties.split(',').forEach((s) => set.add(s.trim()));
      }
    });
    return Array.from(set);
  }, [hospitals]);

  // Filtered and Sorted Hospitals
  const filteredHospitals = useMemo(() => {
    let list = [...hospitals];

    // City filter
    if (cityFilter !== 'all') {
      list = list.filter((h) => h.city === cityFilter);
    }

    // Category filter (Government / Private)
    if (categoryFilter !== 'all') {
      list = list.filter((h) => h.category === categoryFilter);
    }

    // Search query
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.address || '').toLowerCase().includes(q) ||
          (h.city || '').toLowerCase().includes(q) ||
          (Array.isArray(h.specialties) ? h.specialties.join(' ') : h.specialties || '').toLowerCase().includes(q)
      );
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      list = list.filter((h) => {
        if (Array.isArray(h.specialties)) {
          return h.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
        }
        return (h.specialties || '').toLowerCase().includes(specialtyFilter.toLowerCase());
      });
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      list = list.filter((h) => (h.available_beds || 0) > 0);
    } else if (availabilityFilter === 'icu') {
      list = list.filter((h) => (h.icu_beds_available || 0) > 0);
    } else if (availabilityFilter === 'emergency') {
      list = list.filter((h) => h.emergency_services === true);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'available_beds') {
        return (b.available_beds || 0) - (a.available_beds || 0);
      }
      if (sortBy === 'total_beds') {
        return (b.total_beds || 0) - (a.total_beds || 0);
      }
      if (sortBy === 'city') {
        return (a.city || '').localeCompare(b.city || '');
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [hospitals, debouncedSearch, specialtyFilter, availabilityFilter, cityFilter, categoryFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const paginatedHospitals = filteredHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open Edit Modal
  const handleOpenEdit = (h) => {
    setEditingHospital(h);
    setHospitalForm({
      name: h.name,
      category: h.category || 'Private',
      city: h.city || 'Chandigarh',
      district: h.district || '',
      address: h.address,
      phone: h.phone || '',
      website: h.website || '',
      specialties: Array.isArray(h.specialties) ? h.specialties.join(', ') : h.specialties,
      total_beds: h.total_beds,
      available_beds: h.available_beds,
      icu_beds_available: h.icu_beds_available,
      emergency_services: Boolean(h.emergency_services),
      latitude: h.latitude || 30.7333,
      longitude: h.longitude || 76.7794
    });
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingHospital(null);
    setHospitalForm({
      name: '',
      category: 'Private',
      city: 'Chandigarh',
      district: '',
      address: '',
      phone: '',
      website: '',
      specialties: 'Emergency Care, General Medicine',
      total_beds: 120,
      available_beds: 25,
      icu_beds_available: 5,
      emergency_services: false,
      latitude: 30.7333,
      longitude: 76.7794
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Hospital
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalForm.name.trim() || !hospitalForm.address.trim()) {
      showToast('Hospital name and address are required.', 'warning', '⚠');
      return;
    }

    setSubmitting(true);
    try {
      if (editingHospital) {
        const updated = await hospitalService.updateHospital(editingHospital.id, hospitalForm);
        setHospitals((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
        showToast(`Hospital "${updated.name}" updated successfully!`, 'success', '✓');
      } else {
        const created = await hospitalService.createHospital(hospitalForm);
        setHospitals((prev) => [created, ...prev]);
        showToast(`Hospital "${created.name}" registered to network!`, 'success', '✓');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving hospital:', err);
      showToast(err.message || 'Failed to save hospital record.', 'danger', '✕');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Route between Origin & Destination
  const handleCalculateRoute = async () => {
    if (!originHospitalId || !destHospitalId) {
      showToast('Select both Origin and Destination hospitals.', 'warning', '⚠');
      return;
    }
    if (originHospitalId === destHospitalId) {
      showToast('Origin and Destination must be different facilities.', 'warning', '⚠');
      return;
    }

    const orig = hospitals.find((h) => h.id === originHospitalId);
    const dest = hospitals.find((h) => h.id === destHospitalId);

    if (!orig || !dest) return;

    setRouteLoading(true);
    setRouteError('');
    setRouteResult(null);

    try {
      const res = await calculateRoute(
        { lat: Number(orig.latitude || 30.7333), lng: Number(orig.longitude || 76.7794) },
        { lat: Number(dest.latitude || 30.7095), lng: Number(dest.longitude || 76.7725) }
      );

      setRouteResult({
        ...res,
        originName: orig.name,
        destName: dest.name
      });

      if (directionsRendererRef.current && res.directionsResult) {
        directionsRendererRef.current.setDirections(res.directionsResult);
      }

      showToast(`Transit Route calculated: ${res.distanceText} (${res.durationText})`, 'success', '🚗');
    } catch (err) {
      console.error('Route calculation error:', err);
      setRouteError('Could not calculate route. Please verify hospital coordinates.');
      showToast('Route calculation failed.', 'danger', '✕');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <>
      <Topbar
        eyebrow="REGIONAL DIRECTORY"
        title="Hospital Network & Route Planning"
        rightContent={
          <button
            type="button"
            className="login-btn"
            style={{ width: 'auto', padding: '8px 18px', fontSize: 13, height: 38 }}
            onClick={handleOpenAdd}
          >
            <span>+ Add Facility</span>
          </button>
        }
      />

      <div style={{ padding: '0 32px 32px' }}>
        {/* Interactive Map & Route Calculation Section */}
        <section
          style={{
            background: 'var(--rb-panel-solid, #0a2133)',
            borderRadius: 16,
            border: '1px solid var(--rb-border, rgba(56,198,232,0.2))',
            padding: 24,
            marginBottom: 32
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🗺️</span>
                <h2 style={{ margin: 0, fontSize: 18, color: 'var(--rb-text-main, #fff)' }}>
                  Inter-Hospital Transit &amp; Route Estimator
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--rb-text-muted, #94a3b8)' }}>
                Calculate road travel distance, estimated transport time, and verify receiving capacity.
              </p>
            </div>

            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: isGoogleMapsConfigured ? 'var(--rb-teal)' : '#f59e0b' }}>
              {isGoogleMapsConfigured ? '● GOOGLE MAPS & ROUTES API CONNECTED' : '○ ROAD ESTIMATION ENGINE (Configurable via .env)'}
            </div>
          </div>

          {/* Origin / Destination Pickers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              background: 'rgba(8, 24, 40, 0.7)',
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--rb-border)',
              marginBottom: 20
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rb-text-muted)', marginBottom: 6 }}>
                ORIGIN HOSPITAL (Referring Facility)
              </label>
              <select
                value={originHospitalId}
                onChange={(e) => setOriginHospitalId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border)',
                  color: 'var(--rb-text-main, #fff)',
                  fontSize: 13
                }}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    [{h.city || 'Tricity'} · {h.category === 'Government' ? 'Govt' : 'Pvt'}] {h.name} — {h.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rb-text-muted)', marginBottom: 6 }}>
                DESTINATION HOSPITAL (Receiving Facility)
              </label>
              <select
                value={destHospitalId}
                onChange={(e) => setDestHospitalId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border)',
                  color: 'var(--rb-text-main, #fff)',
                  fontSize: 13
                }}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    [{h.city || 'Tricity'} · {h.category === 'Government' ? 'Govt' : 'Pvt'}] {h.name} ({h.available_beds} beds free, {h.icu_beds_available} ICU)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCalculateRoute}
                disabled={routeLoading}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 20px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--rb-teal, #14e4b8), var(--rb-cyan, #22c8ff))',
                  border: 'none',
                  color: '#061826',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: routeLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {routeLoading ? 'Calculating Road Route...' : '⚡ Calculate Transfer Route'}
              </button>
            </div>
          </div>

          {/* Route Result Display Banner */}
          {routeResult && (
            <div
              style={{
                marginBottom: 20,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(20, 228, 184, 0.08)',
                border: '1px solid rgba(20, 228, 184, 0.3)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-teal, #14e4b8)' }}>
                  DISPATCH ROUTE SUMMARY
                </span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>
                  {routeResult.originName} ➔ {routeResult.destName}
                </div>
                {routeResult.warning && (
                  <div style={{ fontSize: 12, color: 'var(--rb-text-muted)', marginTop: 4 }}>
                    ℹ️ {routeResult.warning}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>TRANSIT DISTANCE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--rb-cyan, #22c8ff)' }}>
                    {routeResult.distanceText}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>ESTIMATED DURATION</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--rb-teal, #14e4b8)' }}>
                    {routeResult.durationText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {routeError && (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,84,101,0.1)', color: '#ff5465', fontSize: 13 }}>
              {routeError}
            </div>
          )}

          {/* Interactive Map Canvas or Fallback Visualizer */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 380,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#0d1c2d',
              border: '1px solid var(--rb-border)'
            }}
          >
            {isGoogleMapsConfigured ? (
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            ) : (
              /* Fallback Interactive Radar / Map Grid */
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `radial-gradient(circle at center, rgba(34,200,255,0.06) 0%, transparent 70%), linear-gradient(rgba(56,198,232,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,198,232,0.08) 1px, transparent 1px)`,
                  backgroundSize: '100% 100%, 30px 30px, 30px 30px'
                }}
              >
                {/* Center Radar Scanner Circle */}
                <div
                  style={{
                    position: 'absolute',
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    border: '1px dashed rgba(20,228,184,0.3)',
                    pointerEvents: 'none'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    border: '1px dashed rgba(34,200,255,0.3)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Render Route Polyline in Fallback Map if Route Result is active */}
                {routeResult && (
                  <svg
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  >
                    <line
                      x1="35%"
                      y1="50%"
                      x2="65%"
                      y2="50%"
                      stroke="#14e4b8"
                      strokeWidth="3"
                      strokeDasharray="6,4"
                    />
                  </svg>
                )}

                {/* Render Hospital Radar Markers based on active filter */}
                {filteredHospitals.map((h, i) => {
                  const count = Math.max(filteredHospitals.length, 1);
                  const angle = (i / count) * 2 * Math.PI;
                  const radius = 100 + (i % 3) * 30;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isGov = h.category === 'Government';
                  const isAvailable = (h.available_beds || 0) > 0;
                  const isOrigin = h.id === originHospitalId;
                  const isDest = h.id === destHospitalId;

                  return (
                    <div
                      key={h.id}
                      style={{
                        position: 'absolute',
                        transform: `translate(${x}px, ${y}px)`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        zIndex: isOrigin || isDest ? 5 : 2
                      }}
                      onClick={() => {
                        showToast(`${h.name} (${h.city} · ${h.category}) — ${h.available_beds} beds free, ${h.icu_beds_available} ICU`, 'info', isGov ? '🏛' : '🏥');
                      }}
                      title={`${h.name} (${h.city} · ${h.category})`}
                    >
                      <div
                        style={{
                          width: isGov ? 16 : 14,
                          height: isGov ? 16 : 14,
                          margin: '0 auto',
                          borderRadius: isGov ? '3px' : '50%',
                          transform: isGov ? 'rotate(45deg)' : 'none',
                          background: isGov ? '#14e4b8' : '#22c8ff',
                          boxShadow: isOrigin || isDest
                            ? '0 0 16px #ffffff, 0 0 8px #14e4b8'
                            : `0 0 8px ${isGov ? '#14e4b8' : '#22c8ff'}`,
                          border: isOrigin
                            ? '3px solid #ff5465'
                            : isDest
                            ? '3px solid #10b981'
                            : `2px solid ${isAvailable ? '#ffffff' : '#ef4444'}`
                        }}
                      />
                      <span
                        style={{
                          display: 'block',
                          fontSize: 10,
                          fontWeight: 700,
                          color: isOrigin ? '#ff5465' : isDest ? '#10b981' : '#f0f7fd',
                          background: 'rgba(6,24,38,0.92)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          marginTop: 4,
                          border: isOrigin ? '1px solid #ff5465' : isDest ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isGov ? '🏛 ' : '🏥 '}{h.name.split(' ')[0]} {isOrigin ? '(Origin)' : isDest ? '(Dest)' : ''}
                      </span>
                    </div>
                  );
                })}

                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: 'rgba(6,24,38,0.92)',
                    border: '1px solid var(--rb-border)',
                    fontSize: 11,
                    color: 'var(--rb-text-muted)',
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <span>🏛 <b>Govt:</b> Diamond (Teal)</span>
                  <span>🏥 <b>Private:</b> Circle (Cyan)</span>
                  <span>🟢 Available</span>
                  <span>🔴 Full</span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: 'rgba(6,24,38,0.92)',
                    border: '1px solid rgba(34,200,255,0.25)',
                    fontSize: 11,
                    color: 'var(--rb-text-muted)',
                    maxWidth: 320
                  }}
                >
                  <span style={{ color: 'var(--rb-cyan, #22c8ff)', fontWeight: 600 }}>Showing {filteredHospitals.length} hospitals</span> in Mohali, Zirakpur, Chandigarh &amp; Panchkula.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Directory Controls: Search, Filter, Sort */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--rb-text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search hospitals by name, city, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 10,
                border: '1px solid var(--rb-border)',
                background: 'var(--rb-panel-solid, #0a2133)',
                color: 'var(--rb-text-main, #fff)',
                fontSize: 13
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: cityFilter !== 'all' ? 'rgba(20,228,184,0.12)' : 'var(--rb-panel-solid, #0a2133)',
                border: cityFilter !== 'all' ? '1px solid rgba(20,228,184,0.4)' : '1px solid var(--rb-border)',
                color: cityFilter !== 'all' ? 'var(--rb-teal, #14e4b8)' : 'var(--rb-text-main, #fff)',
                fontSize: 13, fontWeight: cityFilter !== 'all' ? 600 : 400
              }}
            >
              <option value="all">All Cities</option>
              <option value="Chandigarh">📍 Chandigarh</option>
              <option value="Mohali">📍 Mohali</option>
              <option value="Panchkula">📍 Panchkula</option>
              <option value="Zirakpur">📍 Zirakpur</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: categoryFilter !== 'all' ? 'rgba(34,200,255,0.12)' : 'var(--rb-panel-solid, #0a2133)',
                border: categoryFilter !== 'all' ? '1px solid rgba(34,200,255,0.4)' : '1px solid var(--rb-border)',
                color: categoryFilter !== 'all' ? 'var(--rb-cyan, #22c8ff)' : 'var(--rb-text-main, #fff)',
                fontSize: 13, fontWeight: categoryFilter !== 'all' ? 600 : 400
              }}
            >
              <option value="all">Govt & Private</option>
              <option value="Government">🏛 Government</option>
              <option value="Private">🏥 Private</option>
            </select>

            {/* Specialty Dropdown */}
            <select
              value={specialtyFilter}
              onChange={(e) => { setSpecialtyFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: 'var(--rb-text-main, #fff)', fontSize: 13
              }}
            >
              <option value="all">All Clinical Specialties</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Availability Dropdown */}
            <select
              value={availabilityFilter}
              onChange={(e) => { setAvailabilityFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: 'var(--rb-text-main, #fff)', fontSize: 13
              }}
            >
              <option value="all">All Capacity Status</option>
              <option value="available">Beds Available</option>
              <option value="icu">ICU Beds Available</option>
              <option value="emergency">Emergency Services</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: 'var(--rb-text-main, #fff)', fontSize: 13
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="city">Sort by City</option>
              <option value="available_beds">Sort by Available Beds</option>
              <option value="total_beds">Sort by Total Capacity</option>
            </select>
          </div>
        </section>

        {/* Hospital Directory Cards Grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--rb-text-muted)' }}>
            Loading regional hospital records...
          </div>
        ) : paginatedHospitals.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              borderRadius: 12,
              background: 'var(--rb-panel-solid, #0a2133)',
              border: '1px dashed var(--rb-border)'
            }}
          >
            <p style={{ fontSize: 16, color: 'var(--rb-text-muted)' }}>No hospitals found matching criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecialtyFilter('all');
                setAvailabilityFilter('all');
                setCityFilter('all');
                setCategoryFilter('all');
                setSortBy('name');
                setCurrentPage(1);
              }}
              style={{
                marginTop: 12,
                background: 'transparent',
                color: 'var(--rb-cyan, #22c8ff)',
                border: '1px solid var(--rb-cyan, #22c8ff)',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
              marginBottom: 24
            }}
          >
            {paginatedHospitals.map((h) => {
              const isAvailable = (h.available_beds || 0) > 0;
              const hasICU = (h.icu_beds_available || 0) > 0;
              const specs = Array.isArray(h.specialties) ? h.specialties : (h.specialties || '').split(',');

              return (
                <div
                  key={h.id}
                  style={{
                    padding: 20,
                    borderRadius: 14,
                    background: 'var(--rb-panel-solid, #0a2133)',
                    border: '1px solid var(--rb-border, rgba(56,198,232,0.2))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 15, color: 'var(--rb-text-main, #fff)', flex: 1, paddingRight: 8 }}>{h.name}</h3>
                      <span
                        style={{
                          padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, flexShrink: 0,
                          background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isAvailable ? '#10b981' : '#ef4444',
                          border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                      >
                        {isAvailable ? 'AVAILABLE' : 'AT CAPACITY'}
                      </span>
                    </div>

                    {/* City & Category badges */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {h.city && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                          background: 'rgba(34,200,255,0.1)', color: 'var(--rb-cyan, #22c8ff)',
                          border: '1px solid rgba(34,200,255,0.2)'
                        }}>
                          📍 {h.city}
                        </span>
                      )}
                      {h.category && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                          background: h.category === 'Government' ? 'rgba(20,228,184,0.1)' : 'rgba(245,158,11,0.1)',
                          color: h.category === 'Government' ? 'var(--rb-teal, #14e4b8)' : '#f59e0b',
                          border: `1px solid ${h.category === 'Government' ? 'rgba(20,228,184,0.2)' : 'rgba(245,158,11,0.2)'}`
                        }}>
                          {h.category === 'Government' ? '🏛' : '🏥'} {h.category}
                        </span>
                      )}
                      {h.emergency_services && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                          background: 'rgba(239,68,68,0.1)', color: '#ff5465',
                          border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                          🆘 Emergency
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--rb-text-muted)' }}>
                      📍 {h.address}
                    </p>

                    {/* Bed Capacity Counters */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                        padding: '10px 0',
                        borderTop: '1px solid var(--rb-border)',
                        borderBottom: '1px solid var(--rb-border)',
                        marginBottom: 12,
                        textAlign: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--rb-text-muted)', display: 'block' }}>TOTAL</span>
                        <strong style={{ fontSize: 15, color: '#fff' }}>{h.total_beds}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--rb-text-muted)', display: 'block' }}>FREE BEDS</span>
                        <strong style={{ fontSize: 15, color: isAvailable ? 'var(--rb-teal)' : '#ef4444' }}>
                          {h.available_beds}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--rb-text-muted)', display: 'block' }}>ICU OPEN</span>
                        <strong style={{ fontSize: 15, color: hasICU ? 'var(--rb-cyan)' : '#94a3b8' }}>
                          {h.icu_beds_available}
                        </strong>
                      </div>
                    </div>

                    {/* Specialties Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {specs.map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            fontSize: 11,
                            color: 'var(--rb-text-muted)'
                          }}
                        >
                          {typeof s === 'string' ? s.trim() : s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(h)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 6,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--rb-text-main, #fff)',
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit Facility
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDestHospitalId(h.id);
                        showToast(`Selected ${h.name} as destination for transfer.`, 'info', '🎯');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'rgba(34,200,255,0.15)',
                        color: 'var(--rb-cyan, #22c8ff)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Select Destination
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: currentPage === 1 ? '#555' : '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: 'var(--rb-text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: currentPage === totalPages ? '#555' : '#fff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Add / Edit Hospital Modal */}
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 540,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                borderRadius: 16,
                padding: 28,
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
                  {editingHospital ? 'Edit Hospital Capacity & Details' : 'Register New Partner Facility'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={hospitalForm.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Apollo Hospital Chandigarh"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--rb-border)',
                      background: 'rgba(6,24,38,0.8)',
                      color: '#fff',
                      fontSize: 13
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Street Address &amp; Sector *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={hospitalForm.address}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Sector 18-A, Chandigarh"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--rb-border)',
                      background: 'rgba(6,24,38,0.8)',
                      color: '#fff',
                      fontSize: 13
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      City (Restricted) *
                    </label>
                    <select
                      name="city"
                      value={hospitalForm.city}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    >
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Mohali">Mohali (SAS Nagar)</option>
                      <option value="Panchkula">Panchkula</option>
                      <option value="Zirakpur">Zirakpur</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Facility Category *
                    </label>
                    <select
                      name="category"
                      value={hospitalForm.category}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    >
                      <option value="Government">🏛 Government</option>
                      <option value="Private">🏥 Private</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      District / UT
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={hospitalForm.district}
                      onChange={handleFormChange}
                      placeholder="e.g. Chandigarh UT / SAS Nagar"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Official Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={hospitalForm.website}
                      onChange={handleFormChange}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Phone / Hotline
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={hospitalForm.phone}
                      onChange={handleFormChange}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Specialties (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="specialties"
                      value={hospitalForm.specialties}
                      onChange={handleFormChange}
                      placeholder="Cardiology, Trauma, ICU"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Total Beds
                    </label>
                    <input
                      type="number"
                      name="total_beds"
                      min="0"
                      value={hospitalForm.total_beds}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Available Beds
                    </label>
                    <input
                      type="number"
                      name="available_beds"
                      min="0"
                      value={hospitalForm.available_beds}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      ICU Beds
                    </label>
                    <input
                      type="number"
                      name="icu_beds_available"
                      min="0"
                      value={hospitalForm.icu_beds_available}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="emergency_services"
                      checked={hospitalForm.emergency_services}
                      onChange={(e) => setHospitalForm((prev) => ({ ...prev, emergency_services: e.target.checked }))}
                    />
                    <span>🆘 24/7 Verified Emergency &amp; Trauma Services Available</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Latitude (decimal)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="latitude"
                      value={hospitalForm.latitude}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Longitude (decimal)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="longitude"
                      value={hospitalForm.longitude}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid var(--rb-border)',
                      background: 'transparent',
                      color: 'var(--rb-text-muted)',
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--rb-teal, #14e4b8), var(--rb-cyan, #22c8ff))',
                      color: '#061826',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: submitting ? 'wait' : 'pointer'
                    }}
                  >
                    {submitting ? 'Saving to Database...' : editingHospital ? 'Save Changes' : 'Register Hospital'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
