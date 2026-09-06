import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminProperties } from '../hooks/useAdminProperties';
import LandTable from '../components/LandTable';
import UploadForm from '../components/UploadForm';
import MaintenanceToggle from '../components/MaintenanceToggle';
import { 
  PlusCircle, 
  RefreshCw, 
  Building2, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const { properties, loading: propertiesLoading, fetchProperties, createProperty, markSold, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  
  const [showUpload, setShowUpload] = useState(false);
  const [showMaintenancePanel, setShowMaintenancePanel] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    document.title = 'Operations Console | NewHomeLand Admin';
  }, []);

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
    fetchProperties();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#cbd5e1' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#d49a3f' }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const now = new Date();
  const activeListings = properties.filter(p => p.status === 'published' && new Date(p.publishedAt) <= now).length;
  const scheduledListings = properties.filter(p => p.status === 'published' && new Date(p.publishedAt) > now).length;
  const soldListings = properties.filter(p => p.status === 'sold').length;
  const draftListings = properties.filter(p => p.status === 'draft').length;

  // Calculate Total Portfolio Value in INR
  const totalValue = properties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const formatPortfolioValue = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="admin-page-container">
      {/* Main Admin Content */}
      <main className="admin-content-wrap">
        {/* Top Title & Primary Actions */}
        <div className="admin-heading-bar">
          <div>
            <div className="admin-breadcrumb-tag">
              <ShieldCheck size={12} />
              <span>Brokerage Management</span>
            </div>
            <h1 className="admin-main-title">
              Operations & Inventory Dashboard
            </h1>
            <p className="admin-main-subtitle">
              Monitor active lands, schedule new launches, and manage client-facing maintenance.
            </p>
          </div>

          <div className="admin-cta-group">
            <button 
              type="button"
              onClick={() => setShowUpload(!showUpload)}
              className="btn btn-gold btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <PlusCircle size={16} />
              <span>New Listing</span>
            </button>
          </div>
        </div>

        {/* 4 Balanced Uniform KPI Cards */}
        <div className="admin-stats-grid">
          {/* Card 1: Total Properties */}
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Total Inventory</p>
              <h3>{properties.length}</h3>
              <div className="stat-card-breakdown">
                <span className="dot-pill green">{activeListings} Active</span>
                <span className="dot-pill blue">{scheduledListings} Sched</span>
                <span className="dot-pill red">{soldListings} Sold</span>
              </div>
            </div>
            <div className="stat-card-icon blue">
              <Building2 size={24} />
            </div>
          </div>
          
          {/* Card 2: Active Public Listings */}
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Active on Public Site</p>
              <h3>{activeListings}</h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 500 }}>
                {draftListings > 0 ? `${draftListings} drafts unpublished` : 'All ready listings published'}
              </div>
            </div>
            <div className="stat-card-icon green">
              <Eye size={24} />
            </div>
          </div>

          {/* Card 3: Total Portfolio Value */}
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Portfolio Book Value</p>
              <h3 style={{ fontSize: '1.65rem' }}>{formatPortfolioValue(totalValue)}</h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 500 }}>
                Across {properties.length} property assets
              </div>
            </div>
            <div className="stat-card-icon amber">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Card 4: System Visibility Status */}
          <div className="stat-card">
            <div className="stat-card-info">
              <p>Public Portal Status</p>
              <h3 style={{ fontSize: '1.25rem', color: isMaintenanceActive ? '#d97706' : '#10b981' }}>
                {isMaintenanceActive ? 'Maintenance Active' : 'System Operational'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowMaintenancePanel(prev => !prev)}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#d49a3f', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {showMaintenancePanel ? 'Close controls ↑' : 'Configure kill-switch ↓'}
                </button>
              </div>
            </div>
            <div className={`stat-card-icon ${isMaintenanceActive ? 'amber' : 'purple'}`}>
              {isMaintenanceActive ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
          </div>
        </div>

        {/* Dedicated Maintenance Panel (Expands BELOW the KPI cards) */}
        {showMaintenancePanel && (
          <div style={{ marginBottom: '2.5rem' }}>
            <MaintenanceToggle 
              onStatusChange={(status) => setIsMaintenanceActive(status)} 
              onClose={() => setShowMaintenancePanel(false)}
            />
          </div>
        )}

        {/* Upload Form (Expandable) */}
        {showUpload && (
          <div style={{ marginBottom: '2.5rem' }}>
            <UploadForm 
              onSuccess={handleUploadSuccess} 
              onCancel={() => setShowUpload(false)} 
            />
          </div>
        )}

        {/* Property Catalog Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Property Catalog & Management</h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Full listing directory with direct links, status badges, and asset controls.
              </p>
            </div>
          </div>

          <LandTable 
            properties={properties} 
            markSold={markSold} 
            deleteProperty={deleteProperty} 
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
