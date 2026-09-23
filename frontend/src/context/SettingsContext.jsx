import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';

export const DEFAULT_SETTINGS = {
  business_name: 'NewHomeDevelopers',
  tagline: 'Your Ground. Your Future.',
  phone: '+91 98765 43210',
  whatsapp: '',
  email: 'contact@newhomedevelopers.com',
  address: 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR',
  business_hours: 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment',
  hero_title: 'Find Your Perfect Plot, Villa & Dream Home',
  hero_subtitle: 'Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.',
  about_summary: 'Your trusted partner in premium land and real estate brokerage. Your Ground. Your Future.',
  about_full: 'We are dedicated to providing the best real estate services, ensuring 100% legal title clearance and securing your future with verified plots, villas, and commercial land.',
  footer_text: '© 2026 NewHomeDevelopers Brokerage. All rights reserved.',
  isMaintenance: false,
  maintenanceMessage: 'Our website is currently undergoing scheduled maintenance. Please connect with our team directly on WhatsApp for verified properties, floor plans, and site visits.',
  propertyTypes: []
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  error: null,
  refreshSettings: async () => {}
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get('/api/settings');
      const data = res.data?.data || res.data;
      if (data && typeof data === 'object') {
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.error('SettingsProvider: Failed to load site settings, using defaults.', err);
      setError('Unable to fetch latest broker settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync browser tab title dynamically with branding settings
  useEffect(() => {
    if (settings.business_name) {
      document.title = `${settings.business_name} | ${settings.tagline || 'Real Estate Portal'}`;
    }
  }, [settings.business_name, settings.tagline]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
