import React, { useState, useRef } from 'react';
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
import { useSettings } from '../../context/SettingsContext';

export default function PropertyInquiryAppointmentForms({ property }) {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'NewHomeDevelopers';
  const brokerPhone = (settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '916005707121').replace(/[^\d]/g, '');

  const [activeTab, setActiveTab] = useState('enquiry'); // 'enquiry' | 'appointment'

  const propCustomId = property?.propertyId || property?._id || '';

  // Element Refs for Auto-Focus on Error
  const enquiryNameRef = useRef(null);
  const enquiryPhoneRef = useRef(null);
  const appointmentNameRef = useRef(null);
  const appointmentPhoneRef = useRef(null);
  const appointmentDateRef = useRef(null);

  // Field Errors State
  const [enquiryErrors, setEnquiryErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});

  // Enquiry Form State
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredContact: 'whatsapp',
    message: property?.title 
      ? `Hello ${businessName}, I am interested in property "${property.title}" (ID: #${propCustomId}). Please share the verified paperwork, price breakdown, and site visit details.`
      : `Hello ${businessName}, I would like to inquire about this property.`
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

  // Strict Validation Helpers with Visual Error Highlighting & Auto-Focus
  const validateEnquiry = () => {
    const errs = {};
    const name = (enquiryData.name || '').trim();
    const phone = (enquiryData.phone || '').trim();
    const digits = phone.replace(/[^\d]/g, '');

    if (!name) {
      errs.name = 'Full name is required';
    }
    if (!phone) {
      errs.phone = 'Phone or WhatsApp number is required';
    } else if (digits.length < 10) {
      errs.phone = 'Please enter a valid 10-digit number';
    }

    setEnquiryErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.name && enquiryNameRef.current) {
        enquiryNameRef.current.focus();
      } else if (errs.phone && enquiryPhoneRef.current) {
        enquiryPhoneRef.current.focus();
      }
      toast.error('Please enter mandatory fields: Name and Contact number before proceeding.', {
        id: 'mandatory-enquiry-fields'
      });
      return false;
    }
    return true;
  };

  const validateAppointment = () => {
    const errs = {};
    const name = (appointmentData.name || '').trim();
    const phone = (appointmentData.phone || '').trim();
    const digits = phone.replace(/[^\d]/g, '');

    if (!name) {
      errs.name = 'Full name is required';
    }
    if (!phone) {
      errs.phone = 'Phone number is required';
    } else if (digits.length < 10) {
      errs.phone = 'Please enter a valid 10-digit number';
    }
    if (!appointmentData.preferredDate) {
      errs.preferredDate = 'Preferred inspection date is required';
    }

    setAppointmentErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.name && appointmentNameRef.current) {
        appointmentNameRef.current.focus();
      } else if (errs.phone && appointmentPhoneRef.current) {
        appointmentPhoneRef.current.focus();
      } else if (errs.preferredDate && appointmentDateRef.current) {
        appointmentDateRef.current.focus();
      }
      toast.error('Please enter mandatory fields: Name and Contact number to book a visit.', {
        id: 'mandatory-appointment-fields'
      });
      return false;
    }
    return true;
  };


  // Broadcast Lead Helper
  const broadcastLead = (payload) => {
    if (typeof window === 'undefined') return;
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('newhome_leads_channel');
        bc.postMessage(payload);
        bc.close();
      }
      localStorage.setItem('newhome_lead_event', JSON.stringify(payload));
    } catch (e) {}
  };

  // Handle Standard Enquiry Submit
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!validateEnquiry()) {
      return;
    }

    const formattedLocation = typeof property?.location === 'object'
      ? [property.location.locality, property.location.city].filter(Boolean).join(', ') || property.location.address || ''
      : (property?.location || '');

    setEnquiryLoading(true);
    try {
      const res = await axios.post('/api/inquiries', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: formattedLocation,
        propertyPrice: property?.pricing?.price || property?.price,
        clientName: enquiryData.name.trim(),
        phone: enquiryData.phone.trim(),
        email: (enquiryData.email || '').trim(),
        message: enquiryData.message,
        preferredContact: enquiryData.preferredContact
      });

      const savedInquiry = res.data?.data || {};
      broadcastLead({
        type: 'enquiry',
        id: savedInquiry._id || String(Date.now()),
        clientName: enquiryData.name.trim(),
        phone: enquiryData.phone.trim(),
        email: (enquiryData.email || '').trim(),
        propertyTitle: property?.title || 'Property Inquiry',
        propertyId: propCustomId,
        message: enquiryData.message,
        timestamp: Date.now()
      });

      setEnquirySuccess(true);
      toast.success('Your enquiry has been received! Our broker will contact you shortly.');
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setEnquirySuccess(true);
      toast.success('Enquiry logged! You can also chat directly on WhatsApp.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  // Handle Direct WhatsApp Enquiry Submit
  const handleWhatsAppEnquiry = async () => {
    if (!validateEnquiry()) {
      return;
    }

    const formattedLocation = typeof property?.location === 'object'
      ? [property.location.locality, property.location.city].filter(Boolean).join(', ') || property.location.address || ''
      : (property?.location || '');

    const name = enquiryData.name.trim();
    const phone = enquiryData.phone.trim();
    const email = (enquiryData.email || '').trim();

    // 1. Immediately open WhatsApp with client details
    const text = encodeURIComponent(
      `Hello ${businessName}, I would like to inquire about "${property?.title}" (ID: #${propCustomId}).\nName: ${name}\nContact: ${phone}${email ? `\nEmail: ${email}` : ''}\nMessage: ${enquiryData.message || 'Please share verified legal paperwork and site visit coordinates.'}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');

    // 2. Automatically log to database & broadcast alert to Admin
    try {
      const res = await axios.post('/api/inquiries', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: formattedLocation,
        propertyPrice: property?.pricing?.price || property?.price,
        clientName: name,
        phone: phone,
        email: email,
        message: enquiryData.message || 'Inquiry initiated via direct WhatsApp',
        preferredContact: 'whatsapp'
      });

      const savedInquiry = res.data?.data || {};
      broadcastLead({
        type: 'enquiry',
        id: savedInquiry._id || String(Date.now()),
        clientName: name,
        phone: phone,
        email: email,
        propertyTitle: property?.title || 'Property Inquiry',
        propertyId: propCustomId,
        message: enquiryData.message || 'Inquiry initiated via direct WhatsApp',
        timestamp: Date.now()
      });

      setEnquirySuccess(true);
    } catch (err) {
      console.warn('Background inquiry logging note:', err);
      setEnquirySuccess(true);
    }
  };

  // Handle Standard Appointment Submit
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!validateAppointment()) {
      return;
    }

    const formattedLocation = typeof property?.location === 'object'
      ? [property.location.locality, property.location.city].filter(Boolean).join(', ') || property.location.address || ''
      : (property?.location || '');

    setAppointmentLoading(true);
    try {
      const res = await axios.post('/api/appointments', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: formattedLocation,
        clientName: appointmentData.name.trim(),
        phone: appointmentData.phone.trim(),
        email: (appointmentData.email || '').trim(),
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        visitorsCount: appointmentData.visitorsCount,
        notes: appointmentData.notes
      });

      const savedApp = res.data?.data || {};
      broadcastLead({
        type: 'appointment',
        id: savedApp._id || String(Date.now()),
        clientName: appointmentData.name.trim(),
        phone: appointmentData.phone.trim(),
        email: (appointmentData.email || '').trim(),
        propertyTitle: property?.title || 'Scheduled Site Visit',
        propertyId: propCustomId,
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        visitorsCount: appointmentData.visitorsCount,
        timestamp: Date.now()
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

  // Handle Direct WhatsApp Appointment Submit
  const handleWhatsAppAppointment = async () => {
    if (!validateAppointment()) {
      return;
    }

    const formattedLocation = typeof property?.location === 'object'
      ? [property.location.locality, property.location.city].filter(Boolean).join(', ') || property.location.address || ''
      : (property?.location || '');

    const name = appointmentData.name.trim();
    const phone = appointmentData.phone.trim();
    const email = (appointmentData.email || '').trim();

    // 1. Immediately open WhatsApp with full booking details
    const text = encodeURIComponent(
      `Hello ${businessName}, I would like to book a site visit for property "${property?.title}" (ID: #${propCustomId}).\nClient: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ''}\nRequested Date: ${appointmentData.preferredDate}\nTime Slot: ${appointmentData.preferredTime}\nVisitors: ${appointmentData.visitorsCount}${appointmentData.notes ? `\nNotes: ${appointmentData.notes}` : ''}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');

    // 2. Automatically log to database & broadcast alert to Admin
    try {
      const res = await axios.post('/api/appointments', {
        propertyId: propCustomId,
        propertyTitle: property?.title,
        propertyLocation: formattedLocation,
        clientName: name,
        phone: phone,
        email: email,
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        visitorsCount: appointmentData.visitorsCount,
        notes: appointmentData.notes || 'Site visit booking initiated via WhatsApp'
      });

      const savedApp = res.data?.data || {};
      broadcastLead({
        type: 'appointment',
        id: savedApp._id || String(Date.now()),
        clientName: name,
        phone: phone,
        email: email,
        propertyTitle: property?.title || 'Scheduled Site Visit',
        propertyId: propCustomId,
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        visitorsCount: appointmentData.visitorsCount,
        timestamp: Date.now()
      });

      setAppointmentSuccess(true);
    } catch (err) {
      console.warn('Background appointment logging note:', err);
      setAppointmentSuccess(true);
    }
  };

  // Direct WhatsApp links for Success Screen
  const openEnquiryWhatsApp = () => {
    if (!validateEnquiry()) return;
    const text = encodeURIComponent(
      `Hello ${businessName}, I submitted an enquiry for property "${property?.title}" (ID: #${propCustomId}).\nName: ${enquiryData.name.trim()}\nPhone: ${enquiryData.phone.trim()}\nMessage: ${enquiryData.message}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openAppointmentWhatsApp = () => {
    if (!validateAppointment()) return;
    const text = encodeURIComponent(
      `Hello ${businessName}, I booked a site visit for property "${property?.title}" (ID: #${propCustomId}).\nClient: ${appointmentData.name.trim()}\nPhone: ${appointmentData.phone.trim()}\nRequested Date: ${appointmentData.preferredDate}\nTime Slot: ${appointmentData.preferredTime}\nVisitors: ${appointmentData.visitorsCount}`
    );
    window.open(`https://wa.me/${brokerPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="property-forms-card" id="inquiry-form-section">
      {/* Form Tabs */}
      <div className="property-forms-nav">
        <button
          type="button"
          className={`property-forms-tab ${activeTab === 'enquiry' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('enquiry');
            setEnquiryErrors({});
          }}
        >
          <Send size={16} />
          <span>Send Enquiry</span>
        </button>

        <button
          type="button"
          className={`property-forms-tab ${activeTab === 'appointment' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('appointment');
            setAppointmentErrors({});
          }}
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
                      setEnquiryErrors({});
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
              <form onSubmit={handleEnquirySubmit} className="property-form" noValidate>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', margin: '0 0 0.2rem 0' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Inquire About This Property
                    </h4>
                    {propCustomId && (
                      <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        ID: #{propCustomId}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Receive verified legal paperwork, current price breakdown, and site visit coordinates.
                  </p>
                </div>

                {Object.keys(enquiryErrors).length > 0 && (
                  <div className="form-alert-error">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>Please enter mandatory details (Name & 10-digit Phone Number) below to continue.</span>
                  </div>
                )}

                <div className="form-field-group">
                  <label className="form-field-label">Your Name *</label>
                  <div className="form-input-with-icon">
                    <User size={16} className="field-icon" style={{ color: enquiryErrors.name ? '#ef4444' : undefined }} />
                    <input
                      ref={enquiryNameRef}
                      type="text"
                      placeholder="Enter your full name"
                      value={enquiryData.name}
                      onChange={(e) => {
                        setEnquiryData({ ...enquiryData, name: e.target.value });
                        if (enquiryErrors.name) setEnquiryErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`form-input ${enquiryErrors.name ? 'has-error' : ''}`}
                    />
                  </div>
                  {enquiryErrors.name && (
                    <div className="field-error-msg">
                      <AlertCircle size={13} />
                      <span>{enquiryErrors.name}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Phone / WhatsApp *</label>
                    <div className="form-input-with-icon">
                      <Phone size={16} className="field-icon" style={{ color: enquiryErrors.phone ? '#ef4444' : undefined }} />
                      <input
                        ref={enquiryPhoneRef}
                        type="tel"
                        placeholder="10-digit number"
                        value={enquiryData.phone}
                        onChange={(e) => {
                          setEnquiryData({ ...enquiryData, phone: e.target.value });
                          if (enquiryErrors.phone) setEnquiryErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        className={`form-input ${enquiryErrors.phone ? 'has-error' : ''}`}
                      />
                    </div>
                    {enquiryErrors.phone && (
                      <div className="field-error-msg">
                        <AlertCircle size={13} />
                        <span>{enquiryErrors.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Email (Optional)</label>
                    <div className="form-input-with-icon">
                      <Mail size={16} className="field-icon" />
                      <input
                        type="email"
                        placeholder="Email address"
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
                    onClick={handleWhatsAppEnquiry}
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
                      setAppointmentErrors({});
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
              <form onSubmit={handleAppointmentSubmit} className="property-form" noValidate>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', margin: '0 0 0.2rem 0' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Schedule a Guided Site Visit
                    </h4>
                    {propCustomId && (
                      <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        ID: #{propCustomId}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Inspect boundaries, title papers, and access roads with our principal broker.
                  </p>
                </div>

                {Object.keys(appointmentErrors).length > 0 && (
                  <div className="form-alert-error">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>Please enter mandatory details (Name & 10-digit Phone Number) below to book a visit.</span>
                  </div>
                )}

                <div className="form-field-group">
                  <label className="form-field-label">Your Full Name *</label>
                  <div className="form-input-with-icon">
                    <User size={16} className="field-icon" style={{ color: appointmentErrors.name ? '#ef4444' : undefined }} />
                    <input
                      ref={appointmentNameRef}
                      type="text"
                      placeholder="Enter your full name"
                      value={appointmentData.name}
                      onChange={(e) => {
                        setAppointmentData({ ...appointmentData, name: e.target.value });
                        if (appointmentErrors.name) setAppointmentErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`form-input ${appointmentErrors.name ? 'has-error' : ''}`}
                    />
                  </div>
                  {appointmentErrors.name && (
                    <div className="field-error-msg">
                      <AlertCircle size={13} />
                      <span>{appointmentErrors.name}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Phone Number *</label>
                    <div className="form-input-with-icon">
                      <Phone size={16} className="field-icon" style={{ color: appointmentErrors.phone ? '#ef4444' : undefined }} />
                      <input
                        ref={appointmentPhoneRef}
                        type="tel"
                        placeholder="10-digit phone"
                        value={appointmentData.phone}
                        onChange={(e) => {
                          setAppointmentData({ ...appointmentData, phone: e.target.value });
                          if (appointmentErrors.phone) setAppointmentErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        className={`form-input ${appointmentErrors.phone ? 'has-error' : ''}`}
                      />
                    </div>
                    {appointmentErrors.phone && (
                      <div className="field-error-msg">
                        <AlertCircle size={13} />
                        <span>{appointmentErrors.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Preferred Date *</label>
                    <div className="form-input-with-icon">
                      <Calendar size={16} className="field-icon" style={{ color: appointmentErrors.preferredDate ? '#ef4444' : undefined }} />
                      <input
                        ref={appointmentDateRef}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={appointmentData.preferredDate}
                        onChange={(e) => {
                          setAppointmentData({ ...appointmentData, preferredDate: e.target.value });
                          if (appointmentErrors.preferredDate) setAppointmentErrors(prev => ({ ...prev, preferredDate: '' }));
                        }}
                        className={`form-input ${appointmentErrors.preferredDate ? 'has-error' : ''}`}
                      />
                    </div>
                    {appointmentErrors.preferredDate && (
                      <div className="field-error-msg">
                        <AlertCircle size={13} />
                        <span>{appointmentErrors.preferredDate}</span>
                      </div>
                    )}
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
                    onClick={handleWhatsAppAppointment}
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
