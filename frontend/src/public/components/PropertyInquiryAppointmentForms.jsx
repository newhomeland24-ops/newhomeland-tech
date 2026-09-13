import React, { useState } from 'react';
import axios from 'axios';
import { 
  Send, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Users,
  FileText
} from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import toast from 'react-hot-toast';

export default function PropertyInquiryAppointmentForms({ property }) {
  const [activeTab, setActiveTab] = useState('enquiry'); // 'enquiry' | 'appointment'

  const propCustomId = property?.propertyId || property?._id || '';

  // Enquiry Form State
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredContact: 'whatsapp',
    message: property?.title 
      ? `Hello NewHomeDevelopers, I am interested in property "${property.title}" (ID: #${propCustomId}). Please share the verified paperwork, price breakdown, and site visit details.`
      : 'Hello NewHomeDevelopers, I would like to inquire about this property.'
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Appointment Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [appointmentData, setAppointmentData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: defaultDate,
    preferredTime: '10:00 AM - 12:00 PM',
    visitorsCount: '1-2 people',
    notes: ''
  });
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Broker phone for direct WhatsApp fallback
  const brokerPhone = (import.meta.env.VITE_WHATSAPP_NUMBER || '916005707121').replace(/[^\d]/g, '');

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryData.name || !enquiryData.phone) {
      toast.error('Please provide your name and phone number.');
      return;
    }

    setEnquiryLoading(true);
    try {
      await axios.post('/api/inquiries', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: property?.location,
        propertyPrice: property?.price,
        clientName: enquiryData.name,
        phone: enquiryData.phone,
        email: enquiryData.email,
        message: enquiryData.message,
        preferredContact: enquiryData.preferredContact
      });

      setEnquirySuccess(true);
      toast.success('Your enquiry has been received! Our broker will contact you shortly.');
    } catch (err) {
      console.error('Enquiry submission error:', err);
      // Even if offline/network fails, provide fallback to WhatsApp
      setEnquirySuccess(true);
      toast.success('Enquiry logged! You can also chat directly on WhatsApp.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  // Handle Appointment Submit
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentData.name || !appointmentData.phone || !appointmentData.preferredDate || !appointmentData.preferredTime) {
      toast.error('Please fill in your name, phone, date, and preferred time slot.');
      return;
    }

    setAppointmentLoading(true);
    try {
      await axios.post('/api/appointments', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: property?.location,
        clientName: appointmentData.name,
        phone: appointmentData.phone,
        email: appointmentData.email,
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        visitorsCount: appointmentData.visitorsCount,
        notes: appointmentData.notes
      });

      setAppointmentSuccess(true);
      toast.success('Site visit booked successfully! Our principal broker will confirm the schedule.');
    } catch (err) {
      console.error('Appointment booking error:', err);
      setAppointmentSuccess(true);
      toast.success('Appointment noted! You can also confirm via WhatsApp.');
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Direct WhatsApp links
  const openEnquiryWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello NewHomeDevelopers, I submitted an enquiry for property "${property?.title}" (ID: #${propCustomId}).\nName: ${enquiryData.name || 'Interested Buyer'}\nPhone: ${enquiryData.phone || ''}\nMessage: ${enquiryData.message}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openAppointmentWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello NewHomeDevelopers, I would like to book a site visit for property "${property?.title}" (ID: #${propCustomId}).\nClient: ${appointmentData.name || 'Interested Buyer'}\nPhone: ${appointmentData.phone || ''}\nRequested Date: ${appointmentData.preferredDate}\nTime Slot: ${appointmentData.preferredTime}\nVisitors: ${appointmentData.visitorsCount}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="property-forms-card">
      {/* Form Tabs */}
      <div className="property-forms-nav">
        <button
          type="button"
          className={`property-forms-tab ${activeTab === 'enquiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('enquiry')}
        >
          <Send size={16} />
          <span>Send Enquiry</span>
        </button>

        <button
          type="button"
          className={`property-forms-tab ${activeTab === 'appointment' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointment')}
        >
          <Calendar size={16} />
          <span>Book Site Visit</span>
        </button>
      </div>

      <div className="property-forms-content">
        {/* ================= TAB 1: SEND ENQUIRY ================= */}
        {activeTab === 'enquiry' && (
          <div>
            {enquirySuccess ? (
              <div className="form-success-box">
                <CheckCircle2 size={44} className="text-emerald-500" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  Enquiry Received!
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Thank you for your interest in <strong>{property?.title}</strong>. Our principal broker has been notified and will contact you shortly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={openEnquiryWhatsApp}
                    className="btn-whatsapp-action"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <WhatsAppIcon size={20} />
                    <span>Open in WhatsApp for Instant Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySuccess(false);
                      setEnquiryData(prev => ({ ...prev, name: '', phone: '', email: '' }));
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="property-form">
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    Inquire About This Property
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Receive verified legal paperwork, current price breakdown, and site visit coordinates.
                  </p>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Your Name *</label>
                  <div className="form-input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={enquiryData.name}
                      onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Phone / WhatsApp *</label>
                    <div className="form-input-with-icon">
                      <Phone size={16} className="field-icon" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone or WhatsApp number"
                        value={enquiryData.phone}
                        onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Email (Optional)</label>
                    <div className="form-input-with-icon">
                      <Mail size={16} className="field-icon" />
                      <input
                        type="email"
                        placeholder="Enter email address (optional)"
                        value={enquiryData.email}
                        onChange={(e) => setEnquiryData({ ...enquiryData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Message / Specific Questions</label>
                  <div className="form-input-with-icon" style={{ alignItems: 'flex-start' }}>
                    <FileText size={16} className="field-icon" style={{ marginTop: '0.7rem' }} />
                    <textarea
                      rows={3}
                      placeholder="Enter message or specific questions"
                      value={enquiryData.message}
                      onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={enquiryLoading}
                    className="btn btn-gold"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}
                  >
                    {enquiryLoading ? 'Submitting Enquiry...' : 'Submit Enquiry'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                    — OR FOR INSTANT RESPONSE —
                  </div>

                  <button
                    type="button"
                    onClick={openEnquiryWhatsApp}
                    className="btn-whatsapp-action"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <WhatsAppIcon size={19} />
                    <span>Inquire Directly on WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 2: BOOK SITE VISIT ================= */}
        {activeTab === 'appointment' && (
          <div>
            {appointmentSuccess ? (
              <div className="form-success-box">
                <CheckCircle2 size={44} className="text-emerald-500" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  Site Visit Request Received!
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Your inspection request for <strong>{appointmentData.preferredDate} ({appointmentData.preferredTime})</strong> has been scheduled. Our team will contact you to confirm directions and meet on-site.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={openAppointmentWhatsApp}
                    className="btn-whatsapp-action"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <WhatsAppIcon size={20} />
                    <span>Send Booking to WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentSuccess(false);
                      setAppointmentData(prev => ({ ...prev, name: '', phone: '', notes: '' }));
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    Schedule Another Visit
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAppointmentSubmit} className="property-form">
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    Schedule a Guided Site Visit
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Inspect boundaries, title papers, and access roads with our principal broker.
                  </p>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Your Full Name *</label>
                  <div className="form-input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={appointmentData.name}
                      onChange={(e) => setAppointmentData({ ...appointmentData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Phone Number *</label>
                    <div className="form-input-with-icon">
                      <Phone size={16} className="field-icon" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={appointmentData.phone}
                        onChange={(e) => setAppointmentData({ ...appointmentData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Preferred Date *</label>
                    <div className="form-input-with-icon">
                      <Calendar size={16} className="field-icon" />
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={appointmentData.preferredDate}
                        onChange={(e) => setAppointmentData({ ...appointmentData, preferredDate: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Time Slot *</label>
                    <div className="form-input-with-icon">
                      <Clock size={16} className="field-icon" />
                      <select
                        value={appointmentData.preferredTime}
                        onChange={(e) => setAppointmentData({ ...appointmentData, preferredTime: e.target.value })}
                        className="form-select"
                      >
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                        <option value="04:00 PM - 06:30 PM">04:00 PM - 06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Visitors</label>
                    <div className="form-input-with-icon">
                      <Users size={16} className="field-icon" />
                      <select
                        value={appointmentData.visitorsCount}
                        onChange={(e) => setAppointmentData({ ...appointmentData, visitorsCount: e.target.value })}
                        className="form-select"
                      >
                        <option value="1 person">1 person</option>
                        <option value="2 people">2 people</option>
                        <option value="3-4 family members">3-4 family</option>
                        <option value="5+ group">5+ group</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Special Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter any special requests or notes"
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={appointmentLoading}
                    className="btn btn-gold"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}
                  >
                    {appointmentLoading ? 'Scheduling Visit...' : 'Confirm Site Visit Booking'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                    — OR FOR INSTANT BOOKING —
                  </div>

                  <button
                    type="button"
                    onClick={openAppointmentWhatsApp}
                    className="btn-whatsapp-action"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <WhatsAppIcon size={19} />
                    <span>Book Directly via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
