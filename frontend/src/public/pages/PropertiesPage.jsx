import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Home, 
  IndianRupee, 
  SlidersHorizontal, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import LandCard from '../components/LandCard';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL parameters if present
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || 'All',
    propertyType: searchParams.get('property_type') || searchParams.get('propertyType') || 'All',
    maxPrice: searchParams.get('max_price') || searchParams.get('maxPrice') || '',
    status: searchParams.get('status') || 'All',
    sortBy: searchParams.get('sort') || 'newest'
  });

  const { properties, loading, error } = useProperties(filters);

  useEffect(() => {
    document.title = 'Verified Land & Properties Portfolio | NewHomeLand';
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Clear / reset all filters
  const handleReset = () => {
    const defaultFilters = {
      search: '',
      location: 'All',
      propertyType: 'All',
      maxPrice: '',
      status: 'All',
      sortBy: 'newest'
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.search !== '',
    filters.location !== 'All',
    filters.propertyType !== 'All',
    filters.maxPrice !== '',
    filters.status !== 'All',
    filters.sortBy !== 'newest'
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 1. Page Header */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800" style={{ background: 'linear-gradient(180deg, #0b1120 0%, #111827 100%)' }}>
        <div className="container">
          <div className="max-w-3xl">
            <div className="hero-tag" style={{ marginBottom: '1rem' }}>
              <Sparkles size={14} />
              <span>VERIFIED DIRECTORY</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              All Verified Properties
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Explore 100% legally clear residential plots, luxury independent villas, modern builder floors, and high-growth commercial land across Delhi NCR.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Listings Section with Filter Controls */}
      <main className="flex-grow py-8 pb-20">
        <div className="container">
          
          {/* Phone View Filter Trigger Button */}
          <div className="md:hidden flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Properties Catalog</span>
              <span className="text-base font-extrabold text-slate-900">
                {loading ? 'Searching...' : `${properties.length} Listings`}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="btn btn-gold btn-sm"
              style={{
                borderRadius: '12px',
                padding: '0.55rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <SlidersHorizontal size={15} />
              <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filter Options'}</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '0.2rem'
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Card: Always visible on desktop, toggled by button on phone */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-8 transition-all`}>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <SlidersHorizontal size={20} color="#d49a3f" />
                <span>Filter & Refine Listings</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Keyword Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={14} color="#d49a3f" /> Search Keyword
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="e.g. Sector 85, Villa..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                  {filters.search && (
                    <button 
                      type="button" 
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Location / City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} color="#d49a3f" /> Location / City
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Home size={14} color="#d49a3f" /> Property Type
                </label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee size={14} color="#d49a3f" /> Max Budget
                </label>
                <select
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                >
                  <option value="">Any Budget</option>
                  <option value="5000000">Up to ₹ 50 Lakh</option>
                  <option value="10000000">Up to ₹ 1 Crore</option>
                  <option value="20000000">Up to ₹ 2 Crore</option>
                  <option value="50000000">Up to ₹ 5 Crore</option>
                  <option value="100000000">Up to ₹ 10 Crore</option>
                </select>
              </div>
            </div>

            {/* Secondary Controls: Status & Sort Order */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 gap-4 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="available">Available Only</option>
                    <option value="sold">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Sort By:</span>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="text-slate-500 font-semibold">
                {loading ? 'Searching properties...' : `${properties.length} Listings Found`}
              </div>
            </div>

            {/* Mobile Done / Dismiss Button */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline btn-sm flex-1"
                  style={{ borderRadius: '10px' }}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="btn btn-dark btn-sm flex-1"
                style={{ borderRadius: '10px' }}
              >
                <span>Show {properties.length} Results</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
              {error}
            </div>
          )}

          {/* Properties Grid */}
          {loading ? (
            <div className="property-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm h-[400px] animate-pulse border border-gray-100">
                  <div className="h-[250px] bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (!Array.isArray(properties) || properties.length === 0) ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Matching Properties Found</h3>
              <p className="text-gray-500 text-sm mb-6">
                We could not find any properties matching your current filters. Try changing your search terms or clearing the filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-gold btn-sm"
                >
                  <RotateCcw size={15} />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <LandCard key={property._id || property.id} property={property} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PropertiesPage;
