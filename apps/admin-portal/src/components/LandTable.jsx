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
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/50 text-gray-400 uppercase font-semibold text-xs tracking-wider border-b border-gray-700">
            <tr>
              <th className="px-6 py-4">Property Details</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status & Launch</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {properties.map((property) => (
              <tr key={property._id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-16 flex-shrink-0 bg-gray-700 rounded overflow-hidden mr-4 border border-gray-600">
                      {property.images && property.images.length > 0 ? (
                        <img src={property.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">No img</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1 line-clamp-1">{property.title}</div>
                      <div className="text-xs text-gray-400 flex gap-2">
                        <span>{property.location}</span>
                        <span>•</span>
                        <span>{property.area} {property.areaUnit}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-200">
                  {formatPrice(property.price)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    {property.status === 'sold' ? (
                       <span className="inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                         Sold
                       </span>
                    ) : property.status === 'draft' ? (
                       <span className="inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                         Draft
                       </span>
                    ) : new Date(property.publishedAt) > new Date() ? (
                       <span className="inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                         <Clock className="w-3 h-3 mr-1" /> Scheduled
                       </span>
                    ) : (
                       <span className="inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                         Published
                       </span>
                    )}
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(property.publishedAt).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {property.status !== 'sold' && (
                    <button 
                      onClick={() => handleMarkSold(property._id)}
                      className="text-gray-400 hover:text-green-400 transition-colors tooltip relative group"
                      title="Mark as Sold"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No properties found in database. Create your first listing above.
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
