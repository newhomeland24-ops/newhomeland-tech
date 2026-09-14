import React from 'react';
import { Building2, Shield, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const AboutPage = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'NewHomeDevelopers';
  const tagline = settings.tagline || 'Your Ground. Your Future.';
  const aboutSummary = settings.about_summary || 'Premier real estate advisory firm dedicated to assisting homebuyers, investors, and developers.';
  const aboutFull = settings.about_full || 'Premier real estate advisory firm dedicated to assisting homebuyers, investors, and developers in acquiring verified, legally cleared land, luxury villas, and high-value commercial properties with absolute transparency.';
  const rawPhone = settings.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

  return (
    <main className="flex-grow bg-gray-50 py-12 min-h-[60vh]">
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag" style={{ color: '#d49a3f', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            About Our Brokerage
          </span>
          <h1 className="section-title" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.6rem 0' }}>
            {businessName}
          </h1>
          <p className="section-subtitle" style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
            {tagline}
          </p>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm text-left mb-8">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(212, 154, 63, 0.15)', borderRadius: '10px', color: '#d49a3f' }}>
              <Building2 size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 m-0">Our Mission & Advisory Story</h2>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
            {aboutSummary}
          </p>

          <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-line text-base">
            {aboutFull}
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#b45309', fontWeight: 600 }}>
            <Shield size={20} color="#d49a3f" />
            <span>100% Encumbrance-Free & Legally Verified Registry Guarantee</span>
          </div>
        </div>

        {/* Location & Quick Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Brokerage Headquarters</h3>
              <p className="text-gray-600 text-sm">{settings.address || 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Advisory Hours</h3>
              <p className="text-gray-600 text-sm">{settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment'}</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default AboutPage;
