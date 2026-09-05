import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Camera, Play, MessageCircle } from 'lucide-react';

const LandCard = ({ property }) => {
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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img 
          src={coverImage} 
          alt={property.title} 
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale' : ''}`}
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          {isSold ? (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Sold out
            </span>
          ) : (
            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Available
            </span>
          )}
        </div>

        {/* Media Indicators */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {property.images && property.images.length > 0 && (
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              {property.images.length}
            </span>
          )}
          {property.videoUrl && (
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
            {property.propertyType}
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/property/${property._id}`} className="block">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {property.title}
            </h3>
          </Link>
        </div>
        
        <p className="text-2xl font-bold text-primary-600 mb-4">
          {formatPrice(property.price)}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm truncate" title={property.location}>{property.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Maximize className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{property.area} {property.areaUnit}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
          <Link 
            to={`/property/${property._id}`}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-center py-2.5 rounded-xl font-medium transition-colors border border-gray-200"
          >
            View Details
          </Link>
          <a 
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-green-500/20 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Inquire
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandCard;
