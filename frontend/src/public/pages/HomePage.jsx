import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, BadgePercent } from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import LandCard from '../components/LandCard';
import { useProperties } from '../hooks/useProperties';
import { useSettings } from '../../context/SettingsContext';
import MaintenancePage from './MaintenancePage';
import villaBg from '../../assets/villa-1.jpg';

const HomePage = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const [filters, setFilters] = useState({});
  const { properties, loading: propertiesLoading, error } = useProperties(filters);

  const businessName = settings.business_name || 'NewHomeDevelopers';

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (settings.isMaintenance) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
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
              <span>VERIFIED {businessName.toUpperCase()} BROKERAGE</span>
            </div>

            <h1 className="hero-title">
              {settings.hero_title || 'Find Your Perfect Property in Delhi NCR'}
            </h1>

            <p className="hero-subtitle">
              {settings.hero_subtitle || 'Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.'}
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
                <LandCard key={property.propertyId || property._id || property.id} property={property} />
              ))}
            </div>
          )}

          {/* Section: Why Buy Through {settings.business_name} */}
          <div style={{ marginTop: '5rem', padding: '3rem 2rem', background: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d49a3f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Exclusive Broker Guarantee
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', marginBottom: '0.65rem' }}>
                Why Buy Through {businessName}?
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {settings.about_summary || 'Premier real estate advisory firm dedicated to assisting homebuyers, investors, and developers in acquiring verified properties.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
              <div style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d49a3f', marginBottom: '1rem' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>100% Legal Title Clear</h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                  Every listed plot, villa, and commercial asset undergoes thorough legal vetting, title deeds verification, and registry check.
                </p>
              </div>

              <div style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '1rem' }}>
                  <MapPin size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Free Guided Site Visits</h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                  Book personalized chauffeur-assisted site tours to inspect demarcations, road widths, and surrounding infrastructure.
                </p>
              </div>

              <div style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
                  <BadgePercent size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Transparent Pricing</h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                  Zero hidden brokerage premiums. Direct negotiation support with landowners and developers for clear terms.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;
