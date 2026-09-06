import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useProperties';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';
import MediaModal from '../components/MediaModal';
import {
  MapPin,
  Maximize2,
  Building,
  CheckCircle,
  Phone,
  MessageCircle,
  Calendar,
  ShieldCheck,
  Share2,
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { maintenance, loading: maintenanceLoading } = useMaintenance();
  const { property, loading, error } = usePropertyDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phone touch swipe handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 40;

  useEffect(() => {
    if (property?.title) {
      document.title = `${property.title} | NewHomeLand`;
    }
  }, [property]);

  if (maintenanceLoading || loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', color: '#64748b' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Loading Property Details...
        </h2>
        <p>Retrieving high-resolution media and verified property records</p>
      </div>
    );
  }

  if (maintenance.isMaintenance) {
    return <MaintenancePage message={maintenance.message} />;
  }

  if (error || !property) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <AlertTriangle size={56} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Property Listing Unavailable
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
            {error || 'The property you are looking for has been sold, removed, or is awaiting publication.'}
          </p>
          <Link to="/" className="btn btn-gold">
            Browse All Available Properties
          </Link>
        </div>
      </div>
    );
  }

  const isSold = property.status === 'sold' || property.status === 'Sold';
  
  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price on Request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Build Media List (Videos + Images)
  const mediaList = [];
  const videoUrl = property.videoUrl || (property.videos && property.videos.length > 0 ? (property.videos[0]?.video_url || property.videos[0]?.url || property.videos[0]) : null);
  if (videoUrl) {
    mediaList.push({ type: 'video', url: videoUrl });
  }

  if (property.images && property.images.length > 0) {
    property.images.forEach(img => {
      const src = typeof img === 'string' ? img : (img?.url || img?.secure_url);
      if (src) mediaList.push({ type: 'image', url: src });
    });
  } else if (property.primary_image) {
    mediaList.push({ type: 'image', url: property.primary_image });
  }

  if (mediaList.length === 0) {
    mediaList.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    });
  }

  // Helper for YouTube embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&controls=1&rel=0` : null;
  };

  const currentMedia = mediaList[currentIndex] || mediaList[0];
  const isCurrentVideo = currentMedia?.type === 'video';
  const ytEmbed = isCurrentVideo ? getYouTubeEmbedUrl(currentMedia.url) : null;

  const handlePrevious = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrevious();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello NewHomeLand, I am interested in property "${property.title}" (ID: ${property._id}) located in ${property.location} listed for ${formatPrice(property.price)}. Please share legal paperwork and site visit details.`
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  const statusClass = isSold ? 'sold' : 'available';
  const cleanPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  // 1. Media Viewer Card
  const mediaCard = (
    <div
      className="detail-media-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="detail-media-viewer"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: 'pointer' }}
        title="Click to enlarge photo/video"
      >
        {/* Active Media */}
        {isCurrentVideo ? (
          ytEmbed ? (
            <iframe
              src={ytEmbed}
              title={property.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )
        ) : (
          <img
            key={currentMedia.url}
            src={currentMedia.url}
            alt={property.title}
            className={`detail-media-img ${isSold ? 'grayscale' : ''}`}
          />
        )}

        {/* Video Badge */}
        {isCurrentVideo && (
          <div className="media-type-badge">
            <span className="live-dot" />
            <span>Video Walkthrough</span>
          </div>
        )}

        {/* Counter Badge */}
        <div className="media-counter-badge">
          <span>{currentIndex + 1} / {mediaList.length}</span>
        </div>

        {/* Navigation Arrow Buttons */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              className="detail-carousel-arrow prev"
              aria-label="Previous Media"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="detail-carousel-arrow next"
              aria-label="Next Media"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {mediaList.length > 1 && (
        <div className="detail-media-thumbnails">
          {mediaList.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`detail-thumbnail-item ${idx === currentIndex ? 'active' : ''}`}
              aria-label={`Go to media ${idx + 1}`}
            >
              {item.type === 'video' ? (
                <div className="thumbnail-video-wrap">
                  <Play size={16} fill="#ffffff" color="#ffffff" />
                </div>
              ) : (
                <img src={item.url} alt={`Thumb ${idx + 1}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Property Header / Details Card (Title, Price, Badges, Listing ID)
  const headerCard = (
    <div className="detail-header-card">
      <div className="detail-header-card-top">
        <div className="detail-badges">
          <span className={`badge-status ${statusClass}`}>
            {isSold ? 'Sold' : 'Available'}
          </span>
          <span className="detail-type-badge">
            {property.propertyType}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem', borderRadius: '8px', padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>

      <h1 className="detail-title">{property.title}</h1>

      <div className="detail-location">
        <MapPin size={16} color="#d49a3f" />
        <span>{property.location}</span>
      </div>

      {/* Expected Price Callout */}
      <div className="detail-price-box">
        <span className="detail-price-label">Expected Price</span>
        <div className="detail-price">{formatPrice(property.price)}</div>
      </div>

      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
        Listing ID: #{property._id?.slice(-8).toUpperCase()}
      </div>
    </div>
  );

  // 3. Broker Card
  const brokerCard = (
    <div className="broker-card">
      <div className="broker-header">
        <div className="broker-avatar">
          NH
        </div>
        <div className="broker-info">
          <h4>NewHomeLand Brokerage</h4>
          <p>Verified Property Advisory</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.2rem' }}>
            <ShieldCheck size={14} /> Title Verified
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="broker-actions-grid">
        {cleanPhone && (
          <a href={`tel:${cleanPhone}`} className="btn-call-action">
            <Phone size={18} />
            <span>Call Broker: {cleanPhone}</span>
          </a>
        )}

        {cleanPhone && (
          <a
            href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-action"
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
        )}
        
        <p className="text-xs text-center text-gray-400 mt-4">
          Reference ID: <span className="font-mono text-gray-600">{property._id?.slice(-6).toUpperCase()}</span>
        </p>
      </div>
    </div>
  );

  // 4. Specifications Card
  const specsCard = (
    <div className="detail-card detail-specs-card">
      <h3 className="detail-card-title">
        <Building size={20} />
        <span>Property Specifications & Dimensions</span>
      </h3>

      <div className="specs-grid">
        <div className="spec-box">
          <span className="spec-box-label">Total Area</span>
          <span className="spec-box-val">{property.area} {property.areaUnit || 'Sq. Ft'}</span>
        </div>

        <div className="spec-box">
          <span className="spec-box-label">Property Category</span>
          <span className="spec-box-val">{property.propertyType}</span>
        </div>

        <div className="spec-box">
          <span className="spec-box-label">Location / City</span>
          <span className="spec-box-val">{property.location}</span>
        </div>

        <div className="spec-box">
          <span className="spec-box-label">Listing Status</span>
          <span className="spec-box-val" style={{ color: isSold ? '#ef4444' : '#10b981' }}>
            {isSold ? 'Sold Out' : 'Available'}
          </span>
        </div>
      </div>
    </div>
  );

  // 5. Description Card
  const descCard = (
    <div className="detail-card detail-description-card">
      <h3 className="detail-card-title">
        <span>About this Property</span>
      </h3>
      <div className="property-description-text whitespace-pre-wrap" style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.75' }}>
        {property.description || "No detailed description provided for this property listing."}
      </div>
    </div>
  );

  return (
    <div className="property-detail-page">
      <div className="container-wide">
        {/* Sold / Reserved Alert Notice */}

        {/* Sold / Reserved Alert Notice */}
        {isSold && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>
              This property has been SOLD. Browse our other listings or contact us for similar properties.
            </span>
          </div>
        )}

        {/* Layout: On mobile -> 1. Video/Image slider, 2. Details card (price/title), 3. Broker, 4. Specs, 5. Description
                    On desktop -> Left column (Media, Specs, Description), Right column (Sticky Details + Broker) */}
        {isMobile ? (
          <div className="detail-mobile-layout">
            {mediaCard}
            {headerCard}
            {brokerCard}
            {specsCard}
            {descCard}
          </div>
        ) : (
          <div className="detail-layout-grid">
            <div className="detail-left-col">
              {mediaCard}
              {specsCard}
              {descCard}
            </div>
            <div className="sticky-sidebar">
              {headerCard}
              {brokerCard}
            </div>
          </div>
        )}
      </div>

      <MediaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        images={property.images} 
        videoUrl={property.videoUrl} 
      />
    </div>
  );
};

export default PropertyDetailPage;
