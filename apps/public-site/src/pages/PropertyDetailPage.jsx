import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePropertyDetails } from '../hooks/useProperties';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';
import MediaModal from '../components/MediaModal';
import { MapPin, Maximize, Calendar, Tag, ArrowLeft, Camera, Play, MessageCircle } from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { maintenance, loading: maintenanceLoading } = useMaintenance();
  const { property, loading, error } = usePropertyDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (maintenanceLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (maintenance.isMaintenance) {
    return <MaintenancePage message={maintenance.message} />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || "Property Not Found"}</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to all properties
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isSold ? (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Sold
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Available
                  </span>
                )}
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {property.propertyType}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 mt-2 text-lg">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                {property.location}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-gray-500 text-sm font-medium mb-1">Asking Price</p>
              <p className="text-4xl font-extrabold text-primary-600">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setIsModalOpen(true)}>
          <div className={`aspect-[21/9] bg-gray-200 ${isSold ? 'grayscale' : ''}`}>
             <img src={coverImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <Camera className="w-5 h-5" /> View Media Gallery
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Maximize className="w-5 h-5 mr-2 text-primary-500" />
                    <span className="font-medium text-sm">Total Area</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.area} <span className="text-sm font-normal text-gray-500">{property.areaUnit}</span></p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Tag className="w-5 h-5 mr-2 text-primary-500" />
                    <span className="font-medium text-sm">Zoning</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.propertyType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                    <span className="font-medium text-sm">Listed On</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{new Date(property.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-primary max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description || "No description provided for this property."}
              </div>
            </section>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interested?</h3>
              <p className="text-gray-500 text-sm mb-6">Contact our broker directly to schedule a site visit or request legal documents.</p>
              
              <a 
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white text-center py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 mb-4"
              >
                <MessageCircle className="w-6 h-6" />
                Chat on WhatsApp
              </a>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Reference ID: <span className="font-mono text-gray-600">{property._id.slice(-6).toUpperCase()}</span>
              </p>
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
