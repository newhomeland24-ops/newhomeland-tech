import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ExternalLink, LogOut } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useSettings } from '../../context/SettingsContext';

export default function AdminHeader() {
  const { isAuthenticated, logout } = useAdminAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="site-header admin-site-header">
      <div className="container nav-container admin-nav-container">
        {/* Brand Logo - Redirects to Admin Home */}
        <Link to="/admin/dashboard" className="sidebar-brand-box" title="Admin Home" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0 }}>
          <div className="sidebar-brand-icon-box">
            <Building2 size={22} className="sidebar-shield-icon" />
          </div>
          <div 
            className="sidebar-brand-text" 
            style={{ minWidth: 0, overflow: 'hidden', textAlign: 'left' }}
          >
            <span 
              className="sidebar-company-title"
              style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {settings.business_name || 'NewHomeDevelopers'}
            </span>
            <span 
              className="sidebar-company-subtitle"
              style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {settings.tagline || 'YOUR HOME. YOUR FUTURE.'}
            </span>
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
