import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Chatbot from '../Chatbot';

export default function AppLayout() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>
      {/* Floating AI Assistant — available on all pages */}
      <Chatbot />
    </div>
  );
}
