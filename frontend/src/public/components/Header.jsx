import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Building2, Menu, X, Phone, MessageCircle } from 'lucide-react';

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
          <NavLink to="/properties" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Properties
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Contact Us
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

          <a href="tel:+919876543210" className="call-btn" title="Call Us">
            <Phone size={18} />
            <span>+91 98765 43210</span>
          </a>

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
          <NavLink
            to="/properties"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Properties
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Contact Us
          </NavLink>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I am inquiring about available properties.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <MessageCircle size={16} color="#25d366" /> WhatsApp
              </a>
            )}
            <a href="tel:+919876543210" className="btn btn-outline btn-sm">
              <Phone size={16} /> +91 98765 43210
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
