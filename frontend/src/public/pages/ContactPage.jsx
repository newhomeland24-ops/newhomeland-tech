import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <main className="flex-grow bg-gray-50 py-12 min-h-[60vh]">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Contact Us</span>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Reach out to us for any inquiries.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center max-w-2xl mx-auto">
          <div className="flex flex-col gap-6 items-center">
            <a href="tel:+919876543210" className="btn btn-outline flex items-center gap-2">
              <Phone size={20} />
              <span>+91 98765 43210</span>
            </a>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`} target="_blank" rel="noreferrer" className="btn btn-gold flex items-center gap-2">
              <MessageCircle size={20} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
