import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';

export default function Footer() {
  const cleanPhone = '+12345678900'.replace(/[^\d+]/g, '');

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
                <span className="brand-title" style={{ fontSize: '1.2rem' }}>NewHomeLand</span>
                <span className="brand-subtitle">Realty & Advisory</span>
              </div>
            </div>
            <p className="footer-about">
              Your trusted partner in premium land and real estate brokerage. Your Ground. Your Future.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#e5b364', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> Verified Professional Brokerage
            </div>
          </div>

          {/* Col 2: Property Types */}
          <div>
            <h4 className="footer-col-title">Property Types</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Residential Plots</Link></li>
              <li><Link to="/" className="footer-link">Commercial Plots</Link></li>
              <li><Link to="/" className="footer-link">Luxury Villas</Link></li>
              <li><Link to="/" className="footer-link">Agricultural & Industrial Land</Link></li>
            </ul>
          </div>

          {/* Col 3: Key Locations */}
          <div>
            <h4 className="footer-col-title">Legal Disclaimer</h4>
            <p className="footer-about" style={{ fontSize: '0.85rem' }}>
              All property details are provided for information purposes only. Boundaries and municipal approvals must be independently verified by the buyer before any transaction.
            </p>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="footer-col-title">Broker Contact</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>123 Real Estate Avenue, Business District, City 10001</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href={`tel:${cleanPhone}`} style={{ color: 'inherit' }}>+1 234 567 8900</a>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <a href={`mailto:contact@newhomeland.com`} style={{ color: 'inherit' }}>contact@newhomeland.com</a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Mon - Sat: 9:30 AM - 7:30 PM</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NewHomeLand Brokerage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
