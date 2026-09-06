import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminProperties } from '../hooks/useAdminProperties';
import LandTable from '../components/LandTable';
import UploadForm from '../components/UploadForm';
import MaintenanceToggle from '../components/MaintenanceToggle';
import { LogOut, PlusCircle, RefreshCw, LayoutDashboard, Building2, Eye, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const { properties, loading: propertiesLoading, fetchProperties, createProperty, markSold, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated, fetchProperties]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleUploadSuccess = async (data) => {
    await createProperty(data);
    setShowUpload(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading dashboard...
      </div>
    );
  }

  const activeListings = properties.filter(p => p.status === 'published' && new Date(p.publishedAt) <= new Date()).length;
  const scheduledListings = properties.filter(p => new Date(p.publishedAt) > new Date()).length;
  const soldListings = properties.filter(p => p.status === 'sold').length;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <Toaster position="top-right" />
      
      {/* Top Navigation */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px', color: '#0f172a' }}>
            <LayoutDashboard size={20} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            NewHomeLand <span style={{ color: '#64748b', fontWeight: 400 }}>| Admin</span>
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Top Welcome Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Operations Dashboard
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Manage property portfolio, view active listings, and control maintenance mode.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => fetchProperties()}
              disabled={propertiesLoading}
              className="btn btn-outline btn-sm"
              title="Refresh List"
            >
              <RefreshCw size={16} className={propertiesLoading ? 'animate-spin text-blue-500' : ''} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="btn btn-gold btn-sm"
            >
              <PlusCircle size={16} />
              <span>New Listing</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
          {/* Card 1: Total */}
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Total Properties</p>
              <h3>{properties.length}</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{activeListings} Active</span> |{' '}
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{scheduledListings} Scheduled</span> |{' '}
                <span style={{ color: '#ef4444', fontWeight: 600 }}>{soldListings} Sold</span>
              </div>
            </div>
            <div className="stat-card-icon blue">
              <Building2 size={26} />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Active Listings</p>
              <h3>{activeListings}</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                Currently visible to public
              </div>
            </div>
            <div className="stat-card-icon green">
              <Eye size={26} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-info">
              <p>System Status</p>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Operational</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                <MaintenanceToggle />
              </div>
            </div>
            <div className="stat-card-icon amber">
              <ShieldCheck size={26} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Property Catalog</h3>
          </div>

          {showUpload && (
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <UploadForm onSuccess={handleUploadSuccess} onCancel={() => setShowUpload(false)} />
            </div>
          )}

          <div style={{ padding: '0' }}>
            <LandTable 
              properties={properties} 
              markSold={markSold} 
              deleteProperty={deleteProperty} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
