import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ExternalLink, LogOut } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminHeader() {
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="site-header admin-site-header">
      <div className="container nav-container admin-nav-container">
        {/* Brand Logo - Redirects to Admin Home */}
        <Link to="/admin/dashboard" className="brand-logo" title="Admin Home">
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">NewHomeLand</span>
            <span className="brand-subtitle" style={{ color: '#d49a3f' }}>Operations Console</span>
          </div>
        </Link>

        {/* Header Actions */}
        <div className="admin-nav-actions">
          {/* Live Site Option Button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-header-link"
            title="Open Public Website in new tab"
          >
            <ExternalLink size={15} />
            <span>Live Site</span>
          </a>

          {/* Logout Button (When Authenticated) */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout-action-btn"
              title="End admin session"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
