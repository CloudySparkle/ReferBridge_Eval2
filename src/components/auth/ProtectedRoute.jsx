import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--rb-dark, #061826)', color: 'var(--rb-teal, #14e4b8)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(20,228,184,0.2)', borderTopColor: 'var(--rb-teal, #14e4b8)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: 16, fontFamily: 'var(--font-mono, monospace)', fontSize: 13, letterSpacing: '0.1em' }}>AUTHENTICATING REFERBRIDGE SESSION...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--rb-red, #ff5465)' }}>
        <h2>Access Restricted</h2>
        <p>This section requires Administrator privileges.</p>
      </div>
    );
  }

  return children;
}
