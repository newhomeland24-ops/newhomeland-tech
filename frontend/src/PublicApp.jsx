import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';
import WhatsAppIcon from './components/WhatsAppIcon';
import ErrorBoundary from './public/components/ErrorBoundary';
import Header from './public/components/Header';
import Footer from './public/components/Footer';

import HomePage from './public/pages/HomePage';
import PropertyDetailPage from './public/pages/PropertyDetailPage';
import PropertiesPage from './public/pages/PropertiesPage';
import AboutPage from './public/pages/AboutPage';
import ContactPage from './public/pages/ContactPage';
import MaintenancePage from './public/pages/MaintenancePage';
import { useSettings } from './context/SettingsContext';

function PublicApp() {
  const { settings, loading: settingsLoading } = useSettings();
  const location = useLocation();

  const rawPhone = settings.phone || '+91 98765 43210';
  const rawWhatsapp = settings.whatsapp || '+919876543210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const cleanWhatsapp = rawWhatsapp.replace(/[^\d]/g, '');
  const businessName = settings.business_name || 'NewHomeDevelopers';

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth <= 768) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          setIsScrollingDown(true);
        } else if (currentScrollY < lastScrollY.current) {
          setIsScrollingDown(false);
        }
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = `${businessName} | ${settings.hero_title || 'Verified Plots, Luxury Villas & Dream Homes'}`;
    } else if (path === '/properties') {
      document.title = `Verified Land & Properties Portfolio | ${businessName}`;
    } else if (path === '/about') {
      document.title = `About Our Brokerage & Title Guarantee | ${businessName}`;
    } else if (path === '/contact') {
      document.title = `Contact Principal Broker & Schedule Site Visit | ${businessName}`;
    } else if (path.startsWith('/property/') || path.startsWith('/properties/')) {
      document.title = `Property Overview & Verification | ${businessName}`;
    } else {
      document.title = `${businessName} | ${settings.tagline || 'Your Ground. Your Future.'}`;
    }
  }, [location.pathname, businessName, settings.hero_title, settings.tagline]);

  if (!settingsLoading && settings.isMaintenance) {
    return (
      <ErrorBoundary>
        <MaintenancePage message={settings.maintenanceMessage} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen w-full max-w-full bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/property/:propertyId" element={<PropertyDetailPage />} />
          <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
        </Routes>
        <Footer />

        {/* Floating Action Buttons */}
        <div className={`floating-actions ${isScrollingDown ? 'hide-on-scroll' : ''}`}>
          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${businessName}, I would like to inquire about available properties and plots.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="float-btn whatsapp"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={26} />
            </a>
          )}

          <a
            href={`tel:${cleanPhone}`}
            className="float-btn phone"
            title={`Call Broker: ${rawPhone}`}
          >
            <Phone size={24} />
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default PublicApp;
