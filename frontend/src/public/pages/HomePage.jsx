import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import LandCard from '../components/LandCard';
import { useProperties } from '../hooks/useProperties';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';
import villaBg from '../../assets/villa-1.jpg';

const HomePage = () => {
  const { maintenance, loading: maintenanceLoading } = useMaintenance();
  const [filters, setFilters] = useState({});
  const { properties, loading: propertiesLoading, error } = useProperties(filters);

  if (maintenanceLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (maintenance.isMaintenance) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="hero-section" style={{ marginTop: '-80px', paddingTop: 'calc(80px + 3.5rem)', paddingBottom: '4.5rem' }}>
        <div
          className="hero-bg-overlay"
          style={{ backgroundImage: `url(${villaBg})` }}
        />
        <div className="hero-gradient-overlay" />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content" style={{ marginBottom: '1.5rem' }}>
            <div className="hero-tag">
              <Sparkles size={14} />
              <span>VERIFIED DELHI NCR REAL ESTATE BROKERAGE</span>
            </div>

            <h1 className="hero-title">
              Find Your Perfect Plot, Villa &<br />
              <span>Dream Home</span>
            </h1>

            <p className="hero-subtitle">
              Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.
            </p>
          </div>

          {/* Hero Search Card inside Hero */}
          <FilterBar onFilterChange={setFilters} />
        </div>
      </section>

      <main className="flex-grow bg-gray-50 py-12 pb-24 md:pb-12">
        <div className="container">

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>
              Discover Premium Properties
            </h2>
            <Link
              to="/properties"
              className="btn btn-gold"
              style={{
                borderRadius: '12px',
                padding: '0.65rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>All Properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
              {error}
            </div>
          )}

          {propertiesLoading ? (
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
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
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

export default HomePage;
