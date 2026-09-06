import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './admin/components/ErrorBoundary';
import AdminHeader from './admin/components/AdminHeader';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import { Toaster } from 'react-hot-toast';

function AdminApp() {
  useEffect(() => {
    document.title = 'Admin Portal | NewHomeLand';
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="admin-app-layout">
        <AdminHeader />
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default AdminApp;
