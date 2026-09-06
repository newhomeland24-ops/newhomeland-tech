import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Building2, Menu, X, ShieldCheck, MessageCircle } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const cleanWhatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">NewHomeLand</span>
            <span className="brand-subtitle">Your Ground. Your Future.</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I am inquiring about available properties.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="call-btn"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={18} color="#25d366" />
              <span>WhatsApp</span>
            </a>
          )}

          <Link to="/admin" className="btn btn-outline btn-sm" title="Admin Portal">
            <ShieldCheck size={16} />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
            end
          >
            Home
          </NavLink>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I am inquiring about available properties.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            <Link to="/admin" className="btn btn-dark btn-sm" onClick={() => setMobileOpen(false)}>
              <ShieldCheck size={16} /> Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
