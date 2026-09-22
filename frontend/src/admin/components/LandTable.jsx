import React, { useState, useMemo } from 'react';
import { Trash2, CheckCircle, Clock, Search, Filter, Video, MapPin, Building, ExternalLink, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import PropertyDetailModal from './PropertyDetailModal';
import PropTypes from 'prop-types';

const categories = ['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'];
const statusTabs = [
  { id: 'all', label: 'All Properties' },
  { id: 'published', label: 'Published' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Drafts' },
  { id: 'sold', label: 'Sold Out' },
];

const LandTable = ({ properties, markSold, deleteProperty, onEditProperty }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleMarkSold = (id, title) => {
    setConfirmDialog({
      type: 'sold',
      id,
      title,
      message: `Mark "${title}" as SOLD? It will remain visible with a Sold Out banner and auto-expire in 5 days.`
    });
  };

  const handleDelete = (id, title) => {
    setConfirmDialog({
      type: 'delete',
      id,
      title,
      message: `Are you sure you want to PERMANENTLY delete "${title}" and all its photos/videos? This cannot be undone.`
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmDialog) return;
    const { type, id, title } = confirmDialog;
    setConfirmDialog(null);

    if (type === 'sold') {
      toast.loading('Updating listing status...', { id: 'sold' });
      const res = await markSold(id);
      if (res.success) {
        toast.success(`"${title}" marked as Sold`, { id: 'sold' });
        if (selectedProperty && (selectedProperty.propertyId === id || selectedProperty._id === id)) {
          setSelectedProperty(prev => prev ? { ...prev, status: 'sold' } : null);
        }
      } else {
        toast.error(res.message || 'Failed to update status', { id: 'sold' });
      }
    } else if (type === 'delete') {
      toast.loading('Deleting listing and assets...', { id: 'delete' });
      const res = await deleteProperty(id);
      if (res.success) {
        toast.success(`"${title}" deleted successfully`, { id: 'delete' });
        if (selectedProperty && (selectedProperty.propertyId === id || selectedProperty._id === id)) {
          setSelectedProperty(null);
        }
      } else {
        toast.error(res.message || 'Failed to delete listing', { id: 'delete' });
      }
    }
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Search matching
      const query = search.trim().toLowerCase();
      const locStr = `${item.location?.address || ''} ${item.location?.locality || ''} ${item.location?.city || ''}`;

      const matchesSearch = !query || 
        item.title?.toLowerCase().includes(query) ||
        locStr.toLowerCase().includes(query) ||
        item.propertyId?.toLowerCase().includes(query) ||
        item._id?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);

      // Category matching
      const matchesCategory = selectedCategory === 'All' || item.propertyType === selectedCategory;

      // Status matching
      const now = new Date();
      const isScheduled = new Date(item.publishedAt) > now;
      const isSoldStatus = item.status === 'sold' || item.status === 'Sold';
      const isDraftStatus = item.status === 'draft' || item.status === 'Under Offer';
      let matchesStatus = true;

      if (activeTab === 'published') {
        matchesStatus = (item.status === 'published' || item.status === 'Available') && !isScheduled;
      } else if (activeTab === 'scheduled') {
        matchesStatus = isScheduled && !isSoldStatus;
      } else if (activeTab === 'draft') {
        matchesStatus = isDraftStatus;
      } else if (activeTab === 'sold') {
        matchesStatus = isSoldStatus;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [properties, search, selectedCategory, activeTab]);

  return (
    <div className="admin-table-wrapper">
      {/* Controls Bar: Search, Category & Status Tabs */}
      <div className="admin-filter-toolbar">
        {/* Status Filter Tabs */}
        <div className="status-tabs-row">
          {statusTabs.map((tab) => {
            const count = properties.filter((p) => {
              const now = new Date();
              const isSched = new Date(p.publishedAt) > now;
              const isSoldStatus = p.status === 'sold' || p.status === 'Sold';
              const isDraftStatus = p.status === 'draft' || p.status === 'Under Offer';
              if (tab.id === 'all') return true;
              if (tab.id === 'published') return (p.status === 'published' || p.status === 'Available') && !isSched;
              if (tab.id === 'scheduled') return isSched && !isSoldStatus;
              if (tab.id === 'draft') return isDraftStatus;
              if (tab.id === 'sold') return isSoldStatus;
              return true;
            }).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`status-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="tab-counter">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Row */}
        <div className="search-category-row">
          <div className="admin-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties by title, city, or ID"
              className="admin-search-input"
            />
            {search && (
              <button 
                type="button" 
                onClick={() => setSearch('')}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-select-wrap">
            <Filter size={15} color="#64748b" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-category-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-table-container">
        <table className="admin-table responsive-card-table md:min-w-[800px]">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Media</th>
              <th>Property Listing</th>
              <th>Type / Dimensions</th>
              <th>Price</th>
              <th>Publish Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((property) => {
              const now = new Date();
              const isScheduled = new Date(property.publishedAt) > now;
              const hasVideo = property.media?.videos?.length > 0;
              const primaryImg = property.media?.images?.[0]?.url || null;

              const currentPropertyId = property.propertyId || property._id;
              const locationDisplay = [property.location?.city, property.location?.state].filter(Boolean).join(', ') || property.location?.locality || property.location?.address || 'Delhi NCR';

              const effectivePrice = property.pricing?.price;
              const effectiveArea = property.specifications?.carpetAreaSqFt;
              const bedroomsCount = property.specifications?.bedrooms;

              const isSoldStatus = property.status === 'sold' || property.status === 'Sold';
              const isDraftStatus = property.status === 'draft' || property.status === 'Under Offer';

              return (
                <tr key={currentPropertyId}>
                  {/* Thumbnail */}
                  <td 
                    data-label="Media"
                    onClick={() => setSelectedProperty(property)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full property details"
                  >
                    <div className="table-thumb-wrap">
                      {primaryImg ? (
                        <img src={primaryImg} alt={property.title} className="table-thumb-img" />
                      ) : (
                        <div className="table-thumb-placeholder">
                          <Building size={18} color="#94a3b8" />
                        </div>
                      )}
                      {hasVideo && (
                        <div className="thumb-video-indicator" title="Walkthrough Video Included">
                          <Video size={10} color="#ffffff" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Location */}
                  <td 
                    data-label="Property"
                    onClick={() => setSelectedProperty(property)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full property details"
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.96rem', lineHeight: 1.3 }}>
                      {property.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <MapPin size={13} color="#d49a3f" />
                      <span>{locationDisplay}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                      ID: #{currentPropertyId}
                    </div>
                  </td>

                  {/* Type & Dimensions */}
                  <td data-label="Type & Details">
                    <div className="badge-type-pill">
                      {property.propertyType}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '0.3rem' }}>
                      {(property.specifications?.bhkType || bedroomsCount) ? `${property.specifications?.bhkType || `${bedroomsCount} BHK`} • ` : ''}{effectiveArea ? `${effectiveArea} ${property.specifications?.areaUnit || property.areaUnit || 'Sq. Ft'}` : (property.propertyType === 'Land' ? 'Plots' : (property.listingType ? `For ${property.listingType}` : property.propertyType || 'Standard'))}
                    </div>
                  </td>

                  {/* Price */}
                  <td data-label="Price">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#b87d28', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                        {property.price_display || formatPrice(effectivePrice)}
                      </span>
                      {property.pricing?.priceType === 'Per Unit' && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                          (per {property.specifications?.areaUnit || 'Unit'})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td data-label="Status">
                    {isSoldStatus ? (
                      <span className="badge-status sold">Sold</span>
                    ) : isDraftStatus ? (
                      <span className="badge-status draft">{property.status === 'Under Offer' ? 'Under Offer' : 'Draft'}</span>
                    ) : isScheduled ? (
                      <span className="badge-status scheduled">
                        <Clock size={12} /> Scheduled
                      </span>
                    ) : (
                      <span className="badge-status published">{property.status === 'Available' ? 'Available' : 'Published'}</span>
                    )}

                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                      {new Date(property.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div className="action-btn-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Edit Property Button */}
                      {onEditProperty && (
                        <button
                          type="button"
                          onClick={() => onEditProperty(property)}
                          className="btn-text-action"
                          style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.6rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                      )}

                      {/* Mark Sold */}
                      <button
                        type="button"
                        onClick={() => { if (!isSoldStatus) handleMarkSold(currentPropertyId, property.title); }}
                        disabled={isSoldStatus}
                        className="btn-text-action"
                        style={{ color: isSoldStatus ? '#9ca3af' : '#059669', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.6rem', border: 'none', background: 'transparent', cursor: isSoldStatus ? 'not-allowed' : 'pointer', opacity: isSoldStatus ? 0.6 : 1 }}
                      >
                        {isSoldStatus ? 'Sold Out' : 'Mark Sold'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(currentPropertyId, property.title)}
                        className="btn-text-action"
                        style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.6rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProperties.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
                  <Building size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#334155' }}>
                    No matching properties found
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
                    {search || selectedCategory !== 'All' || activeTab !== 'all'
                      ? 'Try adjusting your search query or filters.'
                      : 'Your property catalog is currently empty. Add your first listing using the "New Listing" button above.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Property Details Modal for Admin */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onEdit={onEditProperty}
        onMarkSold={(id, title) => handleMarkSold(id, title)}
        onDelete={(id, title) => handleDelete(id, title)}
      />

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {confirmDialog.type === 'sold' ? 'Mark as Sold' : 'Delete Property'}
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition-colors ${confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LandTable.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    propertyId: PropTypes.string,
    _id: PropTypes.string,
    status: PropTypes.string,
    propertyType: PropTypes.string,
    title: PropTypes.string,
    publishedAt: PropTypes.string,
    location: PropTypes.shape({
      address: PropTypes.string,
      locality: PropTypes.string,
      city: PropTypes.string
    }),
    pricing: PropTypes.shape({
      price: PropTypes.number
    }),
    specifications: PropTypes.shape({
      carpetAreaSqFt: PropTypes.number,
      bedrooms: PropTypes.number
    }),
    media: PropTypes.shape({
      images: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string
      })),
      videos: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string
      }))
    })
  })).isRequired,
  markSold: PropTypes.func.isRequired,
  deleteProperty: PropTypes.func.isRequired,
  onEditProperty: PropTypes.func
};

export default LandTable;
