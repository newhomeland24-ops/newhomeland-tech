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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleMarkSold = async (id, title) => {
    if (window.confirm(`Mark "${title}" as SOLD? It will remain visible with a Sold Out banner and auto-expire in 5 days.`)) {
      toast.loading('Updating listing status...', { id: 'sold' });
      const res = await markSold(id);
      if (res.success) toast.success(`"${title}" marked as Sold`, { id: 'sold' });
      else toast.error(res.message || 'Failed to update status', { id: 'sold' });
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete "${title}" and all its photos/videos? This cannot be undone.`)) {
      toast.loading('Deleting listing and assets...', { id: 'delete' });
      const res = await deleteProperty(id);
      if (res.success) toast.success(`"${title}" deleted successfully`, { id: 'delete' });
      else toast.error(res.message || 'Failed to delete listing', { id: 'delete' });
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
        <table className="admin-table">
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
              const locationDisplay = [property.location?.locality, property.location?.city].filter(Boolean).join(', ') || property.location?.address || 'Delhi NCR';

              const effectivePrice = property.pricing?.price;
              const effectiveArea = property.specifications?.carpetAreaSqFt;
              const bedroomsCount = property.specifications?.bedrooms;

              const isSoldStatus = property.status === 'sold' || property.status === 'Sold';
              const isDraftStatus = property.status === 'draft' || property.status === 'Under Offer';

              return (
                <tr 
                  key={currentPropertyId}
                  onClick={() => setSelectedProperty(property)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full property details"
                >
                  {/* Thumbnail */}
                  <td>
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
                  <td>
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
                  <td>
                    <div className="badge-type-pill">
                      {property.propertyType}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '0.3rem' }}>
                      {(property.specifications?.bhkType || bedroomsCount) ? `${property.specifications?.bhkType || `${bedroomsCount} BHK`} • ` : ''}{effectiveArea ? `${effectiveArea} ${property.specifications?.areaUnit || property.areaUnit || 'Sq. Ft'}` : (property.propertyType === 'Land' ? 'Plots' : (property.listingType ? `For ${property.listingType}` : property.propertyType || 'Standard'))}
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div style={{ fontWeight: 800, color: '#b87d28', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                      {formatPrice(effectivePrice)}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
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
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div className="action-btn-group" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {/* Open Admin Details Modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(property);
                        }}
                        className="btn-action-icon view"
                        title="View Property Details"
                      >
                        <Eye size={19} />
                      </button>

                      {/* Edit Property Button */}
                      {onEditProperty && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProperty(property);
                          }}
                          className="btn-action-icon"
                          title="Edit Property Details"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '11px',
                            border: '1.5px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#2563eb'
                          }}
                        >
                          <Edit3 size={18} />
                        </button>
                      )}

                      {/* View Live Public Page */}
                      <a
                        href={`/properties/${currentPropertyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action-icon"
                        title="Open Public Listing Page"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '44px',
                          height: '44px',
                          borderRadius: '11px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569'
                        }}
                      >
                        <ExternalLink size={18} />
                      </a>

                      {/* Mark Sold */}
                      {property.status !== 'sold' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkSold(currentPropertyId, property.title);
                          }}
                          className="btn-action-icon sold"
                          title="Mark as Sold"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(currentPropertyId, property.title)}
                        className="btn-action-icon delete"
                        title="Permanently Delete"
                      >
                        <Trash2 size={20} />
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
        onMarkSold={async (id, title) => {
          await handleMarkSold(id, title);
          setSelectedProperty(prev => prev ? { ...prev, status: 'sold' } : null);
        }}
        onDelete={async (id, title) => {
          await handleDelete(id, title);
          setSelectedProperty(null);
        }}
      />
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
