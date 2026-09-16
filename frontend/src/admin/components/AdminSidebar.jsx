import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  MessageSquare, 
  Calendar, 
  Settings, 
  ExternalLink, 
  X
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSidebar({
  activeTab = 'dashboard',
  onTabChange = () => {},
  onAddProperty = () => {},
  onToggleMaintenance = () => {},
  isOpen = false,
  onClose = () => {}
}) {
  const { settings } = useSettings();

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

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Brand Header */}
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand-box">
            <div className="sidebar-brand-icon-box">
              <Shield size={22} className="sidebar-shield-icon" />
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
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
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
