import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import LandCard from '../components/LandCard';
import { useProperties } from '../hooks/useProperties';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';

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
      <FilterBar onFilterChange={setFilters} />
      
      <main className="flex-grow bg-gray-50 py-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Discover Premium Properties
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Find the perfect piece of land to secure your future.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
              {error}
            </div>
          )}

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <LandCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
