import React from 'react';
import { Trash2, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const LandTable = ({ properties, markSold, deleteProperty }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleMarkSold = async (id) => {
    if (window.confirm('Are you sure you want to mark this property as sold? It will be deleted in 5 days.')) {
      toast.loading('Updating...', { id: 'sold' });
      const res = await markSold(id);
      if (res.success) toast.success('Marked as sold', { id: 'sold' });
      else toast.error(res.message, { id: 'sold' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this listing and its assets?')) {
      toast.loading('Deleting...', { id: 'delete' });
      const res = await deleteProperty(id);
      if (res.success) toast.success('Listing deleted', { id: 'delete' });
      else toast.error(res.message, { id: 'delete' });
    }
  };

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Property Title</th>
            <th>Type / Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property._id}>
              <td style={{ fontWeight: 600 }}>{property.title}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{property.propertyType}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{property.location} • {property.area} {property.areaUnit}</div>
              </td>
              <td style={{ fontWeight: 700, color: '#b87d28' }}>{formatPrice(property.price)}</td>
              <td>
                {property.status === 'sold' ? (
                  <span className="badge-status sold">Sold</span>
                ) : property.status === 'draft' ? (
                  <span className="badge-status draft">Draft</span>
                ) : new Date(property.publishedAt) > new Date() ? (
                  <span className="badge-status in-progress"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Scheduled</span>
                ) : (
                  <span className="badge-status new">Published</span>
                )}
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  {new Date(property.publishedAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <div className="action-btn-group">
                  {property.status !== 'sold' && (
                    <button 
                      onClick={() => handleMarkSold(property._id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#10b981', borderColor: '#10b981' }}
                      title="Mark as Sold"
                    >
                      <CheckCircle size={14} /> Sold
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                    title="Delete permanently"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {properties.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No properties found in database. Create your first listing above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LandTable;
