import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  ExternalLink, 
  X, 
  Clock, 
  User, 
  Phone,
  CheckCircle2
} from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';

function SingleLeadPopupItem({ item, onDismiss, onViewLead, businessName }) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const DURATION_MS = 12000;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 100;
    const decrement = (intervalTime / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss(item.id);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, item.id, onDismiss]);

  const isEnquiry = item.type === 'enquiry';
  const cleanPhone = (item.phone || '').replace(/[^\d+]/g, '');
  const rawNumber = (item.phone || '').replace(/[^\d]/g, '');

  const openWhatsApp = () => {
    const defaultMsg = isEnquiry
      ? `Hello ${item.clientName || 'Client'}, thank you for inquiring about "${item.propertyTitle || 'our property'}". How can we assist you today?`
      : `Hello ${item.clientName || 'Client'}, we received your site visit booking for "${item.propertyTitle || 'our property'}" on ${item.preferredDate || ''} (${item.preferredTime || ''}). We are confirming your schedule.`;

    const encoded = encodeURIComponent(defaultMsg);
    window.open(`https://wa.me/${rawNumber}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`lead-popup-card ${isEnquiry ? 'theme-enquiry' : 'theme-appointment'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="assertive"
    >
      {/* Top Accent Bar & Countdown */}
      <div 
        className="lead-popup-progress"
        style={{ width: `${progress}%` }}
      />

      <div className="lead-popup-header">
        <div className="lead-popup-badge-wrap">
          <div className={`lead-popup-icon-badge ${isEnquiry ? 'enquiry' : 'appointment'}`}>
            {isEnquiry ? <MessageSquare size={16} /> : <Calendar size={16} />}
          </div>
          <div>
            <span className="lead-popup-type-tag">
              {isEnquiry ? 'New Property Enquiry' : 'New Site Visit Booked'}
            </span>
            <div className="lead-popup-time-text">
              <span className="lead-popup-live-dot" /> Just now
            </div>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => onDismiss(item.id)}
          className="lead-popup-close-btn"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div className="lead-popup-body">
        <div className="lead-popup-client-info">
          <div className="lead-popup-client-name">
            <User size={14} className="inline-icon" />
            <span>{item.clientName || 'Prospective Buyer'}</span>
          </div>
          {item.phone && (
            <a href={`tel:${cleanPhone}`} className="lead-popup-client-phone" title="Call directly">
              <Phone size={13} className="inline-icon" />
              <span>{item.phone}</span>
            </a>
          )}
        </div>

        {item.propertyTitle && (
          <div className="lead-popup-property-title">
            <strong>Property:</strong> {item.propertyTitle}
            {item.propertyId && (
              <span className="lead-popup-prop-id">ID: #{item.propertyId}</span>
            )}
          </div>
        )}

        {isEnquiry && item.message && (
          <div className="lead-popup-snippet" title={item.message}>
            "{item.message}"
          </div>
        )}

        {!isEnquiry && item.preferredDate && (
          <div className="lead-popup-appointment-meta">
            <span className="lead-popup-meta-badge date">
              📅 {item.preferredDate}
            </span>
            {item.preferredTime && (
              <span className="lead-popup-meta-badge time">
                ⏰ {item.preferredTime}
              </span>
            )}
            {item.visitorsCount && (
              <span className="lead-popup-meta-badge visitors">
                👥 {item.visitorsCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="lead-popup-actions">
        <button
          type="button"
          onClick={() => {
            onViewLead(item);
            onDismiss(item.id);
          }}
          className="btn-popup-primary"
        >
          <ExternalLink size={14} />
          <span>View Details</span>
        </button>

        {rawNumber && (
          <button
            type="button"
            onClick={openWhatsApp}
            className="btn-popup-whatsapp"
            title="Chat directly on WhatsApp"
          >
            <WhatsAppIcon size={15} />
            <span>WhatsApp</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="btn-popup-dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function LeadNotificationPopup({
  notifications = [],
  onDismiss = () => {},
  onViewLead = () => {},
  businessName = 'NewHomeDevelopers'
}) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="lead-notification-popup-container" aria-label="Incoming lead alerts">
      {notifications.map((item) => (
        <SingleLeadPopupItem
          key={item.id}
          item={item}
          onDismiss={onDismiss}
          onViewLead={onViewLead}
          businessName={businessName}
        />
      ))}
    </div>
  );
}
