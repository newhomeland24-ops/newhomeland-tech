import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  MessageSquare, 
  Calendar, 
  Settings, 
  ExternalLink, 
  X,
  LogOut
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSidebar({
  activeTab = 'dashboard',
  onTabChange = () => {},
  onAddProperty = () => {},
  onToggleMaintenance = () => {},
  isOpen = false,
  onClose = () => {},
  enquiriesBadgeCount = 0,
  appointmentsBadgeCount = 0,
  isMaintenanceActive = false,
  onLogout = () => {}
}) {
  const { settings } = useSettings();
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    // Close if swiped left by at least 50px
    if (diff > 50) {
      onClose();
    }
    setTouchStartX(null);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        onTabChange('dashboard');
        onClose();
      }
    },
    {
      id: 'properties',
      label: 'All Properties',
      icon: Building2,
      onClick: () => {
        onTabChange('properties');
        onClose();
      }
    },
    {
      id: 'add-property',
      label: 'Add Property',
      icon: PlusCircle,
      onClick: () => {
        onTabChange('add-property');
        onClose();
      }
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: MessageSquare,
      onClick: () => {
        onTabChange('enquiries');
        onClose();
      }
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      onClick: () => {
        onTabChange('appointments');
        onClose();
      }
    },
    {
      id: 'settings',
      label: 'Broker Settings',
      icon: Settings,
      onClick: () => {
        onTabChange('settings');
        onClose();
      }
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`admin-sidebar ${isOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Brand Header */}
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand-box">
            <div className="sidebar-brand-icon-box">
              <Building2 size={22} className="sidebar-shield-icon" />
            </div>
            <div 
              className="sidebar-brand-text" 
              style={{ minWidth: 0, overflow: 'hidden' }}
              title={`${settings.business_name || 'NewHomeDevelopers'} — ${settings.tagline || 'REALTY PORTAL'}`}
            >
              <span 
                className="sidebar-company-title"
                style={{ 
                  display: 'block', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {settings.business_name || 'NewHomeDevelopers'}
              </span>
              <span 
                className="sidebar-company-subtitle"
                style={{ 
                  display: 'block', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {settings.tagline || 'REALTY PORTAL'}
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            type="button" 
            className="sidebar-mobile-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.id === 'enquiries' 
              ? enquiriesBadgeCount 
              : item.id === 'appointments' 
                ? appointmentsBadgeCount 
                : 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
                {badgeCount > 0 && (
                  <span className={`sidebar-badge-count ${item.id === 'enquiries' ? 'enquiry' : 'appointment'}`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Middle Spacer */}
        <div className="sidebar-spacer" />

        {/* View Public Site Link */}
        <div className="sidebar-secondary-nav">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-nav-item external-link"
            title="Open Live Public Website"
          >
            <ExternalLink size={17} className="sidebar-nav-icon" />
            <span className="sidebar-nav-label">View Public Site</span>
          </a>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div className="portal-status-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span className={`portal-status-dot ${isMaintenanceActive ? 'maintenance' : ''}`} />
              <span style={{ color: isMaintenanceActive ? '#d97706' : '#10b981', fontWeight: 600 }}>{isMaintenanceActive ? 'Maint' : 'Live'}</span>
            </div>
            
            <button
              type="button"
              onClick={onLogout}
              className="sidebar-signout-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Sign Out of Admin Console"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="sidebar-copyright-box">
          <p className="sidebar-copyright-brand">
            © {new Date().getFullYear()} {settings.business_name || 'NewHomeDevelopers'}
          </p>
          <p className="sidebar-copyright-sub">All rights reserved.</p>
        </div>
      </aside>
    </>
  );
}
