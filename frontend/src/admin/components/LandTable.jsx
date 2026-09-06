import React, { useState, useMemo } from 'react';
import { Trash2, CheckCircle, Clock, Search, Filter, Video, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'];
const statusTabs = [
  { id: 'all', label: 'All Properties' },
  { id: 'published', label: 'Published' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Drafts' },
  { id: 'sold', label: 'Sold Out' },
];

const LandTable = ({ properties, markSold, deleteProperty }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');

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
      const matchesSearch = !query || 
        item.title?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item._id?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);

      // Category matching
      const matchesCategory = selectedCategory === 'All' || item.propertyType === selectedCategory;

      // Status matching
      const now = new Date();
      const isScheduled = new Date(item.publishedAt) > now;
      let matchesStatus = true;

      if (activeTab === 'published') {
        matchesStatus = item.status === 'published' && !isScheduled;
      } else if (activeTab === 'scheduled') {
        matchesStatus = isScheduled && item.status !== 'sold';
      } else if (activeTab === 'draft') {
        matchesStatus = item.status === 'draft';
      } else if (activeTab === 'sold') {
        matchesStatus = item.status === 'sold';
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
              if (tab.id === 'all') return true;
              if (tab.id === 'published') return p.status === 'published' && !isSched;
              if (tab.id === 'scheduled') return isSched && p.status !== 'sold';
              if (tab.id === 'draft') return p.status === 'draft';
              if (tab.id === 'sold') return p.status === 'sold';
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
              placeholder="Search by title, city, or ID..."
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
              const hasVideo = !!property.videoUrl;
              const primaryImg = (property.images && property.images.length > 0)
                ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url)
                : null;

              return (
                <tr key={property._id}>
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
                      <span>{property.location}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                      ID: #{property._id?.slice(-8).toUpperCase()}
                    </div>
                  </td>

                  {/* Type & Dimensions */}
                  <td>
                    <div className="badge-type-pill">
                      {property.propertyType}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: '0.3rem' }}>
                      {property.area} {property.areaUnit || 'Sq. Ft'}
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div style={{ fontWeight: 800, color: '#b87d28', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                      {formatPrice(property.price)}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {property.status === 'sold' ? (
                      <span className="badge-status sold">Sold</span>
                    ) : property.status === 'draft' ? (
                      <span className="badge-status draft">Draft</span>
                    ) : isScheduled ? (
                      <span className="badge-status scheduled">
                        <Clock size={12} /> Scheduled
                      </span>
                    ) : (
                      <span className="badge-status published">Published</span>
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
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                      {/* Mark Sold */}
                      {property.status !== 'sold' && (
                        <button
                          type="button"
                          onClick={() => handleMarkSold(property._id, property.title)}
                          className="btn-action-icon sold"
                          title="Mark as Sold"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(property._id, property.title)}
                        className="btn-action-icon delete"
                        title="Permanently Delete"
                      >
                        <Trash2 size={15} />
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
    </div>
  );
};

export default LandTable;
