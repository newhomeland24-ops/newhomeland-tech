import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const categories = ['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'];

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Debounce 500ms

    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category) => {
    setFilters(prev => ({ ...prev, propertyType: category }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    });
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="bg-white sticky top-20 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Top Search & Mobile Toggle */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
              placeholder="Search by locality or keyword..."
            />
          </div>
          <button 
            className="md:hidden p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Category Pills & Advanced Filters */}
        <div className="hidden md:flex items-center justify-between mt-4 gap-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.propertyType === category
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0 pb-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleInputChange}
                className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleInputChange}
                className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-gray-900/50 backdrop-blur-sm md:hidden">
          <div className="bg-white w-full rounded-t-3xl p-6 h-[80vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filters.propertyType === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range (₹)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h4>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={clearFilters}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
