import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { maintenance, loading: maintenanceLoading } = useMaintenance();
  const { property, loading, error } = usePropertyDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="property-detail-page">
      <div className="container-wide">
        {/* Breadcrumbs */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/">Properties</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{property.title}</span>
        </nav>

        {/* Detail Header */}
        <div className="detail-header">
          <div className="detail-title-group">
            <div className="detail-badges">
              <span className={`badge-status ${statusClass}`}>
                {isSold ? 'Sold' : 'Available'}
              </span>
              <span className="detail-type-badge">
                {property.propertyType}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Listing ID: {property._id.slice(-8).toUpperCase()}
              </span>
            </div>

            <h1 className="detail-title">{property.title}</h1>

            <div className="detail-location">
              <MapPin size={18} color="#d49a3f" />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="detail-price-wrap">
            <span className="detail-price-label">Expected Price</span>
            <div className="detail-price">{formatPrice(property.price)}</div>
            <button
              onClick={handleShare}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.75rem', gap: '0.35rem' }}
            >
              <Share2 size={14} />
              <span>Share Property</span>
            </button>
          </div>
        </div>

        {/* Sold / Reserved Alert Notice */}
        {isSold && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>
              This property has been SOLD. Browse our other listings or contact us for similar properties.
            </span>
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="detail-layout-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* Custom Gallery view - replacing the original component with our inline Media Gallery Grid */}
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group mb-8" onClick={() => setIsModalOpen(true)}>
              <div className={`aspect-[21/9] bg-gray-200 ${isSold ? 'grayscale' : ''}`}>
                 <img src={coverImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" /> View Media Gallery
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="detail-card">
              <h3 className="detail-card-title">
                <Building size={20} />
                <span>Property Specifications & Dimensions</span>
              </h3>

              <div className="specs-grid">
                <div className="spec-box">
                  <span className="spec-box-label">Area</span>
                  <span className="spec-box-val">{property.area} {property.areaUnit || 'sq ft'}</span>
                </div>

                <div className="spec-box">
                  <span className="spec-box-label">Property Category</span>
                  <span className="spec-box-val">{property.propertyType}</span>
                </div>

                <div className="spec-box">
                  <span className="spec-box-label">Listed On</span>
                  <span className="spec-box-val">{new Date(property.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-card">
              <h3 className="detail-card-title">
                <span>About this Property</span>
              </h3>
              <div className="property-description-text whitespace-pre-wrap">
                {property.description || "No description provided for this property."}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Broker Action Card */}
          <div>
            <div className="sticky-sidebar">
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
                    Reference ID: <span className="font-mono text-gray-600">{property._id.slice(-6).toUpperCase()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
