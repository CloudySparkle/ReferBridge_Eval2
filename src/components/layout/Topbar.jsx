import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function Topbar({ eyebrow = 'HOSPITAL REFERRAL NETWORK', title = 'Dashboard', rightContent = null }) {
  const { profile, user, isDemoMode } = useAuth();
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Administrator';
  const email = user?.email || profile?.email || 'admin@referbridge.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Backend & Environment notice banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 18px',
          background: isSupabaseConfigured
            ? 'rgba(20, 228, 184, 0.08)'
            : 'rgba(245, 183, 56, 0.12)',
          borderBottom: isSupabaseConfigured
            ? '1px solid rgba(20, 228, 184, 0.25)'
            : '1px solid rgba(245, 183, 56, 0.35)',
          color: isSupabaseConfigured ? 'var(--rb-teal, #14e4b8)' : '#f5b738',
          fontSize: '11px',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.04em'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isSupabaseConfigured ? '#14e4b8' : '#f5b738',
              boxShadow: `0 0 8px ${isSupabaseConfigured ? '#14e4b8' : '#f5b738'}`
            }}
          />
          <span>
            {isSupabaseConfigured
              ? 'SUPABASE POSTGRESQL & AUTH ACTIVE'
              : 'EVALUATION DEMO MODE ACTIVE (Configure .env for Live Supabase & Google Maps)'}
          </span>
        </div>
        <div>
          <span style={{ opacity: 0.8 }}>EVALUATION 1–2 INTEGRATION</span>
        </div>
      </div>

      <header className="topbar fade-in-up" style={{ padding: '20px 32px' }}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 style={{ margin: 0 }}>{title}</h1>
        </div>

        <div className="topbar-quick-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {rightContent}

          <div
            className="admin-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: 30,
              background: 'rgba(8,24,40,0.65)',
              border: '1px solid var(--rb-border, rgba(56,198,232,0.2))'
            }}
          >
            <span
              className="admin-avatar"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--rb-teal, #14e4b8), var(--rb-cyan, #22c8ff))',
                color: '#061826',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              {initial}
            </span>
            <div>
              <div
                className="admin-name"
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--rb-text-main, #f0f7fd)' }}
              >
                {displayName}
              </div>
              <div
                className="admin-email"
                style={{ fontSize: 11, color: 'var(--rb-text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)' }}
              >
                {email}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
