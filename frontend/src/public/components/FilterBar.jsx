import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, IndianRupee } from 'lucide-react';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Debounce 500ms

    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <div className="hero-search-card" style={{ margin: '0 auto', maxWidth: '1000px', position: 'relative', top: '-40px', zIndex: 20 }}>
      <form onSubmit={handleSubmit} className="search-form-grid">
        {/* Search Keyword */}
        <div className="search-field">
          <label className="search-label">
            <Search size={14} color="#d49a3f" />
            <span>Search Keyword</span>
          </label>
          <input
            type="text"
            name="search"
            placeholder="e.g. Faridabad..."
            value={filters.search}
            onChange={handleChange}
            className="search-select"
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 0' }}
          />
        </div>

        {/* Property Type */}
        <div className="search-field">
          <label className="search-label">
            <Home size={14} color="#d49a3f" />
            <span>Property Type</span>
          </label>
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="search-select"
          >
            <option value="All">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        {/* Max Budget */}
        <div className="search-field">
          <label className="search-label">
            <IndianRupee size={14} color="#d49a3f" />
            <span>Max Budget</span>
          </label>
          <select
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            className="search-select"
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
        <button type="submit" className="search-submit-btn">
          <Search size={18} />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default FilterBar;
