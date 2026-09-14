import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { useSettings } from '../../context/SettingsContext';

const ContactPage = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'NewHomeDevelopers';
  const rawPhone = settings.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const rawWhatsapp = settings.whatsapp || '+919876543210';
  const cleanWhatsapp = rawWhatsapp.replace(/[^\d]/g, '');
  const email = settings.email || 'contact@apexlandmark.com';
  const address = settings.address || 'Plot No. 42, Sector 14, Commercial Complex, Delhi NCR';
  const hours = settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment';

  return (
    <main className="flex-grow bg-gray-50 py-12 min-h-[60vh]">
      <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-tag" style={{ color: '#d49a3f', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Direct Communication
          </span>
          <h1 className="section-title" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.6rem 0' }}>
            Contact {businessName}
          </h1>
          <p className="section-subtitle" style={{ color: '#64748b', fontSize: '1rem' }}>
            Connect with our certified broker team for title paperwork, pricing negotiations, and private site visits.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm mb-8">
          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <a 
              href={`tel:${cleanPhone}`} 
              className="btn btn-outline flex items-center justify-center gap-2 w-full sm:w-auto"
              style={{ padding: '0.85rem 1.8rem', borderRadius: '12px', fontWeight: 700 }}
            >
              <Phone size={20} color="#2563eb" />
              <span>Call: {rawPhone}</span>
            </a>
            {cleanWhatsapp && (
              <a 
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${businessName}, I would like to inquire about available properties.`)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-gold flex items-center justify-center gap-2 w-full sm:w-auto"
                style={{ padding: '0.85rem 1.8rem', borderRadius: '12px', fontWeight: 700 }}
              >
                <WhatsAppIcon size={20} />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Office Location</h3>
                <p className="text-gray-600 text-sm">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Email Inquiries</h3>
                <a href={`mailto:${email}`} className="text-blue-600 text-sm font-medium hover:underline">{email}</a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 md:col-span-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Advisory & Operating Hours</h3>
                <p className="text-gray-600 text-sm">{hours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
