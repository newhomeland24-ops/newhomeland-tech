import React from 'react';
import { Phone } from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { useSettings } from '../../context/SettingsContext';

const BottomStickyBar = () => {
  const { settings } = useSettings();

  const rawPhone = settings.phone || '+91 98765 43210';
  const rawWhatsapp = settings.whatsapp || '';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const cleanWhatsapp = rawWhatsapp.replace(/[^\d]/g, '');
  const businessName = settings.business_name || 'NewHomeDevelopers';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 p-3 flex gap-3">
      {cleanWhatsapp && (
        <a 
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${businessName}, I would like to inquire about available properties.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:bg-green-600 transition-colors"
        >
          <WhatsAppIcon size={20} />
          <span>WhatsApp</span>
        </a>
      )}
      <a 
        href={`tel:${cleanPhone}`}
        className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 active:bg-primary-700 transition-colors"
      >
        <Phone className="w-5 h-5" />
        <span>Call Broker</span>
      </a>
    </div>
  );
};

export default BottomStickyBar;
