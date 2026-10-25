import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HospitalNetwork from './pages/HospitalNetwork';
import PatientRecords from './pages/PatientRecords';
import ReferralRequests from './pages/ReferralRequests';
import HospitalMap from './pages/HospitalMap';

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Public Login & Register Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="network" element={<HospitalNetwork />} />
                <Route path="map" element={<HospitalMap />} />
                <Route path="patients" element={<PatientRecords />} />
                <Route path="requests" element={<ReferralRequests />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </Provider>
  );
}
