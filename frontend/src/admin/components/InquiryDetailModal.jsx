import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink,
  Copy,
  Check,
  Tag
} from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import toast from 'react-hot-toast';

export default function InquiryDetailModal({ 
  inquiry, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onDelete, 
  onConnectWhatsApp 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !inquiry) return null;

  const handleCopyMessage = () => {
    if (inquiry.message) {
      navigator.clipboard.writeText(inquiry.message);
      setCopied(true);
      toast.success('Enquiry message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const cleanPhone = (inquiry.phone || '').replace(/[^\d+]/g, '');

  return (
    <div 
      className="admin-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d49a3f' }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Enquiry Details
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Clock size={13} />
                <span>Received on {formattedDate}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span 
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                background: inquiry.status === 'NEW' ? '#f0fdf4' : inquiry.status === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc',
                color: inquiry.status === 'NEW' ? '#166534' : inquiry.status === 'IN_PROGRESS' ? '#1d4ed8' : '#475569',
                border: '1px solid',
                borderColor: inquiry.status === 'NEW' ? '#bbf7d0' : inquiry.status === 'IN_PROGRESS' ? '#bfdbfe' : '#e2e8f0'
              }}
            >
              {inquiry.status || 'NEW'}
            </span>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.15s'
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Client Contact Information */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              Client Information
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Client Name</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{inquiry.clientName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                  <Phone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Phone Number</div>
                  <a href={`tel:${cleanPhone}`} style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              {inquiry.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', border: '1px solid #fde68a' }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Email Address</div>
                    <a href={`mailto:${inquiry.email}`} style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                      {inquiry.email}
                    </a>
                  </div>
                </div>
              )}

              {inquiry.preferredContact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                    <Tag size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Preferred Contact</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'capitalize' }}>
                      {inquiry.preferredContact}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Interested In */}
          {(inquiry.propertyTitle || inquiry.propertyId) && (
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                Associated Property
              </span>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d49a3f', border: '1px solid #e2e8f0' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>{inquiry.propertyTitle || 'Property Listing'}</span>
                      {inquiry.propertyId && (
                        <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '1px 7px', borderRadius: '4px', fontWeight: 700 }}>
                          ID: #{inquiry.propertyId}
                        </span>
                      )}
                    </div>
                    {inquiry.propertyLocation && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        <MapPin size={12} color="#ef4444" />
                        <span>{typeof inquiry.propertyLocation === 'object' ? ([inquiry.propertyLocation.locality, inquiry.propertyLocation.city].filter(Boolean).join(', ') || inquiry.propertyLocation.address || '') : inquiry.propertyLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {inquiry.propertyId && (
                  <a
                    href={`/property/${inquiry.propertyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', borderRadius: '8px' }}
                  >
                    <span>View Property</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Full Client Message */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                Full Enquiry Message
              </span>
              {inquiry.message && (
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="btn-action-icon"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', padding: '0.25rem 0.5rem', width: 'auto', height: 'auto', borderRadius: '6px' }}
                  title="Copy message to clipboard"
                >
                  {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div 
              style={{ 
                background: '#f8fafc', 
                borderRadius: '10px', 
                padding: '1rem', 
                fontSize: '0.92rem', 
                color: '#1e293b', 
                lineHeight: 1.6, 
                whiteSpace: 'pre-wrap', 
                border: '1px solid #f1f5f9',
                maxHeight: '220px',
                overflowY: 'auto'
              }}
            >
              {inquiry.message || 'No additional message was written by the client.'}
            </div>
          </div>

          {/* Status Update Dropdown inside modal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                Enquiry Status:
              </span>
              <select
                value={inquiry.status}
                onChange={(e) => onUpdateStatus && onUpdateStatus(inquiry._id, e.target.value)}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: inquiry.status === 'NEW' ? '#166534' : inquiry.status === 'IN_PROGRESS' ? '#1d4ed8' : '#475569',
                  cursor: 'pointer'
                }}
              >
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(inquiry._id);
                  onClose();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                <span>Delete Enquiry</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid #f1f5f9', background: '#ffffff', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '8px', padding: '0.55rem 1.25rem' }}
          >
            Close
          </button>

          <a
            href={`tel:${cleanPhone}`}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '8px', padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', borderColor: '#bfdbfe' }}
          >
            <Phone size={14} />
            <span>Call</span>
          </a>

          <button
            type="button"
            onClick={() => {
              if (onConnectWhatsApp) {
                onConnectWhatsApp(inquiry.phone, inquiry.clientName, inquiry.propertyTitle, inquiry.propertyId);
              }
            }}
            className="btn btn-gold btn-sm"
            style={{ borderRadius: '8px', padding: '0.55rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            <WhatsAppIcon size={16} />
            <span>Reply on WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
