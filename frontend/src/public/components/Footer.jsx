import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import axios from 'axios';

export default function Footer() {
  const { settings } = useSettings();
  const [propertyTypes, setPropertyTypes] = useState([]);

  useEffect(() => {
    const fetchActiveTypes = async () => {
      try {
        const res = await axios.get('/api/properties/types/active');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setPropertyTypes(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching property types for footer:', err);
      }
    };
    fetchActiveTypes();
  }, []);

  const rawPhone = settings.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const rawWhatsapp = settings.whatsapp || '';
  const cleanWhatsapp = rawWhatsapp.replace(/[^\d]/g, '');
  
  const address = settings.address || 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR';
  const hours = settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment';
  const businessName = settings.business_name || 'NewHomeDevelopers';
  const tagline = settings.tagline || 'Your Ground. Your Future.';
  const aboutSummary = settings.about_summary || 'Your trusted partner in premium land and real estate brokerage.';
  const footerText = settings.footer_text || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
  const facebook = settings.social_links?.facebook;
  const instagram = settings.social_links?.instagram;

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
              <li>
                <Link to="/properties" className="footer-link">All Properties</Link>
              </li>
              {propertyTypes.map((type) => (
                <li key={type}>
                  <Link to={`/properties?property_type=${encodeURIComponent(type)}`} className="footer-link">
                    {type}
                  </Link>
                </li>
              ))}
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
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{address}</span>
            </div>
            {facebook && (
              <div className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              </div>
            )}
            {instagram && (
              <div className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            )}
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href={`tel:${cleanPhone}`}>Phone</a>
            </div>
            <div className="footer-contact-item">
              <WhatsAppIcon size={18} />
              <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
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
