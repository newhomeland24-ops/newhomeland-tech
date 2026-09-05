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

  const createProperty = async (data) => {
    try {
      const res = await axios.post('/api/properties', data);
      setProperties(prev => [res.data, ...prev]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create property' };
    }
  };

  const markSold = async (id) => {
    try {
      const res = await axios.patch(`/api/properties/${id}/sold`);
      setProperties(prev => prev.map(p => p._id === id ? res.data : p));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update property' };
    }
  };

  const deleteProperty = async (id) => {
    try {
      await axios.delete(`/api/properties/${id}`);
      setProperties(prev => prev.filter(p => p._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete property' };
    }
  };

  return { properties, loading, error, fetchProperties, createProperty, markSold, deleteProperty };
};
