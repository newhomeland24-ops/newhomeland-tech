import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.propertyType && filters.propertyType !== 'All') params.append('propertyType', filters.propertyType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const res = await axios.get(`/api/properties?${params.toString()}`);
        setProperties(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching properties', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
};

export const usePropertyDetails = (id) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/properties/${id}`);
        setProperty(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching property details', err);
        setError(err.response?.status === 404 ? 'Property not found or is no longer available.' : 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return { property, loading, error };
};
