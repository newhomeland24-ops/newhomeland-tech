import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, ArrowRight, Play, Camera, MessageCircle } from 'lucide-react';

const LandCard = ({ property }) => {
  if (!property) return null;

  const isSold = property.status === 'sold';
  
  const coverImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello NewHomeLand, I am interested in property "${property.title}" (ID: ${property._id}) located in ${property.location} listed for ${formatPrice(property.price)}. Please share legal paperwork and site visit details.`
  );

  const statusClass = isSold ? 'sold' : 'available';
  const isVideoTour = Boolean(property.videoUrl);

  return (
    <article className="property-card">
      <div className="property-card-image-wrap">
        <img
          src={coverImage}
          alt={property.title}
          className={`property-card-img ${isSold ? 'grayscale' : ''}`}
          loading="lazy"
        />

        {isVideoTour && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            zIndex: 3
          }}>
            <Play size={12} fill="#ffffff" />
            <span>Video Walkthrough</span>
          </div>
        )}

        {/* Media Indicators */}
        {property.images && property.images.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: isVideoTour ? '40px' : '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            zIndex: 3
          }}>
             <Camera size={12} fill="#ffffff" />
             <span>{property.images.length} Photos</span>
          </div>
        )}

        <div className="card-badge-top-left">
          <span className={`badge-status ${statusClass}`}>
            {isSold ? 'Sold out' : 'Available'}
          </span>
        </div>

        <div className="card-badge-top-right">
          {property.propertyType}
        </div>
      </div>

      <div className="property-card-body">
        <div className="card-location">
          <MapPin size={14} color="#d49a3f" />
          <span className="truncate">{property.location}</span>
        </div>

        <h3 className="card-title" title={property.title}>
          <Link to={`/property/${property._id}`}>
            {property.title}
          </Link>
        </h3>

        <p className="card-description">
          {property.description}
        </p>

        <div className="card-specs">
          <div className="spec-item" title="Area">
            <Maximize2 size={15} color="#64748b" />
            <span>{property.area} {property.areaUnit || 'sq ft'}</span>
          </div>
        </div>

        <div className="card-footer">
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Expected Price
            </span>
            <span className="card-price">
              {formatPrice(property.price)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/property/${property._id}`} className="btn btn-dark btn-sm">
              <span>View</span>
              <ArrowRight size={14} />
            </Link>
            <a 
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-sm"
              style={{ padding: '0.45rem', display: 'flex', alignItems: 'center' }}
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default LandCard;
