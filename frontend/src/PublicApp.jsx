import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import ErrorBoundary from './public/components/ErrorBoundary';
import Header from './public/components/Header';
import Footer from './public/components/Footer';
import BottomStickyBar from './public/components/BottomStickyBar';
import HomePage from './public/pages/HomePage';
import PropertyDetailPage from './public/pages/PropertyDetailPage';
import PropertiesPage from './public/pages/PropertiesPage';
import AboutPage from './public/pages/AboutPage';
import ContactPage from './public/pages/ContactPage';

function PublicApp() {
  const location = useLocation();
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '+919876543210';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const cleanWhatsapp = phone.replace(/[^\d]/g, '');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'NewHomeLand | Verified Plots, Luxury Villas & Dream Homes';
    } else if (path === '/properties') {
      document.title = 'Verified Land & Properties Portfolio | NewHomeLand';
    } else if (path === '/about') {
      document.title = 'About Our Brokerage & Title Guarantee | NewHomeLand';
    } else if (path === '/contact') {
      document.title = 'Contact Principal Broker & Schedule Site Visit | NewHomeLand';
    } else if (path.startsWith('/property/')) {
      document.title = 'Property Overview & Verification | NewHomeLand';
    } else {
      document.title = 'NewHomeLand | Your Ground. Your Future.';
    }
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
        <Footer />
        <BottomStickyBar />

        {/* Floating Action Buttons */}
        <div className="floating-actions">
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I would like to inquire about available properties and plots.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="float-btn whatsapp"
            title="Chat on WhatsApp"
          >
            <MessageCircle size={26} />
          </a>

          <a
            href={`tel:${cleanPhone}`}
            className="float-btn phone"
            title={`Call Broker: ${phone}`}
          >
            <Phone size={24} />
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default PublicApp;
