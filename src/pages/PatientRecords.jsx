import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { patientService } from '../services/patientService';
import { useToast } from '../context/ToastContext';

export default function PatientRecords() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatientDossier, setSelectedPatientDossier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [patientForm, setPatientForm] = useState({
    patient_identifier: '',
    full_name: '',
    age: '',
    gender: 'Male',
    contact_number: '',
    primary_condition: '',
    medical_history: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to retrieve patient registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    let list = [...patients];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.patient_identifier.toLowerCase().includes(q) ||
          p.full_name.toLowerCase().includes(q) ||
          p.primary_condition.toLowerCase().includes(q)
      );
    }

    if (genderFilter !== 'all') {
      list = list.filter((p) => p.gender === genderFilter);
    }

    return list;
  }, [patients, searchTerm, genderFilter]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setPatientForm({
      patient_identifier: `PT-${Math.floor(2000 + Math.random() * 8000)}`,
      full_name: '',
      age: '',
      gender: 'Male',
      contact_number: '',
      primary_condition: '',
      medical_history: ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setPatientForm({
      patient_identifier: p.patient_identifier,
      full_name: p.full_name,
      age: p.age || '',
      gender: p.gender || 'Male',
      contact_number: p.contact_number || '',
      primary_condition: p.primary_condition,
      medical_history: p.medical_history || ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!patientForm.full_name.trim()) errs.full_name = 'Patient name is required.';
    if (!patientForm.primary_condition.trim()) errs.primary_condition = 'Primary clinical condition is required.';
    if (patientForm.age && (Number(patientForm.age) < 0 || Number(patientForm.age) > 130)) {
      errs.age = 'Enter a valid age between 0 and 130.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix required fields.', 'warning', '⚠');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPatient) {
        const updated = await patientService.updatePatient(editingPatient.id, patientForm);
        setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Patient ${updated.patient_identifier} updated.`, 'success', '✓');
      } else {
        const created = await patientService.createPatient(patientForm);
        setPatients((prev) => [created, ...prev]);
        showToast(`Patient ${created.patient_identifier} registered to clinical records.`, 'success', '✓');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Save patient error:', err);
      showToast(err.message || 'Error saving patient record.', 'danger', '✕');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar
        eyebrow="CLINICAL REGISTRY"
        title="Patient Records & Medical Handoff"
        rightContent={
          <button
            type="button"
            className="login-btn"
            style={{ width: 'auto', padding: '8px 18px', fontSize: 13, height: 38 }}
            onClick={handleOpenAdd}
          >
            <span>+ Add Patient Case</span>
          </button>
        }
      />

      <div style={{ padding: '0 32px 32px' }}>
        {/* Search & Filter Bar */}
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
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--rb-text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, diagnosis..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                color: 'var(--rb-text-main, #fff)',
                fontSize: 13
              }}
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </section>

        {/* Patient Registry Table */}
        <div
          style={{
            background: 'var(--rb-panel-solid, #0a2133)',
            borderRadius: 16,
            border: '1px solid var(--rb-border, rgba(56,198,232,0.2))',
            overflow: 'hidden',
            marginBottom: 24
          }}
        >
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--rb-text-muted)' }}>
              Loading patient clinical files...
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--rb-text-muted)' }}>
              No patient records found matching search criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--rb-border)',
                      background: 'rgba(6, 24, 38, 0.6)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      color: 'var(--rb-text-muted)'
                    }}
                  >
                    <th style={{ padding: '14px 20px' }}>PATIENT ID</th>
                    <th style={{ padding: '14px 20px' }}>FULL NAME</th>
                    <th style={{ padding: '14px 20px' }}>AGE / GENDER</th>
                    <th style={{ padding: '14px 20px' }}>PRIMARY CONDITION</th>
                    <th style={{ padding: '14px 20px' }}>REGISTERED DATE</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid rgba(56,198,232,0.1)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            color: 'var(--rb-cyan, #22c8ff)'
                          }}
                        >
                          {p.patient_identifier}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--rb-text-main, #fff)' }}>
                        {p.full_name}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--rb-text-muted)' }}>
                        {p.age ? `${p.age} yrs` : 'N/A'} · {p.gender}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--rb-text-main)' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {p.primary_condition}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--rb-text-muted)', fontSize: 12 }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPatientDossier(p)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--rb-border)',
                              background: 'transparent',
                              color: 'var(--rb-cyan, #22c8ff)',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            Dossier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--rb-border)',
                              background: 'transparent',
                              color: 'var(--rb-text-muted)',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/requests', { state: { preselectedPatient: p } });
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 6,
                              border: 'none',
                              background: 'rgba(20,228,184,0.15)',
                              color: 'var(--rb-teal, #14e4b8)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Refer Out →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
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

        {/* Patient Dossier Modal */}
        {selectedPatientDossier && (
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
                maxWidth: 520,
                background: 'var(--rb-panel-solid, #0a2133)',
                border: '1px solid var(--rb-border)',
                borderRadius: 16,
                padding: 28,
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--rb-teal)' }}>
                    CONFIDENTIAL CLINICAL RECORD
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#fff' }}>
                    {selectedPatientDossier.full_name} ({selectedPatientDossier.patient_identifier})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatientDossier(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 18 }}>
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block' }}>AGE / GENDER</span>
                  <strong style={{ fontSize: 14, color: '#fff' }}>
                    {selectedPatientDossier.age || 'N/A'} yrs · {selectedPatientDossier.gender}
                  </strong>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block' }}>PHONE / CONTACT</span>
                  <strong style={{ fontSize: 14, color: '#fff' }}>
                    {selectedPatientDossier.contact_number || 'Not provided'}
                  </strong>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block', marginBottom: 4 }}>
                  PRIMARY CONDITION
                </label>
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(20,228,184,0.08)', border: '1px solid rgba(20,228,184,0.3)', color: 'var(--rb-teal)', fontWeight: 600 }}>
                  {selectedPatientDossier.primary_condition}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--rb-text-muted)', display: 'block', marginBottom: 4 }}>
                  MEDICAL HISTORY &amp; ALLERGIES
                </label>
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rb-border)', color: 'var(--rb-text-main)', fontSize: 13, minHeight: 60 }}>
                  {selectedPatientDossier.medical_history || 'No significant past surgical or medical history documented.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedPatientDossier(null)}
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
                <button
                  type="button"
                  onClick={() => {
                    const pt = selectedPatientDossier;
                    setSelectedPatientDossier(null);
                    navigate('/requests', { state: { preselectedPatient: pt } });
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--rb-teal, #14e4b8), var(--rb-cyan, #22c8ff))',
                    color: '#061826',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Initiate Referral Transfer →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Patient Modal */}
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
                  {editingPatient ? 'Edit Patient Clinical Information' : 'Register New Patient Admission'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Patient Identifier *
                    </label>
                    <input
                      type="text"
                      value={patientForm.patient_identifier}
                      readOnly={Boolean(editingPatient)}
                      onChange={(e) => setPatientForm({ ...patientForm, patient_identifier: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--rb-border)',
                        background: editingPatient ? 'rgba(255,255,255,0.05)' : 'rgba(6,24,38,0.8)',
                        color: 'var(--rb-cyan, #22c8ff)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={patientForm.full_name}
                      onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                      placeholder="e.g. Jaswinder Singh"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: formErrors.full_name ? '1px solid #ff5465' : '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                    {formErrors.full_name && (
                      <span style={{ color: '#ff5465', fontSize: 11 }}>{formErrors.full_name}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                      placeholder="e.g. 52"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: formErrors.age ? '1px solid #ff5465' : '1px solid var(--rb-border)',
                        background: 'rgba(6,24,38,0.8)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Gender
                    </label>
                    <select
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={patientForm.contact_number}
                      onChange={(e) => setPatientForm({ ...patientForm, contact_number: e.target.value })}
                      placeholder="+91 98..."
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
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Primary Condition / Triage Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={patientForm.primary_condition}
                    onChange={(e) => setPatientForm({ ...patientForm, primary_condition: e.target.value })}
                    placeholder="e.g. Acute Respiratory Distress Syndrome (ARDS)"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: formErrors.primary_condition ? '1px solid #ff5465' : '1px solid var(--rb-border)',
                      background: 'rgba(6,24,38,0.8)',
                      color: '#fff',
                      fontSize: 13
                    }}
                  />
                  {formErrors.primary_condition && (
                    <span style={{ color: '#ff5465', fontSize: 11 }}>{formErrors.primary_condition}</span>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--rb-text-muted)', marginBottom: 4 }}>
                    Medical History &amp; Vital Notes
                  </label>
                  <textarea
                    rows="3"
                    value={patientForm.medical_history}
                    onChange={(e) => setPatientForm({ ...patientForm, medical_history: e.target.value })}
                    placeholder="Document preexisting conditions, diabetes, cardiac history, drug allergies..."
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
                    {submitting ? 'Saving to Database...' : editingPatient ? 'Save Updates' : 'Add Patient Case'}
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
