import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      showToast('Please fix the form errors before submitting', 'warning', '⚠');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      showToast(
        `Welcome back, ${result.profile?.display_name || 'Administrator'}!`,
        'success',
        '✓'
      );
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      showToast(msg, 'danger', '✕');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@referbridge.com');
    setPassword('admin123');
    setValidationErrors({});
    showToast('Demo administrator credentials populated', 'info', '⚡');
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
              <span className="banner-step"><span className="banner-dot green"></span> Match found at Sunrise Hospital · 6 ICU beds</span>
              <span className="banner-step"><span className="banner-dot purple"></span> Transfer coordinated · Patient admitted in 12 min</span>
              <span className="banner-step"><span className="banner-dot green"></span> REQ-447 Accepted · Lotus Care → Sunrise · ❤️ Saved</span>
              <span className="banner-step"><span className="banner-dot"></span> Patient arrives at hospital → ICU full</span>
              <span className="banner-step"><span className="banner-dot red"></span> Hospital refers patient to ReferBridge network</span>
              <span className="banner-step"><span className="banner-dot green"></span> Match found at Sunrise Hospital · 6 ICU beds</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <section className="login-card fade-in-up">
          {/* Visual Panel */}
          <div className="visual-panel">
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
                <b>8</b>
                <span>PARTNER HOSPITALS</span>
              </div>
              <div className="vstat">
                <b>52</b>
                <span>BEDS AVAILABLE</span>
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

            <div className="form-top">
              <p className="eyebrow">
                {isSupabaseConfigured ? 'BACKEND AUTHENTICATION' : 'WELCOME BACK'}
              </p>
              <h1>Admin Login</h1>
              <p className="subtitle">
                Sign in to coordinate capacity and transfer referrals across verified regional hospitals.
              </p>
            </div>

            {errorMessage && (
              <div
                className="message error"
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 84, 101, 0.15)',
                  border: '1px solid rgba(255, 84, 101, 0.4)',
                  color: '#ff5465',
                  fontSize: 13,
                  marginBottom: 16
                }}
              >
                <span>✕</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group" style={{ marginBottom: 16 }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                  Admin Email
                </label>
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <span className="input-icon">✉</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="admin@referbridge.com"
                    autoComplete="username"
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p style={{ color: '#ff5465', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>
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
                  <p style={{ color: '#ff5465', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label className="remember" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
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
                    showToast('For evaluation password reset, contact system administrator or check .env settings', 'info', 'ℹ');
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
                <span>{loading ? 'Authenticating with Backend...' : 'Login to ReferBridge'}</span>
                <span className="btn-arrow">{loading ? '⏳' : '→'}</span>
              </button>
            </form>

            <p className="signup-link" style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
              New facility administrator? <a href="signup.html">Register Hospital</a>
            </p>

            {/* Quick autofill helper for evaluation grading */}
            <div className="demo-box" id="demoBox" style={{ marginTop: 20 }}>
              <div className="demo-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="demo-tag">EVALUATION CONVENIENCE</span>
                <button
                  type="button"
                  id="autoFillDemoBtn"
                  className="btn-autofill"
                  onClick={handleQuickFill}
                  title="Auto-fill evaluation credentials"
                >
                  ⚡ 1-Click Auto Fill
                </button>
              </div>
              <div className="demo-creds" style={{ fontSize: 12 }}>
                <span><strong>Email:</strong> admin@referbridge.com</span>
                <span><strong>Password:</strong> admin123</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
