import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const rawPhone = settings.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const email = settings.email || 'contact@apexlandmark.com';
  const address = settings.address || 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR';
  const hours = settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment';
  const businessName = settings.business_name || 'NewHomeDevelopers';
  const tagline = settings.tagline || 'Your Ground. Your Future.';
  const aboutSummary = settings.about_summary || 'Your trusted partner in premium land and real estate brokerage.';
  const footerText = settings.footer_text || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;

  return (
    <footer className="site-footer mt-auto">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: About Broker */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-icon">
                <Building2 size={24} />
              </div>
              <div className="brand-text">
                <span className="brand-title" style={{ fontSize: '1.2rem' }}>{businessName}</span>
                <span className="brand-subtitle">{tagline}</span>
              </div>
            </div>
            <p className="footer-about">
              {aboutSummary}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#e5b364', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> Verified Professional Brokerage
            </div>
          </div>

          {/* Col 2: Property Types */}
          <div>
            <h4 className="footer-col-title">Property Types</h4>
            <ul className="footer-links">
              <li><Link to="/properties" className="footer-link">Residential Plots</Link></li>
              <li><Link to="/properties" className="footer-link">Commercial Plots</Link></li>
              <li><Link to="/properties" className="footer-link">Luxury Villas</Link></li>
              <li><Link to="/properties" className="footer-link">Agricultural & Industrial Land</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal Disclaimer */}
          <div>
            <h4 className="footer-col-title">Legal Disclaimer</h4>
            <p className="footer-about" style={{ fontSize: '0.85rem' }}>
              All property details are provided for information purposes only. Boundaries, zoning certificates, and municipal approvals must be independently verified prior to executing transactions.
            </p>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="footer-col-title">Broker Contact</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{address}</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href={`tel:${cleanPhone}`} style={{ color: 'inherit' }}>{rawPhone}</a>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>{hours}</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>{footerText}</p>
        </div>
      </div>
    </footer>
  );
}
