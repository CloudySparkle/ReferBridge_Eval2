import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { referralService } from '../services/referralService';
import { hospitalService } from '../services/hospitalService';
import { patientService } from '../services/patientService';
import { useToast } from '../context/ToastContext';

export default function ReferralRequests() {
  const { showToast } = useToast();
  const location = useLocation();

  const [referrals, setReferrals] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCaseModal, setSelectedCaseModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Referral Form
  const [newReferral, setNewReferral] = useState({
    patient_id: '',
    receiving_hospital_id: '',
    referral_reason: '',
    urgency: 'High',
    clinical_notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [refList, hospList, ptList] = await Promise.all([
        referralService.getReferrals(),
        hospitalService.getHospitals(),
        patientService.getPatients()
      ]);
      setReferrals(refList);
      setHospitals(hospList);
      setPatients(ptList);

      // Check if arriving from PatientRecords with preselected patient
      if (location.state?.preselectedPatient) {
        const pt = location.state.preselectedPatient;
        setNewReferral((prev) => ({
          ...prev,
          patient_id: pt.id,
          referral_reason: `Transfer for ${pt.primary_condition}`
        }));
        setIsCreateModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load referrals data:', err);
      showToast('Error retrieving referral queue from database.', 'danger', '✕');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.state]);

  // Status Counts
  const counts = useMemo(() => {
    const c = { All: referrals.length, Pending: 0, Accepted: 0, Rejected: 0, Cancelled: 0 };
    referrals.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [referrals]);

  // Filtered List
  const filteredReferrals = useMemo(() => {
    let list = [...referrals];

    if (activeStatusTab !== 'All') {
      list = list.filter((r) => r.status === activeStatusTab);
    }

    if (urgencyFilter !== 'All') {
      list = list.filter((r) => r.urgency === urgencyFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.referral_code.toLowerCase().includes(q) ||
          r.patient?.full_name?.toLowerCase().includes(q) ||
          r.referral_reason?.toLowerCase().includes(q) ||
          r.receiving_hospital?.name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [referrals, activeStatusTab, urgencyFilter, searchTerm]);

  // Update Status handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updated = await referralService.updateReferralStatus(id, newStatus);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (selectedCaseModal && selectedCaseModal.id === id) {
        setSelectedCaseModal(updated);
      }
      showToast(`Referral ${updated.referral_code} updated to status "${newStatus}"`, 'success', '✓');
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Failed to update referral status in database.', 'danger', '✕');
    }
  };

  // Submit Create Referral
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newReferral.patient_id || !newReferral.receiving_hospital_id || !newReferral.referral_reason.trim()) {
      showToast('Please select a patient, destination hospital, and referral reason.', 'warning', '⚠');
      return;
    }

    setSubmitting(true);
    try {
      const selectedPt = patients.find((p) => p.id === newReferral.patient_id);
      const selectedHosp = hospitals.find((h) => h.id === newReferral.receiving_hospital_id);

      const created = await referralService.createReferral(
        newReferral,
        selectedPt,
        selectedHosp,
        { name: 'Referring Facility' }
      );

      setReferrals((prev) => [created, ...prev]);
      showToast(`Outbound referral ${created.referral_code} created and queued!`, 'success', '🚀');
      setIsCreateModalOpen(false);
      setNewReferral({
        patient_id: '',
        receiving_hospital_id: '',
        referral_reason: '',
        urgency: 'High',
        clinical_notes: ''
      });
    } catch (err) {
      console.error('Create referral error:', err);
      showToast(err.message || 'Error persisting referral.', 'danger', '✕');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar
        eyebrow="CAPACITY TRIAGE"
        title="Incoming & Outbound Referral Requests"
        rightContent={
          <button
            type="button"
            className="login-btn"
            style={{ width: 'auto', padding: '8px 18px', fontSize: 13, height: 38 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+ Create Outbound Transfer</span>
          </button>
        }
      />

      <div style={{ padding: '0 32px 32px' }}>
        {/* Status Filter Tabs & Counts */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 20
          }}
        >
          {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveStatusTab(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: activeStatusTab === tab ? '1px solid var(--rb-teal, #14e4b8)' : '1px solid var(--rb-border)',
                background: activeStatusTab === tab ? 'rgba(20, 228, 184, 0.15)' : 'var(--rb-panel-solid, #0a2133)',
                color: activeStatusTab === tab ? 'var(--rb-teal, #14e4b8)' : 'var(--rb-text-muted)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>{tab}</span>
              <span
                style={{
                  background: activeStatusTab === tab ? 'var(--rb-teal, #14e4b8)' : 'rgba(255,255,255,0.1)',
                  color: activeStatusTab === tab ? '#061826' : 'var(--rb-text-muted)',
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 700
                }}
              >
                {counts[tab] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Urgency Filter Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--rb-text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search referral code, patient name, reason..."
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

          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: 'var(--rb-text-main, #fff)',
                fontSize: 13
              }}
            >
              <option value="All">All Urgency Priorities</option>
              <option value="Critical">🔴 Critical (Immediate ALS)</option>
              <option value="High">🟠 High (Sub-acute)</option>
              <option value="Moderate">🟡 Moderate (Scheduled)</option>
            </select>
          </div>
        </div>

        {/* Referrals Queue Grid / Table */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--rb-text-muted)' }}>
            Retrieving referral transfer database...
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              borderRadius: 14,
              background: 'var(--rb-panel-solid, #0a2133)',
              border: '1px dashed var(--rb-border)'
            }}
          >
            <p style={{ fontSize: 16, color: 'var(--rb-text-muted)' }}>No referrals matching criteria in this queue.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredReferrals.map((ref) => {
              const isAccepted = ref.status === 'Accepted';
              const isRejected = ref.status === 'Rejected';
              const isCancelled = ref.status === 'Cancelled';
              const isPending = ref.status === 'Pending' || ref.status === 'Submitted';

              return (
                <div
                  key={ref.id}
                  style={{
                    padding: '18px 24px',
                    borderRadius: 14,
                    background: 'var(--rb-panel-solid, #0a2133)',
                    border: '1px solid var(--rb-border, rgba(56,198,232,0.2))',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.15)'
                  }}
                >
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          fontSize: 14,
                          color: 'var(--rb-cyan, #22c8ff)'
                        }}
                      >
                        {ref.referral_code}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          background: ref.urgency === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: ref.urgency === 'Critical' ? '#ff5465' : '#f59e0b',
                          border: `1px solid ${ref.urgency === 'Critical' ? '#ff5465' : '#f59e0b'}`
                        }}
                      >
                        {ref.urgency?.toUpperCase()} PRIORITY
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--rb-text-muted)' }}>
                        {new Date(ref.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                      {ref.patient?.full_name || 'Patient'} ({ref.patient?.patient_identifier || 'PT-XXXX'})
                      {ref.patient?.age ? ` · ${ref.patient.age} yrs` : ''}
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--rb-text-muted)' }}>
                      <strong>Reason:</strong> {ref.referral_reason}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--rb-text-muted)', marginTop: 4 }}>
                      🏥 <b>Route:</b> {ref.sending_hospital?.name || 'Lotus Care'} ➔ <b>{ref.receiving_hospital?.name || 'Sunrise Multispecialty'}</b>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        background: isAccepted
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isRejected
                          ? 'rgba(239, 68, 68, 0.15)'
                          : isCancelled
                          ? 'rgba(148, 163, 184, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                        color: isAccepted
                          ? '#10b981'
                          : isRejected
                          ? '#ef4444'
                          : isCancelled
                          ? '#94a3b8'
                          : '#f59e0b',
                        border: `1px solid ${
                          isAccepted
                            ? 'rgba(16, 185, 129, 0.3)'
                            : isRejected
                            ? 'rgba(239, 68, 68, 0.3)'
                            : 'rgba(245, 158, 11, 0.3)'
                        }`
                      }}
                    >
                      {ref.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedCaseModal(ref)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'transparent',
                        color: 'var(--rb-cyan, #22c8ff)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Review Case
                    </button>

                    {isPending && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ref.id, 'Accepted')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ref.id, 'Rejected')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Case Review Dossier Modal */}
        {selectedCaseModal && (
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
                maxWidth: 580,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                borderRadius: 16,
                padding: 28,
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-cyan)' }}>
                    INTER-HOSPITAL CLINICAL DOSSIER
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#fff' }}>
                    {selectedCaseModal.referral_code} — {selectedCaseModal.patient?.full_name || 'Patient'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaseModal(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(34,200,255,0.08)',
                  border: '1px solid var(--rb-border)',
                  marginBottom: 16
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>CURRENT STATUS</span>
                  <strong style={{ display: 'block', fontSize: 15, color: 'var(--rb-teal)' }}>
                    {selectedCaseModal.status}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>URGENCY PROTOCOL</span>
                  <strong style={{ display: 'block', fontSize: 15, color: '#ff5465' }}>
                    {selectedCaseModal.urgency}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>SENDING FACILITY</span>
                  <strong style={{ display: 'block', fontSize: 13, color: '#fff', marginTop: 2 }}>
                    {selectedCaseModal.sending_hospital?.name || 'Origin Facility'}
                  </strong>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)' }}>DESTINATION FACILITY</span>
                  <strong style={{ display: 'block', fontSize: 13, color: '#fff', marginTop: 2 }}>
                    {selectedCaseModal.receiving_hospital?.name || 'Destination Facility'}
                  </strong>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block', marginBottom: 4 }}>
                  REFERRAL REASON
                </label>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)', color: '#fff', fontSize: 13 }}>
                  {selectedCaseModal.referral_reason}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block', marginBottom: 4 }}>
                  CLINICAL NOTES &amp; TRANSFER SUMMARY
                </label>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)', color: 'var(--rb-text-main)', fontSize: 13, minHeight: 60 }}>
                  {selectedCaseModal.clinical_notes || 'No specialized transfer notes attached.'}
                </div>
              </div>

              {/* Status Update Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCaseModal(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--rb-border)',
                    background: 'transparent',
                    color: 'var(--rb-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedCaseModal.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedCaseModal.id, 'Accepted')}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Accept Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedCaseModal.id, 'Rejected')}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Decline Transfer
                      </button>
                    </>
                  )}
                  {selectedCaseModal.status === 'Accepted' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedCaseModal.id, 'Cancelled')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #ef4444',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Transfer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Outbound Referral Modal */}
        {isCreateModalOpen && (
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
                  Dispatch Outbound Referral Transfer
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Select Patient Case *
                  </label>
                  <select
                    value={newReferral.patient_id}
                    onChange={(e) => {
                      const pt = patients.find((p) => p.id === e.target.value);
                      setNewReferral({
                        ...newReferral,
                        patient_id: e.target.value,
                        referral_reason: pt ? `Referral for ${pt.primary_condition}` : newReferral.referral_reason
                      });
                    }}
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
                    <option value="">-- Choose a patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.patient_identifier} — {p.full_name} ({p.primary_condition})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Destination Partner Hospital *
                  </label>
                  <select
                    value={newReferral.receiving_hospital_id}
                    onChange={(e) => setNewReferral({ ...newReferral, receiving_hospital_id: e.target.value })}
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
                    <option value="">-- Select receiving hospital --</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.available_beds} beds free, {h.icu_beds_available} ICU)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Urgency Priority
                    </label>
                    <select
                      value={newReferral.urgency}
                      onChange={(e) => setNewReferral({ ...newReferral, urgency: e.target.value })}
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
                      <option value="Critical">🔴 Critical (Immediate ICU)</option>
                      <option value="High">🟠 High (1 Hour)</option>
                      <option value="Moderate">🟡 Moderate (Scheduled)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Initial Status
                    </label>
                    <input
                      type="text"
                      value="Pending"
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#f59e0b',
                        fontWeight: 600,
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Referral Reason / Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={newReferral.referral_reason}
                    onChange={(e) => setNewReferral({ ...newReferral, referral_reason: e.target.value })}
                    placeholder="e.g. Requires emergency neurosurgery & ventilator bed"
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
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Physician Handover Notes
                  </label>
                  <textarea
                    rows="3"
                    value={newReferral.clinical_notes}
                    onChange={(e) => setNewReferral({ ...newReferral, clinical_notes: e.target.value })}
                    placeholder="Patient vitals, current IV infusions, airway status..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--rb-border)',
                      background: 'rgba(6,24,38,0.8)',
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
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
                    {submitting ? 'Persisting to Database...' : 'Dispatch Referral'}
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
