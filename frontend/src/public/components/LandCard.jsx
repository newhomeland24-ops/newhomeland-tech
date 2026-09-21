import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Maximize2,
  ArrowRight,
  Play,
  Camera,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { getOptimizedImageUrl } from '../../utils/cloudinaryOptimizer';
import { useSettings } from '../../context/SettingsContext';
import PropTypes from 'prop-types';

const LandCard = ({ property }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  if (!property) return null;

  const propId = property.propertyId || property._id || property.id;
  const isSold = property.status === 'sold' || property.status === 'Sold';
  const locationText = [property.location?.locality, property.location?.city].filter(Boolean).join(', ') || property.location?.address || 'Delhi NCR';
  const typeText = property.propertyType || 'Residential';
  const unitText = property.specifications?.areaUnit || property.areaUnit || 'Sq. Ft';
  const effectiveArea = property.specifications?.carpetAreaSqFt;
  const effectivePrice = property.pricing?.price;
  const bedroomsCount = property.specifications?.bedrooms;
  const bhkText = property.specifications?.bhkType || (bedroomsCount > 0 ? `${bedroomsCount} BHK` : '');

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Build media list with optimized images first
  const mediaList = [];
  if (property.media?.images?.length > 0) {
    property.media.images.forEach(img => {
      if (img.url) mediaList.push({ type: 'image', url: img.url, isFeatured: img.isFeatured });
    });
    // Sort featured to first
    mediaList.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  // Check for video walkthrough
  const videoUrl = property.media?.videos?.[0]?.url;
  const hasVideo = Boolean(videoUrl);

  // Fallback placeholder image if no media found
  if (mediaList.length === 0) {
    mediaList.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });
  }

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Phone touch swipe handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 40;

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      e.stopPropagation();
      setCurrentIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1));
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Previous
      e.stopPropagation();
      setCurrentIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  // Card click navigates to details page
  const handleCardClick = () => {
    navigate(`/properties/${propId}`);
  };

  // WhatsApp click handler
  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    const phone = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const businessName = settings.business_name || 'NewHomeDevelopers';
    const msg = encodeURIComponent(
      `Hello ${businessName}, I am interested in property "${property.title}" (ID: ${propId}) located in ${locationText} listed for ${formatPrice(effectivePrice)}. Please share legal paperwork and site visit details.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };


  const currentMedia = mediaList[currentIndex] || mediaList[0];
  const optimizedImgUrl = getOptimizedImageUrl(currentMedia.url, { width: 700 });

  return (
    <article
      className="property-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      {/* 1. Media Carousel Wrap (Slidable on Phone & Laptop) */}
      <div
        className="property-card-image-wrap aspect-video relative overflow-hidden"
        style={{ aspectRatio: '16/9' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Active Image Slide */}
        <img
          key={currentMedia.url}
          src={optimizedImgUrl}
          alt={property.title}
          className={`property-card-img ${isSold ? 'grayscale' : ''}`}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Video Walkthrough Indicator Badge */}
        {hasVideo && (
          <div className="card-video-playing-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Play size={12} fill="#ffffff" color="#ffffff" />
            <span>Video Walkthrough</span>
          </div>
        )}

        {/* Media Type/Count Badge */}
        {mediaList.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              zIndex: 8,
              pointerEvents: 'none'
            }}
          >
            <Camera size={12} fill="#ffffff" />
            <span>{currentIndex + 1} / {mediaList.length}</span>
          </div>
        )}

        {/* Carousel Prev/Next Buttons (Laptop Hover & Phone Accessible) */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="card-carousel-nav left"
              aria-label="Previous Media"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="card-carousel-nav right"
              aria-label="Next Media"
            >
              <ChevronRight size={18} />
            </button>

            {/* Pagination Dots */}
            <div className="card-carousel-dots" onClick={(e) => e.stopPropagation()}>
              {mediaList.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`card-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Status Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span
            className="badge-status"
            style={{
              background: isSold ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: isSold ? '#ef4444' : '#10b981',
              border: isSold ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
          >
            {isSold ? 'Sold out' : 'Available'}
          </span>
        </div>

        {/* Property Type Badge (Top Right) */}
        <div
          className="absolute top-3 right-3 z-10 pointer-events-none"
          style={{
            background: '#1e293b',
            color: '#ffffff',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0.3rem 0.85rem'
          }}
        >
          {typeText}
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="property-card-body" style={{ padding: '1.5rem 1.6rem' }}>
        {/* Location */}
        <div className="card-location min-w-0" style={{ marginBottom: '0.4rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={15} color="#d49a3f" className="flex-shrink-0" />
          <span className="truncate flex-1 min-w-0">{locationText}</span>
        </div>

        {/* Title */}
        <h3
          className="card-title truncate min-w-0 w-full"
          title={property.title}
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.85rem',
            lineHeight: 1.3
          }}
        >
          {property.title}
        </h3>

        {/* Area & Configuration Specification */}
        <div style={{ paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', marginBottom: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
            {effectiveArea ? (
              <>
                <Maximize2 size={16} color="#64748b" />
                <span style={{ fontSize: '0.95rem' }}>{effectiveArea} {unitText}</span>
              </>
            ) : bhkText ? (
              <>
                <Home size={16} color="#64748b" />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{bhkText}</span>
              </>
            ) : (
              <>
                <Maximize2 size={16} color="#64748b" />
                <span style={{ fontSize: '0.95rem' }}>
                  {property.propertyType === 'Land' ? 'Plots' : (property.listingType ? `For ${property.listingType}` : property.propertyType || 'Standard')}
                </span>
              </>
            )}
          </div>
          {effectiveArea && bhkText ? (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
              {bhkText}
            </span>
          ) : (!effectiveArea && bhkText && property.listingType) ? (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b87d28', background: '#fdf6eb', padding: '2px 8px', borderRadius: '6px' }}>
              For {property.listingType}
            </span>
          ) : null}
        </div>

        {/* Card Footer: Price & Actions */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              EXPECTED PRICE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b87d28', fontFamily: 'var(--font-heading)' }}>
                {property.price_display || formatPrice(effectivePrice)}
              </span>
              {property.pricing?.priceType === 'Per Unit' && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  (per {property.specifications?.areaUnit || 'Unit'})
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* View Details Button */}
            <button
              type="button"
              className="btn btn-dark btn-sm"
              onClick={handleCardClick}
              style={{
                borderRadius: '12px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#0f172a',
                color: '#ffffff'
              }}
            >
              <span>View</span>
              <ArrowRight size={15} />
            </button>

            {/* WhatsApp Inquiry Button */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="btn btn-gold btn-sm"
              title="Inquire on WhatsApp"
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#d49a3f',
                color: '#0f172a'
              }}
            >
              <WhatsAppIcon size={19} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

LandCard.propTypes = {
  property: PropTypes.shape({
    propertyId: PropTypes.string,
    _id: PropTypes.string,
    id: PropTypes.string,
    status: PropTypes.string,
    propertyType: PropTypes.string,
    title: PropTypes.string,
    price_display: PropTypes.string,
    location: PropTypes.shape({
      address: PropTypes.string,
      locality: PropTypes.string,
      city: PropTypes.string
    }),
    specifications: PropTypes.shape({
      carpetAreaSqFt: PropTypes.number,
      bedrooms: PropTypes.number
    }),
    pricing: PropTypes.shape({
      price: PropTypes.number
    }),
    media: PropTypes.shape({
      images: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string,
          isFeatured: PropTypes.bool
        })
      ),
      videos: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string
        })
      )
    })
  }).isRequired
};

export default LandCard;
