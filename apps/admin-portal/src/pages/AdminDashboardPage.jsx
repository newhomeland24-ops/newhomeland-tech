import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminProperties } from '../hooks/useAdminProperties';
import LandTable from '../components/LandTable';
import UploadForm from '../components/UploadForm';
import MaintenanceToggle from '../components/MaintenanceToggle';
import { LogOut, Plus, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const { properties, loading: propertiesLoading, fetchProperties, createProperty, markSold, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated, fetchProperties]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUploadSuccess = async (data) => {
    await createProperty(data);
    setShowUpload(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Toaster position="top-right" toastOptions={{ className: 'bg-gray-800 text-white' }} />
      
      {/* Top Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">NewHomeLand <span className="text-gray-500 font-normal">| Admin</span></h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-white">Property Catalog</h2>
                <p className="text-gray-400 text-sm mt-1">Manage all listings, drafts, and sold properties.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => fetchProperties()}
                  disabled={propertiesLoading}
                  className="p-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                  title="Refresh List"
                >
                  <RefreshCw className={`w-5 h-5 ${propertiesLoading ? 'animate-spin text-blue-400' : ''}`} />
                </button>
                <button 
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Plus className="w-5 h-5" />
                  New Listing
                </button>
              </div>
            </div>

            {showUpload && (
              <div className="animate-slide-down">
                <UploadForm onSuccess={handleUploadSuccess} onCancel={() => setShowUpload(false)} />
              </div>
            )}

            <LandTable 
              properties={properties} 
              markSold={markSold} 
              deleteProperty={deleteProperty} 
            />
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            <MaintenanceToggle />
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Total Properties</span>
                  <span className="text-white font-mono font-medium">{properties.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Active Listings</span>
                  <span className="text-green-400 font-mono font-medium">
                    {properties.filter(p => p.status === 'published' && new Date(p.publishedAt) <= new Date()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Scheduled</span>
                  <span className="text-yellow-400 font-mono font-medium">
                    {properties.filter(p => new Date(p.publishedAt) > new Date()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Recently Sold</span>
                  <span className="text-red-400 font-mono font-medium">
                    {properties.filter(p => p.status === 'sold').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
