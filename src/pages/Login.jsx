import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reduxDispatch = useDispatch();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Signup Form States
  const [regAdminName, setRegAdminName] = useState('');
  const [regHospitalName, setRegHospitalName] = useState('');
  const [regCity, setRegCity] = useState('Chandigarh');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  /* ── Validation for Login ─────────────────────────────────────────── */
  const validateLogin = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit Login ─────────────────────────────────────────────────── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateLogin()) {
      showToast('Please fix the form errors before submitting', 'warning', '⚠');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password, rememberMe);
      
      // Dispatch to Redux Toolkit
      reduxDispatch(
        loginSuccess({
          user: {
            email: email.trim(),
            displayName: result.profile?.display_name || 'Administrator',
            hospitalName: result.profile?.hospital_name || 'Partner Facility',
            role: result.profile?.role || 'admin'
          },
          rememberMe
        })
      );

      showToast(
        `Welcome, ${result.profile?.display_name || 'Administrator'}!`,
        'success',
        '✓'
      );
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
      showToast(msg, 'danger', '✕');
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit Registration (Sign Up) ────────────────────────────────── */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regAdminName || !regHospitalName || !regEmail || !regPassword) {
      showToast('All fields are required for facility registration', 'warning', '⚠');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning', '⚠');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match', 'warning', '⚠');
      return;
    }

    setLoading(true);
    try {
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('referbridge_users') || '[]');
      } catch (err) {
        users = [];
      }

      if (users.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
        showToast('This email is already registered. Please login.', 'warning', '⚠');
        setLoading(false);
        return;
      }

      const newUser = {
        name: regAdminName.trim(),
        hospitalName: regHospitalName.trim(),
        city: regCity,
        email: regEmail.trim(),
        password: regPassword,
        role: 'admin',
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('referbridge_users', JSON.stringify(users));

      showToast(`Registration complete for ${newUser.hospitalName}!`, 'success', '✓');
      setEmail(newUser.email);
      setPassword('');
      setAuthMode('login');
    } catch (err) {
      showToast('Error registering facility: ' + err.message, 'danger', '✕');
    } finally {
      setLoading(false);
    }
  };

  /* ── Quick Demo Fill ──────────────────────────────────────────────── */
  const handleQuickDemoFill = () => {
    const demo = {
      email: 'director@fortis-mohali.com',
      password: 'SecurePassword123!',
      name: 'Dr. Gurpreet Singh',
      hospitalName: 'Fortis Hospital Mohali',
      city: 'Mohali'
    };

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('referbridge_users') || '[]');
    } catch (e) {
      users = [];
    }

    if (!users.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
      users.push(demo);
      localStorage.setItem('referbridge_users', JSON.stringify(users));
    }

    setEmail(demo.email);
    setPassword(demo.password);
    showToast('Demo hospital credentials filled. Click Login to proceed!', 'success', '⚡');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background glow and stream */}
      <div className="login-bg-glow" aria-hidden="true" />
      <div className="login-ecg-stream" aria-hidden="true" />

      {/* Floating orbs */}
      <div className="login-orbs" aria-hidden="true">
        <div className="login-orb" />
        <div className="login-orb" />
        <div className="login-orb" />
      </div>

      <main className="login-page">
        {/* Animated Journey Banner */}
        <div className="login-journey-banner" aria-label="Live referral activity ticker">
          <span className="banner-label">LIVE NETWORK</span>
          <div className="banner-scroll">
            <div className="banner-inner">
              <span className="banner-step"><span className="banner-dot"></span> Patient arrives at hospital → ICU full</span>
              <span className="banner-step"><span className="banner-dot red"></span> Hospital refers patient to ReferBridge network</span>
              <span className="banner-step"><span className="banner-dot green"></span> Match found at partner hospital — beds available</span>
              <span className="banner-step"><span className="banner-dot purple"></span> Transfer coordinated · Patient admitted in 12 min</span>
              <span className="banner-step"><span className="banner-dot green"></span> REQ-447 Accepted · Mohali → Chandigarh · ❤️ Saved</span>
            </div>
          </div>
        </div>

        {/* Unified Card */}
        <section className="login-card fade-in-up">
          {/* Visual Left Panel with Reference-Image Style Diagonal Welcome Overlay */}
          <div className="visual-panel">
            <div
              className={`welcome-banner-split ${authMode === 'signup' ? 'mode-signup' : ''}`}
            >
              <div className="welcome-split-content">
                <h2>{authMode === 'login' ? 'Welcome!' : 'Welcome Back!'}</h2>
                <p>
                  {authMode === 'login'
                    ? 'Create your facility account.\nCoordinate care on ReferBridge for Free!'
                    : 'To stay connected with the referral network,\nplease sign in with your hospital credentials.'}
                </p>
                <button
                  type="button"
                  className="btn-banner-switch"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                >
                  <span>{authMode === 'login' ? 'Sign Up' : 'Sign In'}</span>
                </button>
              </div>
            </div>

            <div className="visual-badge">
              <span className="live-radar-dot"></span>
              <span>CONNECTED HEALTHCARE NETWORK</span>
            </div>
            <img
              className="reference-panel-image"
              src="assets/referbridge-panel.png"
              alt="ReferBridge hospital interface"
            />
            <div className="visual-overlay-glow" />

            <div className="visual-stats">
              <div className="vstat">
                <b>25</b>
                <span>PARTNER HOSPITALS</span>
              </div>
              <div className="vstat">
                <b>14</b>
                <span>GOVT CENTERS</span>
              </div>
              <div className="vstat">
                <b>24/7</b>
                <span>LIVE SYNC</span>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="form-panel">
            <div className="brand-header">
              <div className="login-brand-logo">
                <img src="assets/referbridge-icon.png" alt="ReferBridge logo" />
              </div>
              <div>
                <span className="brand-title">
                  Refer<span>Bridge</span>
                </span>
                <span className="brand-dept">HOSPITAL REFERRAL SYSTEM</span>
              </div>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="auth-segment-bar">
              <button
                type="button"
                className={`auth-seg-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                <span>🔑 Admin Login</span>
              </button>
              <button
                type="button"
                className={`auth-seg-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                <span>🏥 Register Hospital</span>
              </button>
            </div>

            {errorMessage && (
              <div className="message error" style={{ display: 'block' }}>
                {errorMessage}
              </div>
            )}

            {/* ── LOGIN VIEW ── */}
            {authMode === 'login' ? (
              <div>
                <div className="form-top">
                  <p className="eyebrow">SECURE HOSPITAL LOGIN</p>
                  <h1>Admin Login</h1>
                  <p className="subtitle">
                    Sign in using your hospital's registered administrator credentials.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} novalidate>
                  <div className="field-group" style={{ marginBottom: 16 }}>
                    <label htmlFor="email" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                      Administrator Email
                    </label>
                    <div className="input-wrap">
                      <span className="input-icon">✉</span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: null }));
                        }}
                        placeholder="admin@yourhospital.com"
                        autoComplete="username"
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p style={{ color: '#ff5465', fontSize: 11, margin: '4px 0 0' }}>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="field-group" style={{ marginBottom: 16 }}>
                    <label htmlFor="password" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                      Password
                    </label>
                    <div className="input-wrap" style={{ position: 'relative' }}>
                      <span className="input-icon">🔒</span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: null }));
                        }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        id="togglePass"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p style={{ color: '#ff5465', fontSize: 11, margin: '4px 0 0' }}>
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div
                    className="options"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
                  >
                    <label
                      className="remember"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}
                    >
                      <input
                        id="remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember Me</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast('Contact your system administrator to reset password.', 'info', 'ℹ');
                      }}
                      style={{ fontSize: 12, color: 'var(--rb-cyan, #22c8ff)' }}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    className="login-btn btn-ripple"
                    type="submit"
                    disabled={loading}
                    style={{ opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer' }}
                  >
                    <span>{loading ? 'Authenticating...' : 'Login to ReferBridge'}</span>
                    <span className="btn-arrow">{loading ? '⏳' : '→'}</span>
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                  <p className="signup-link" style={{ margin: 0, fontSize: 13 }}>
                    New administrator?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--rb-cyan)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Register Facility
                    </button>
                  </p>
                  <button
                    type="button"
                    className="btn-quick-demo"
                    onClick={handleQuickDemoFill}
                  >
                    ⚡ Quick Demo Fill
                  </button>
                </div>
              </div>
            ) : (
              /* ── SIGNUP VIEW ── */
              <div>
                <div className="form-top">
                  <p className="eyebrow" style={{ color: 'var(--rb-cyan)' }}>HOSPITAL ONBOARDING</p>
                  <h1>Register Facility</h1>
                  <p className="subtitle">
                    Sets up your medical director credentials and hospital referral profile.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} novalidate>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>Medical Director Name</label>
                      <div className="input-wrap">
                        <span className="input-icon">👤</span>
                        <input
                          type="text"
                          value={regAdminName}
                          onChange={(e) => setRegAdminName(e.target.value)}
                          placeholder="Dr. Priya Sharma"
                          required
                        />
                      </div>
                    </div>

                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>Facility City</label>
                      <div className="input-wrap">
                        <span className="input-icon">📍</span>
                        <select
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none' }}
                        >
                          <option value="Chandigarh" style={{ background: '#0a2133' }}>Chandigarh</option>
                          <option value="Mohali" style={{ background: '#0a2133' }}>Mohali (SAS Nagar)</option>
                          <option value="Panchkula" style={{ background: '#0a2133' }}>Panchkula</option>
                          <option value="Zirakpur" style={{ background: '#0a2133' }}>Zirakpur</option>
                          <option value="Delhi NCR" style={{ background: '#0a2133' }}>Delhi NCR</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="field-group" style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12 }}>Hospital / Facility Name</label>
                    <div className="input-wrap">
                      <span className="input-icon">🏥</span>
                      <input
                        type="text"
                        value={regHospitalName}
                        onChange={(e) => setRegHospitalName(e.target.value)}
                        placeholder="Sunrise Multispecialty Hospital"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group" style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12 }}>Official Admin Email</label>
                    <div className="input-wrap">
                      <span className="input-icon">✉</span>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin@sunrisehospital.com"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>Password</label>
                      <div className="input-wrap">
                        <span className="input-icon">🔒</span>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          required
                        />
                      </div>
                    </div>

                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>Confirm Password</label>
                      <div className="input-wrap">
                        <span className="input-icon">🔒</span>
                        <input
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className="login-btn btn-ripple"
                    type="submit"
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', cursor: loading ? 'wait' : 'pointer' }}
                  >
                    <span>{loading ? 'Creating Hospital Profile...' : 'Complete Registration'}</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </form>

                <p className="signup-link" style={{ marginTop: 14, fontSize: 13, textAlign: 'center' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rb-cyan)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
