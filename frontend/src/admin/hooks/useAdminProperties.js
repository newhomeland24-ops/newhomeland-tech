import { useState, useCallback } from 'react';
import axios from 'axios';

export const useAdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/properties/admin/all');
      setProperties(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch properties', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProperty = async (data, onProgress) => {
    try {
      const res = await axios.post('/api/properties', data, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      setProperties(prev => [res.data, ...prev]);
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : 'Failed to create property');
      return { success: false, message: errorMsg };
    }
  };

  const updateProperty = async (propertyId, data, onProgress) => {
    try {
      const res = await axios.put(`/api/properties/${propertyId}`, data, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      setProperties(prev => prev.map(p => (p.propertyId === propertyId || p._id === propertyId) ? res.data : p));
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : 'Failed to update property');
      return { success: false, message: errorMsg };
    }
  };

  const markSold = async (propertyId) => {
    try {
      const res = await axios.patch(`/api/properties/${propertyId}/sold`);
      setProperties(prev => prev.map(p => (p.propertyId === propertyId || p._id === propertyId) ? res.data : p));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update property' };
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      await axios.delete(`/api/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => (p.propertyId !== propertyId && p._id !== propertyId)));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete property' };
    }
  };

  return { properties, loading, error, fetchProperties, createProperty, updateProperty, markSold, deleteProperty };
};
