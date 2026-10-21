import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', iconText = null, duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const defaultIcons = {
      success: '✓',
      info: 'ℹ',
      warning: '⚠',
      danger: '✕'
    };
    const icon = iconText || defaultIcons[type] || '✓';

    const newToast = { id, message, type, icon };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  // Synchronize with window.showToast so legacy Vanilla JS calls also trigger React toasts
  useEffect(() => {
    window.showToast = (message, type = 'success', iconText = null) => {
      showToast(message, type, iconText);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="rb-toast-container" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rb-toast rb-toast-${toast.type} fade-in-up`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderRadius: 10,
              background: toast.type === 'danger' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : toast.type === 'info' ? '#0ea5e9' : '#10b981',
              color: '#ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              minWidth: 280,
              maxWidth: 420,
              fontFamily: 'var(--font-body, "Inter", sans-serif)',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700 }}>{toast.icon}</div>
            <div style={{ flex: 1 }}>{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: '0 4px'
              }}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
