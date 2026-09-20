import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, IndianRupee } from 'lucide-react';
import axios from 'axios';

const FilterBar = ({ onFilterChange }) => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [budgetOptions, setBudgetOptions] = useState([
    { value: '5000000', label: 'Up to ₹ 50 Lakh' },
    { value: '10000000', label: 'Up to ₹ 1 Crore' },
    { value: '20000000', label: 'Up to ₹ 2 Crore' },
    { value: '30000000', label: 'Up to ₹ 3 Crore' },
    { value: '40000000', label: 'Up to ₹ 4 Crore' }
  ]);
  const [filters, setFilters] = useState({
    location: 'All',
    propertyType: 'All',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get('/api/properties/filter-options');
        if (res.data?.success && res.data?.data) {
          if (Array.isArray(res.data.data.locations)) {
            setLocations(res.data.data.locations);
          }
          if (Array.isArray(res.data.data.propertyTypes)) {
            setPropertyTypes(res.data.data.propertyTypes);
          }
          if (Array.isArray(res.data.data.budgets) && res.data.data.budgets.length > 0) {
            setBudgetOptions(res.data.data.budgets);
          }
        }
      } catch (error) {
        console.error('Error fetching dynamic filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Map location and filters so backend property query handles them
      const appliedFilters = {
        propertyType: filters.propertyType,
        maxPrice: filters.maxPrice,
        location: filters.location !== 'All' ? filters.location : '',
        search: filters.location !== 'All' ? filters.location : ''
      };
      if (onFilterChange) {
        onFilterChange(appliedFilters);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const appliedFilters = {
      propertyType: filters.propertyType,
      maxPrice: filters.maxPrice,
      location: filters.location !== 'All' ? filters.location : '',
      search: filters.location !== 'All' ? filters.location : ''
    };
    if (onFilterChange) {
      onFilterChange(appliedFilters);
    }
  };

  return (
    <div className="hero-search-card" style={{ width: '100%', maxWidth: '1100px', margin: '2.5rem auto 0 auto' }}>
      <form onSubmit={handleSubmit} className="search-form-grid">
        {/* Location / City */}
        <div className="search-field">
          <label className="search-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b87d28', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
            <MapPin size={14} color="#d49a3f" />
            <span>LOCATION / CITY</span>
          </label>
          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="search-select"
            style={{ borderRadius: '12px', borderColor: '#94a3b8', height: '48px', padding: '0 2.5rem 0 1rem', fontWeight: 500 }}
          >
            <option value="All">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="search-field">
          <label className="search-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b87d28', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
            <Home size={14} color="#d49a3f" />
            <span>PROPERTY TYPE</span>
          </label>
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="search-select"
            style={{ borderRadius: '12px', borderColor: '#94a3b8', height: '48px', padding: '0 2.5rem 0 1rem', fontWeight: 500 }}
          >
            <option value="All">All Property Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Max Budget */}
        <div className="search-field">
          <label className="search-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b87d28', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
            <IndianRupee size={14} color="#d49a3f" />
            <span>MAX BUDGET</span>
          </label>
          <select
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            className="search-select"
            style={{ borderRadius: '12px', borderColor: '#94a3b8', height: '48px', padding: '0 2.5rem 0 1rem', fontWeight: 500 }}
          >
            <option value="">Any Budget</option>
            {budgetOptions.map((tier) => (
              <option key={tier.value} value={tier.value}>{tier.label}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="search-submit-btn"
          style={{
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e5b364 0%, #c48b32 100%)',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 4px 14px rgba(212, 154, 63, 0.35)'
          }}
        >
          <Search size={18} />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default FilterBar;

