import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  Maximize2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ExternalLink, 
  Trash2, 
  Video, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Edit3
} from 'lucide-react';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../../utils/cloudinaryOptimizer';

export default function PropertyDetailModal({ property, isOpen, onClose, onEdit, onMarkSold, onDelete }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!isOpen || !property) return null;

  const currentPropertyId = property.propertyId || property._id;
  const isSold = property.status === 'sold';
  const isScheduled = new Date(property.publishedAt) > new Date();

  // Media items list
  const mediaList = [];
  if (property.videoUrl) {
    mediaList.push({ type: 'video', url: property.videoUrl });
  }
  if (property.images && property.images.length > 0) {
    property.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) mediaList.push({ type: 'image', url });
    });
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1&rel=0` : null;
  };

  return (
    <div 
      className="admin-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div 
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge-type-pill">{property.propertyType}</span>
              <span style={{
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#b87d28',
                background: 'rgba(212, 154, 63, 0.12)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px'
              }}>
                ID: #{currentPropertyId}
              </span>
              {isSold ? (
                <span className="badge-status sold">Sold Out</span>
              ) : isScheduled ? (
                <span className="badge-status scheduled"><Clock size={12} /> Scheduled</span>
              ) : (
                <span className="badge-status published">Published</span>
              )}
            </div>
            <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.28rem', fontWeight: 800, color: '#0f172a' }}>
              {property.title}
            </h3>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-icon-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Media Showcase */}
          {mediaList.length > 0 && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#090f1d', border: '1px solid #1e293b' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mediaList[activeMediaIndex]?.type === 'video' ? (
                  getYouTubeEmbedUrl(mediaList[activeMediaIndex].url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(mediaList[activeMediaIndex].url)}
                      title="Property Video"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={getOptimizedVideoUrl(mediaList[activeMediaIndex].url)}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )
                ) : (
                  <img
                    src={getOptimizedImageUrl(mediaList[activeMediaIndex]?.url, { width: 1200 })}
                    alt="Property photo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}

                {/* Media Navigation Controls */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveMediaIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1))}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1))}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {mediaList.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', background: '#020617', overflowX: 'auto' }}>
                  {mediaList.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      style={{
                        border: idx === activeMediaIndex ? '2px solid #d49a3f' : '1px solid #334155',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        width: '60px',
                        height: '45px',
                        background: '#0f172a',
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: idx === activeMediaIndex ? 1 : 0.65
                      }}
                    >
                      {item.type === 'video' ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', background: '#1e293b' }}>
                          <Video size={16} />
                        </div>
                      ) : (
                        <img src={item.url} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b87d28', marginTop: '0.2rem' }}>
                {formatPrice(property.price)}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dimensions / Area</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {property.area} {property.areaUnit || 'Sq. Ft'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Location</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={15} color="#d49a3f" />
                <span>{property.location}</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Schedule Date</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} color="#64748b" />
                <span>{new Date(property.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>Listing Overview & Description</span>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.75rem',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Live Public Page */}
            <a
              href={`/properties/${currentPropertyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px' }}
            >
              <ExternalLink size={15} />
              <span>View Public Page</span>
            </a>

            {/* Edit Property button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(property);
                  onClose();
                }}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  fontWeight: 600
                }}
              >
                <Edit3 size={15} />
                <span>Edit Details</span>
              </button>
            )}

            {/* Mark Sold button */}
            {!isSold && onMarkSold && (
              <button
                type="button"
                onClick={() => onMarkSold(currentPropertyId, property.title)}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={15} />
                <span>Mark as Sold</span>
              </button>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(currentPropertyId, property.title);
                  onClose();
                }}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  fontWeight: 600
                }}
              >
                <Trash2 size={15} />
                <span>Delete Property</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '10px', padding: '0.5rem 1.25rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
