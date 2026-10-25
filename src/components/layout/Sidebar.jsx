import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    showToast(`Switched to ${nextTheme} mode`, 'info', nextTheme === 'light' ? '☀️' : '🌙');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of ReferBridge session', 'info', '🚪');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="brand">
        <img src="assets/referbridge-icon.png" alt="ReferBridge icon" className="brand-logo-img" />
        <span>
          Refer<span>Bridge</span>
          <small>HOSPITAL NETWORK</small>
        </span>
      </NavLink>

      <nav>
        {/* Legacy Home landing hub */}
        <a href="home.html" className="nav-link" data-tooltip="Home">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </a>

        {/* Migrated React Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          data-tooltip="Dashboard"
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        {/* Migrated React Hospital Network */}
        <NavLink
          to="/network"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          data-tooltip="Hospital Network"
        >
          <span className="nav-icon">🌐</span>
          <span>Hospital Network</span>
        </NavLink>

        {/* Live Map 4 Cities */}
        <NavLink
          to="/map"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          data-tooltip="Live Hospital Map"
        >
          <span className="nav-icon">🗺️</span>
          <span>Live Map</span>
        </NavLink>

        {/* Migrated React Patient Records */}
        <NavLink
          to="/patients"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          data-tooltip="Patient Records"
        >
          <span className="nav-icon">📋</span>
          <span>Patient Records</span>
        </NavLink>

        {/* Migrated React Referral Requests */}
        <NavLink
          to="/requests"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          data-tooltip="Incoming Requests"
        >
          <span className="nav-icon">📥</span>
          <span>Incoming Requests</span>
        </NavLink>

        {/* Legacy sub-pages */}
        <a href="beds.html" className="nav-link" data-tooltip="Bed Management">
          <span className="nav-icon">🛏️</span>
          <span>Bed Management</span>
        </a>

        <a href="profile.html" className="nav-link" data-tooltip="Hospital Profile">
          <span className="nav-icon">🏥</span>
          <span>Hospital Profile</span>
        </a>

        <a href="analytics.html" className="nav-link" data-tooltip="Analytics">
          <span className="nav-icon">📈</span>
          <span>Analytics</span>
        </a>
      </nav>

      <div className="side-bottom">
        <button
          id="themeToggle"
          className="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          title="Switch between Dark and Light mode"
        >
          <span id="themeIcon">{theme === 'light' ? '☀️' : '🌙'}</span>
          <span>Theme</span>
        </button>

        <button
          id="logoutBtn"
          className="logout-btn"
          type="button"
          onClick={handleLogout}
          title="Sign out of ReferBridge"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
