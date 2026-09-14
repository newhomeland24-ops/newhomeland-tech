import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  FileText, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { settings, refreshSettings, loading: initialLoading } = useSettings();

  const [formData, setFormData] = useState({
    business_name: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    business_hours: '',
    hero_title: '',
    hero_subtitle: '',
    about_summary: '',
    about_full: '',
    footer_text: '',
    isMaintenance: false,
    maintenanceMessage: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state when settings context changes or loads
  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || '',
        tagline: settings.tagline || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        business_hours: settings.business_hours || '',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        about_summary: settings.about_summary || '',
        about_full: settings.about_full || '',
        footer_text: settings.footer_text || '',
        isMaintenance: Boolean(settings.isMaintenance),
        maintenanceMessage: settings.maintenanceMessage || ''
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.put('/api/admin/settings', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data?.success || res.status === 200) {
        // Trigger instantaneous app-wide state refresh
        await refreshSettings();
        setSuccessMsg('Broker & site configuration updated successfully!');
        toast.success('Configuration saved & synchronized in real time!');
      } else {
        throw new Error(res.data?.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      const msg = err.response?.data?.message || err.message || 'An error occurred while saving configuration.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || '',
        tagline: settings.tagline || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        business_hours: settings.business_hours || '',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        about_summary: settings.about_summary || '',
        about_full: settings.about_full || '',
        footer_text: settings.footer_text || '',
        isMaintenance: Boolean(settings.isMaintenance),
        maintenanceMessage: settings.maintenanceMessage || ''
      });
      toast('Form reset to active settings');
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#d49a3f' }} />
        <p style={{ fontWeight: 600 }}>Loading active broker settings...</p>
      </div>
    );
  }

  const cleanWhatsappPreview = (formData.whatsapp || '').replace(/[^\d]/g, '');
  const cleanPhonePreview = (formData.phone || '').replace(/[^\d+]/g, '');

  return (
    <div className="admin-settings-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Heading Banner */}
      <div className="admin-heading-bar" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="admin-main-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={26} color="#d49a3f" />
            <span>Broker & Site Configuration</span>
          </h1>
          <p className="admin-main-subtitle">
            Manage company branding, direct contact channels, click-to-action endpoints, and public text content. All modifications update instantaneously across the portal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="btn btn-outline"
            style={{ borderRadius: '10px', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn btn-gold"
            style={{ borderRadius: '10px', padding: '0.55rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckCircle2 size={20} color="#16a34a" />
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* SECTION 1: COMPANY IDENTITY */}
        <div className="admin-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <div style={{ padding: '0.45rem', background: 'rgba(212, 154, 63, 0.12)', borderRadius: '8px', color: '#d49a3f' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>1. Company Identity & Branding</h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Primary business name and promotional tagline displayed on navigation bars, sidebar, and tab titles.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Business Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="form-input"
                placeholder="Business Name"
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                Appears in Navbar, Admin Header, and browser tab titles.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Company Tagline <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="form-input"
                placeholder="Company Tagline"
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                Short slogan displayed beneath the brand title.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: DIRECT CONTACT CHANNELS */}
        <div className="admin-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <div style={{ padding: '0.45rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '8px', color: '#10b981' }}>
              <Phone size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>2. Direct Contact Channels</h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Automated click-to-call, WhatsApp endpoints, customer support email, and office location.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Phone */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} color="#2563eb" />
                <span>Primary Phone Number</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Primary Phone Number"
              />
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>Dialer link:</span>
                <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#2563eb' }}>tel:{cleanPhonePreview}</code>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <WhatsAppIcon size={15} color="#16a34a" />
                <span>WhatsApp Contact Number</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="form-input"
                placeholder="WhatsApp Contact Number"
              />
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>WhatsApp link:</span>
                <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#16a34a' }}>wa.me/{cleanWhatsappPreview}</code>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="#d97706" />
                <span>Support Email Address</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Support Email Address"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            {/* Address */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} color="#ef4444" />
                <span>Office / Brokerage Address</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="Office / Brokerage Address"
              />
            </div>

            {/* Business Hours */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="#8b5cf6" />
                <span>Operating Business Hours</span> <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="business_hours"
                value={formData.business_hours}
                onChange={handleChange}
                className="form-input"
                placeholder="Operating Business Hours"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: HOMEPAGE HERO & ABOUT TEXTS */}
        <div className="admin-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <div style={{ padding: '0.45rem', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '8px', color: '#3b82f6' }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>3. Homepage Hero & About Texts</h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Lead headline banners, company value propositions, advisory mission text, and legal footer disclaimer.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Homepage Hero Headline <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="hero_title"
                value={formData.hero_title}
                onChange={handleChange}
                className="form-input"
                placeholder="Homepage Hero Headline"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Homepage Hero Subtitle <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={2}
                required
                name="hero_subtitle"
                value={formData.hero_subtitle}
                onChange={handleChange}
                className="form-input"
                placeholder="Homepage Hero Subtitle"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                About Summary <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="about_summary"
                value={formData.about_summary}
                onChange={handleChange}
                className="form-input"
                placeholder="About Summary"
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                Displayed in the footer about column and card intros.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                About Full Story & Advisory Mission <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={4}
                required
                name="about_full"
                value={formData.about_full}
                onChange={handleChange}
                className="form-input"
                placeholder="About Full Story & Advisory Mission"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Footer Legal Disclaimer & Copyright <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                name="footer_text"
                value={formData.footer_text}
                onChange={handleChange}
                className="form-input"
                placeholder="Footer Legal Disclaimer & Copyright"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PORTAL MAINTENANCE TOGGLE */}
        <div className="admin-card" style={{ padding: '1.75rem', borderRadius: '14px', borderLeft: formData.isMaintenance ? '4px solid #d97706' : '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.45rem', background: formData.isMaintenance ? 'rgba(217, 119, 6, 0.12)' : 'rgba(16, 185, 129, 0.12)', borderRadius: '8px', color: formData.isMaintenance ? '#d97706' : '#10b981' }}>
                {formData.isMaintenance ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>4. Public Portal Maintenance Mode</h2>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  When maintenance mode is active, public site visitors see the maintenance message. Admin console remains accessible.
                </p>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <input
                type="checkbox"
                name="isMaintenance"
                checked={formData.isMaintenance}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#d49a3f' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.isMaintenance ? '#b45309' : '#15803d' }}>
                {formData.isMaintenance ? 'Maintenance Mode ENABLED' : 'Public Site LIVE (Normal)'}
              </span>
            </label>
          </div>

          {formData.isMaintenance && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                Maintenance Announcement Message
              </label>
              <textarea
                rows={2}
                name="maintenanceMessage"
                value={formData.maintenanceMessage}
                onChange={handleChange}
                className="form-input"
                placeholder="Maintenance Announcement Message"
              />
            </div>
          )}
        </div>

        {/* Bottom Save Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="btn btn-outline"
            style={{ borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: 600 }}
          >
            Cancel / Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-gold"
            style={{ borderRadius: '10px', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
