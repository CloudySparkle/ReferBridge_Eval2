import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { hospitalService } from '../services/hospitalService';
import { referralService } from '../services/referralService';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function Dashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [hospList, refList] = await Promise.all([
          hospitalService.getHospitals(),
          referralService.getReferrals()
        ]);
        setHospitals(hospList);
        setReferrals(refList);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load real-time network data from database.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [refreshKey]);

  const handleSync = () => {
    setRefreshKey((k) => k + 1);
    showToast('Regional hospital capacity synchronized', 'success', '🔄');
  };

  // Aggregated Database Metrics
  const totalHospitals = hospitals.length;
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0);
  const availableICU = hospitals.reduce((sum, h) => sum + (h.icu_beds_available || 0), 0);

  const pendingReferrals = referrals.filter((r) => r.status === 'Pending').length;
  const acceptedReferrals = referrals.filter((r) => r.status === 'Accepted').length;
  const rejectedReferrals = referrals.filter((r) => r.status === 'Rejected').length;

  const recentReferrals = referrals.slice(0, 5);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Accepted': return 'status-badge green';
      case 'Rejected': return 'status-badge red';
      default: return 'status-badge yellow';
    }
  };

  return (
    <>
      <Topbar
        eyebrow="COMMAND HUB / OPERATIONS"
        title="Operations Dashboard"
        rightContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="live-sync-badge">
              <span className="live-dot" />
              <span>LIVE DATABASE SYNC</span>
            </span>
            <button
              type="button"
              id="btnSyncCapacity"
              className="topbar-cmd-chip"
              onClick={handleSync}
              title="Sync hospital capacity from database"
            >
              <span>Sync Network</span> <kbd>Ctrl R</kbd>
            </button>
          </div>
        }
      />

      <div style={{ padding: '0 32px 32px' }}>
        {error && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 10,
              background: 'rgba(255, 84, 101, 0.15)',
              border: '1px solid rgba(255, 84, 101, 0.4)',
              color: '#ff5465',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              style={{
                background: '#ff5465',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--rb-text-muted, #94a3b8)' }}>
            <div style={{ width: 36, height: 36, margin: '0 auto 12px', border: '3px solid rgba(20,228,184,0.2)', borderTopColor: 'var(--rb-teal, #14e4b8)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p>Querying real-time capacity and referral records...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Primary KPI Metrics Grid */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}
            >
              {/* Partner Hospitals Card */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-text-muted, #94a3b8)', letterSpacing: '0.08em' }}>
                  REGISTERED NETWORK
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display, sans-serif)', color: 'var(--rb-teal, #14e4b8)' }}>
                    {totalHospitals}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--rb-text-muted)' }}>Hospitals</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rb-text-muted)' }}>
                  All verified medical facilities in tri-city
                </div>
              </div>

              {/* Total Capacity Card */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-text-muted, #94a3b8)', letterSpacing: '0.08em' }}>
                  AVAILABLE BEDS
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display, sans-serif)', color: availableBeds > 0 ? '#10b981' : '#ff5465' }}>
                    {availableBeds}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--rb-text-muted)' }}>of {totalBeds} Total</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rb-text-muted)' }}>
                  {((availableBeds / (totalBeds || 1)) * 100).toFixed(0)}% regional bed vacancy
                </div>
              </div>

              {/* ICU Availability Card */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-text-muted, #94a3b8)', letterSpacing: '0.08em' }}>
                  OPEN ICU BEDS
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display, sans-serif)', color: 'var(--rb-cyan, #22c8ff)' }}>
                    {availableICU}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--rb-text-muted)' }}>Ventilator Ready</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rb-text-muted)' }}>
                  Critical care reserve across network
                </div>
              </div>

              {/* Pending Referrals Card */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-text-muted, #94a3b8)', letterSpacing: '0.08em' }}>
                  PENDING REFERRALS
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display, sans-serif)', color: '#f59e0b' }}>
                    {pendingReferrals}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--rb-text-muted)' }}>Awaiting Decision</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rb-text-muted)' }}>
                  {acceptedReferrals} accepted · {rejectedReferrals} declined
                </div>
              </div>
            </section>

            {/* Quick Action Navigation Strip */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 28,
                padding: '14px 20px',
                borderRadius: 12,
                background: 'rgba(8, 24, 40, 0.6)',
                border: '1px solid var(--rb-border)'
              }}
            >
              <Link
                to="/network"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(20, 228, 184, 0.12)',
                  border: '1px solid rgba(20, 228, 184, 0.3)',
                  color: 'var(--rb-teal, #14e4b8)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>🌐 Hospital Network &amp; Routes</span>
              </Link>

              <Link
                to="/patients"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(34, 200, 255, 0.12)',
                  border: '1px solid rgba(34, 200, 255, 0.3)',
                  color: 'var(--rb-cyan, #22c8ff)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>📋 Patient Clinical Records</span>
              </Link>

              <Link
                to="/requests"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(245, 183, 56, 0.12)',
                  border: '1px solid rgba(245, 183, 56, 0.3)',
                  color: '#f5b738',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>📥 Incoming Referral Triage</span>
              </Link>
            </div>

            {/* Split Section: Recent Referrals & Capacity Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
              {/* Recent Referrals Table */}
              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--rb-text-main, #fff)' }}>Recent Referral Activity</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--rb-text-muted)' }}>Latest triage requests from partner clinics</p>
                  </div>
                  <Link to="/requests" style={{ fontSize: 12, color: 'var(--rb-cyan, #22c8ff)', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>

                {recentReferrals.length === 0 ? (
                  <p style={{ color: 'var(--rb-text-muted)', fontSize: 13 }}>No referral records recorded.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentReferrals.map((ref) => (
                      <div
                        key={ref.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--rb-border)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 13, color: 'var(--rb-cyan, #22c8ff)', fontFamily: 'var(--font-mono, monospace)' }}>
                              {ref.referral_code}
                            </strong>
                            <span style={{ fontSize: 13, color: 'var(--rb-text-main, #fff)', fontWeight: 600 }}>
                              {ref.patient?.full_name || 'Patient'} ({ref.patient?.age || '45'}y)
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--rb-text-muted)', marginTop: 4 }}>
                            {ref.referral_reason} · {ref.receiving_hospital?.name || 'Partner Facility'}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            background: ref.status === 'Accepted'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : ref.status === 'Rejected'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                            color: ref.status === 'Accepted'
                              ? '#10b981'
                              : ref.status === 'Rejected'
                              ? '#ef4444'
                              : '#f59e0b',
                            border: `1px solid ${
                              ref.status === 'Accepted'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : ref.status === 'Rejected'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'rgba(245, 158, 11, 0.3)'
                            }`
                          }}
                        >
                          {ref.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regional Capacity Snapshot */}
              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: 'var(--rb-panel-solid, #0a2133)',
                  border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--rb-text-main, #fff)' }}>Hospital Bed Occupancy</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--rb-text-muted)' }}>Verified partner capacity breakdown</p>
                  </div>
                  <Link to="/network" style={{ fontSize: 12, color: 'var(--rb-cyan, #22c8ff)', textDecoration: 'none' }}>
                    Open Map →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hospitals.slice(0, 5).map((h) => {
                    const ratio = h.total_beds > 0 ? (h.available_beds / h.total_beds) : 0;
                    const pct = Math.round(ratio * 100);
                    return (
                      <div key={h.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: 'var(--rb-text-main, #fff)' }}>{h.name}</span>
                          <span style={{ color: h.available_beds > 0 ? 'var(--rb-teal, #14e4b8)' : '#ff5465' }}>
                            {h.available_beds} beds free ({h.icu_beds_available} ICU)
                          </span>
                        </div>
                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(pct, 100)}%`,
                              background: pct > 20 ? 'var(--rb-teal, #14e4b8)' : pct > 0 ? '#f59e0b' : '#ff5465',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
