import React from 'react';
import WhatsAppIcon from '../../components/WhatsAppIcon';

const MaintenancePage = () => {
  const phone = (import.meta.env.VITE_WHATSAPP_NUMBER || '916005707121').replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hello NewHomeDevelopers, I would like to inquire about available properties and schedule a visit.')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Website is Under Maintenance
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-base">
          Our website is currently undergoing scheduled maintenance. Please connect with our team directly on WhatsApp for verified properties, floor plans, and site visits.
        </p>
        <a 
          href={whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"
        >
          <WhatsAppIcon size={24} />
          <span>Connect on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default MaintenancePage;
