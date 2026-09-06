import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, IndianRupee } from 'lucide-react';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: 'All',
    propertyType: 'All',
    maxPrice: ''
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      // Map location and filters so backend property query handles them
      const appliedFilters = {
        propertyType: filters.propertyType,
        maxPrice: filters.maxPrice,
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
      search: filters.location !== 'All' ? filters.location : ''
    };
    if (onFilterChange) {
      onFilterChange(appliedFilters);
    }
  };

  return (
    <div className="hero-search-card" style={{ width: '100%', maxWidth: '1100px', margin: '2.5rem auto 0 auto' }}>
      <form onSubmit={handleSubmit} className="search-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 160px', alignItems: 'flex-end', gap: '1.25rem' }}>
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
            style={{ borderRadius: '12px', borderColor: '#e2e8f0', height: '48px', padding: '0 1rem', fontWeight: 500 }}
          >
            <option value="All">All Locations (NCR)</option>
            <option value="Faridabad">Faridabad</option>
            <option value="Gurgaon">Gurgaon</option>
            <option value="Noida">Noida</option>
            <option value="Greater Noida">Greater Noida</option>
            <option value="Delhi">Delhi</option>
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
            style={{ borderRadius: '12px', borderColor: '#e2e8f0', height: '48px', padding: '0 1rem', fontWeight: 500 }}
          >
            <option value="All">All Property Types</option>
            <option value="Plot">Plots & Land</option>
            <option value="Residential">Residential Plot</option>
            <option value="Commercial">Commercial Plot</option>
            <option value="Villa">Luxury Villa</option>
            <option value="House">Independent House</option>
            <option value="Apartment">Apartment</option>
            <option value="Builder Floor">Builder Floor</option>
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
            style={{ borderRadius: '12px', borderColor: '#e2e8f0', height: '48px', padding: '0 1rem', fontWeight: 500 }}
          >
            <option value="">Any Budget</option>
            <option value="5000000">Up to ₹ 50 Lakh</option>
            <option value="10000000">Up to ₹ 1 Crore</option>
            <option value="20000000">Up to ₹ 2 Crore</option>
            <option value="50000000">Up to ₹ 5 Crore</option>
            <option value="100000000">Up to ₹ 10 Crore</option>
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

