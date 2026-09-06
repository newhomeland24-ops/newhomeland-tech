import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Maximize2,
  ArrowRight,
  Play,
  Camera,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const LandCard = ({ property }) => {
  const navigate = useNavigate();

  if (!property) return null;

  const propId = property._id || property.id;
  const isSold = property.status === 'sold' || property.status === 'Sold';
  const locationText = property.location || property.location_name || property.city || property.address || 'Delhi NCR';
  const typeText = property.propertyType || property.property_type || 'Residential';
  const unitText = property.areaUnit || property.area_unit || 'Sq. Ft';

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Build media list (video first if available, followed by images)
  const mediaList = [];

  // Check for video
  const videoUrl = property.videoUrl || (property.videos && property.videos.length > 0 ? (property.videos[0]?.video_url || property.videos[0]) : null);
  if (videoUrl) {
    mediaList.push({ type: 'video', url: videoUrl });
  }

  // Extract images
  if (property.images && property.images.length > 0) {
    property.images.forEach(img => {
      const src = typeof img === 'string' ? img : img?.url;
      if (src) mediaList.push({ type: 'image', url: src });
    });
  } else if (property.primary_image) {
    mediaList.push({ type: 'image', url: property.primary_image });
  }

  // Fallback placeholder image if no media found
  if (mediaList.length === 0) {
    mediaList.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
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
    navigate(`/property/${propId}`);
  };

  // WhatsApp click handler
  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const msg = encodeURIComponent(
      `Hello NewHomeLand, I am interested in property "${property.title}" (ID: ${propId}) located in ${locationText} listed for ${formatPrice(property.price)}. Please share legal paperwork and site visit details.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  // Helper for YouTube embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1&rel=0` : null;
  };

  const currentMedia = mediaList[currentIndex] || mediaList[0];
  const isCurrentVideo = currentMedia?.type === 'video';
  const ytEmbed = isCurrentVideo ? getYouTubeEmbedUrl(currentMedia.url) : null;

  return (
    <article
      className="property-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      {/* 1. Media Carousel Wrap (Slidable on Phone & Laptop) */}
      <div
        className="property-card-image-wrap"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Active Slide */}
        {isCurrentVideo ? (
          ytEmbed ? (
            <iframe
              src={ytEmbed}
              title={property.title}
              className="w-full h-full object-cover pointer-events-none"
              allow="autoplay; encrypted-media"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : (
          <img
            key={currentMedia.url}
            src={currentMedia.url}
            alt={property.title}
            className={`property-card-img ${isSold ? 'grayscale' : ''}`}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Video Playing Badge */}
        {isCurrentVideo && (
          <div className="card-video-playing-badge">
            <span className="playing-dot"></span>
            <span>Video Walkthrough</span>
          </div>
        )}

        {/* Media Type/Count Badge */}
        {mediaList.length > 1 && !isCurrentVideo && (
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
        <div className="card-badge-top-left">
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
          className="card-badge-top-right"
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
        <div className="card-location" style={{ marginBottom: '0.4rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
          <MapPin size={15} color="#d49a3f" />
          <span className="truncate">{locationText}</span>
        </div>

        {/* Title */}
        <h3
          className="card-title"
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

        {/* Area Specification */}
        <div style={{ paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', marginBottom: '1.35rem' }}>
          <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
            <Maximize2 size={16} color="#64748b" />
            <span style={{ fontSize: '0.95rem' }}>{property.area} {unitText}</span>
          </div>
        </div>

        {/* Card Footer: Price & Actions */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              EXPECTED PRICE
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b87d28', fontFamily: 'var(--font-heading)' }}>
              {property.price_display || formatPrice(property.price)}
            </span>
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
              <MessageCircle size={19} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default LandCard;
