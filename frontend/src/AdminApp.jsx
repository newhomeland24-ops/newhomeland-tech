import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './admin/components/ErrorBoundary';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import { Toaster } from 'react-hot-toast';

function AdminApp() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AdminApp;
