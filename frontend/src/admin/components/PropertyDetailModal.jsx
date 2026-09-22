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
import PropTypes from 'prop-types';

export default function PropertyDetailModal({ property, isOpen, onClose, onEdit, onMarkSold, onDelete }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!isOpen || !property) return null;

  const currentPropertyId = property.propertyId || property._id;
  const isSold = property.status === 'sold' || property.status === 'Sold';
  const isScheduled = new Date(property.publishedAt) > new Date();

  // Media items list (videos + images + floorplans)
  const mediaList = [];
  if (property.media?.videos && property.media.videos.length > 0) {
    property.media.videos.forEach(v => mediaList.push({ type: 'video', url: v.url, title: v.title }));
  } else if (property.videoUrl) {
    mediaList.push({ type: 'video', url: property.videoUrl });
  }

  if (property.media?.images && property.media.images.length > 0) {
    property.media.images.forEach(img => mediaList.push({ type: 'image', url: img.url, caption: img.caption, isFeatured: img.isFeatured }));
  } else if (property.images && property.images.length > 0) {
    property.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) mediaList.push({ type: 'image', url });
    });
  }

  if (property.media?.floorPlans && property.media.floorPlans.length > 0) {
    property.media.floorPlans.forEach(fp => mediaList.push({ type: 'image', url: fp.url, caption: fp.title || 'Floor Plan' }));
  }

  const effectivePrice = property.pricing?.price;
  const effectiveArea = property.specifications?.carpetAreaSqFt;
  const locationText = [property.location?.locality, property.location?.city].filter(Boolean).join(', ') || property.location?.address || 'Delhi NCR';

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
      className="admin-modal-overlay fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/85"
      onClick={onClose}
    >
      <div 
        className="admin-modal-card max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
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
        <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Media Showcase */}
          {mediaList.length > 0 && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#090f1d', border: '1px solid #1e293b', flexShrink: 0 }}>
              <div style={{ position: 'relative', width: '100%', minHeight: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                {formatPrice(effectivePrice)}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {effectiveArea ? 'Dimensions / Area' : (property.specifications?.bhkType ? 'Configuration' : 'Area')}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {effectiveArea ? `${effectiveArea} ${property.specifications?.areaUnit || property.areaUnit || 'Sq. Ft'}` : (property.specifications?.bhkType || (property.propertyType === 'Land' ? 'Plots' : 'N/A'))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Location</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={15} color="#d49a3f" />
                <span>{locationText}</span>
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

          {/* Specifications Grid if present */}
          {property.specifications && (property.specifications.bedrooms > 0 || property.specifications.carpetAreaSqFt > 0) && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} color="#d49a3f" />
                <span>Property Specifications</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {property.specifications.bedrooms > 0 && (
                  <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bedrooms:</span> <strong style={{ color: '#0f172a' }}>{property.specifications.bedrooms} BHK</strong></div>
                )}
                {property.specifications.bathrooms > 0 && (
                  <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Baths:</span> <strong style={{ color: '#0f172a' }}>{property.specifications.bathrooms}</strong></div>
                )}
                {property.specifications.furnishingStatus && (
                  <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Furnishing:</span> <strong style={{ color: '#0f172a' }}>{property.specifications.furnishingStatus}</strong></div>
                )}
                {property.specifications.facing && (
                  <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Facing:</span> <strong style={{ color: '#0f172a' }}>{property.specifications.facing}</strong></div>
                )}
                {property.specifications.parkingSlots > 0 && (
                  <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Parking:</span> <strong style={{ color: '#0f172a' }}>{property.specifications.parkingSlots} Slots</strong></div>
                )}
              </div>
            </div>
          )}

          {/* Amenities Grid if present */}
          {property.amenities && property.amenities.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem' }}>
                Verified Lifestyle Amenities
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {property.amenities.map(a => (
                  <span key={a} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

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
          padding: '1rem',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
            {onMarkSold && (
              <button
                type="button"
                onClick={() => { if (!isSold) onMarkSold(currentPropertyId, property.title); }}
                disabled={isSold}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '10px',
                  background: isSold ? '#f3f4f6' : '#f0fdf4',
                  color: isSold ? '#9ca3af' : '#16a34a',
                  border: isSold ? '1px solid #e5e7eb' : '1px solid #bbf7d0',
                  fontWeight: 600,
                  cursor: isSold ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle size={15} />
                <span>{isSold ? 'Sold Out' : 'Mark as Sold'}</span>
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

PropertyDetailModal.propTypes = {
  property: PropTypes.shape({
    propertyId: PropTypes.string,
    _id: PropTypes.string,
    status: PropTypes.string,
    propertyType: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    publishedAt: PropTypes.string,
    soldAt: PropTypes.string,
    location: PropTypes.shape({
      address: PropTypes.string,
      locality: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      pincode: PropTypes.string,
      landmark: PropTypes.string
    }),
    pricing: PropTypes.shape({
      price: PropTypes.number
    }),
    specifications: PropTypes.shape({
      carpetAreaSqFt: PropTypes.number,
      bedrooms: PropTypes.number,
      bathrooms: PropTypes.number,
      balconies: PropTypes.number,
      totalFloors: PropTypes.number,
      furnishingStatus: PropTypes.string,
      facing: PropTypes.string,
      parkingSlots: PropTypes.number,
      ageOfPropertyYears: PropTypes.number
    }),
    amenities: PropTypes.arrayOf(PropTypes.string),
    media: PropTypes.shape({
      images: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string
      })),
      videos: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string
      })),
      floorPlans: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string
      }))
    }),
    meta: PropTypes.shape({
      isVerified: PropTypes.bool,
      featuredPriority: PropTypes.number
    })
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onMarkSold: PropTypes.func,
  onDelete: PropTypes.func
};
