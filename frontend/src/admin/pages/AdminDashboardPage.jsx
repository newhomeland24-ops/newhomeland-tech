import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminProperties } from '../hooks/useAdminProperties';
import axios from 'axios';
import LandTable from '../components/LandTable';
import UploadForm from '../components/UploadForm';
import MaintenanceToggle from '../components/MaintenanceToggle';
import AdminSidebar from '../components/AdminSidebar';
import PropertyDetailModal from '../components/PropertyDetailModal';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { 
  PlusCircle, 
  RefreshCw, 
  Building2, 
  TrendingUp, 
  Eye, 
  ShieldCheck, 
  ShieldAlert,
  Shield, 
  Menu,
  MessageSquare, 
  Calendar, 
  Settings, 
  ArrowRight, 
  ExternalLink,
  Phone,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const { properties, loading: propertiesLoading, fetchProperties, createProperty, updateProperty, markSold, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [previewProperty, setPreviewProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);

  // Live Inquiries & Appointments State
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Operations Console | NewHomeDevelopers Admin';
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchInquiries = useCallback(async () => {
    try {
      setInquiriesLoading(true);
      const res = await axios.get('/api/inquiries');
      if (res.data?.data) {
        setInquiries(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const res = await axios.get('/api/appointments');
      if (res.data?.data) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      fetchInquiries();
      fetchAppointments();

      // Fetch portal maintenance status
      axios.get('/api/settings')
        .then(res => {
          if (res.data) {
            setIsMaintenanceActive(Boolean(res.data.isMaintenance));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, fetchProperties, fetchInquiries, fetchAppointments]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'enquiries') fetchInquiries();
    if (tab === 'appointments') fetchAppointments();
  };

  const handleStartEditProperty = (prop) => {
    setEditingProperty(prop);
    setActiveTab('add-property');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProperty = async (data) => {
    if (editingProperty) {
      const propId = editingProperty.propertyId || editingProperty._id;
      const res = await updateProperty(propId, data);
      if (res && res.success === false) {
        return res;
      }
      setEditingProperty(null);
      fetchProperties();
      setActiveTab('properties');
      return { success: true };
    } else {
      const res = await createProperty(data);
      if (res && res.success === false) {
        return res;
      }
      fetchProperties();
      setActiveTab('properties');
      return { success: true };
    }
  };

  // Inquiry Status & Delete Handlers
  const handleUpdateInquiryStatus = async (id, status) => {
    try {
      await axios.patch(`/api/inquiries/${id}/status`, { status });
      setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status } : inq));
      toast.success(`Inquiry marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Delete this inquiry record?')) {
      try {
        await axios.delete(`/api/inquiries/${id}`);
        setInquiries(prev => prev.filter(inq => inq._id !== id));
        toast.success('Inquiry deleted');
      } catch (err) {
        toast.error('Failed to delete inquiry');
      }
    }
  };

  // Appointment Status & Delete Handlers
  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(app => app._id === id ? { ...app, status } : app));
      toast.success(`Appointment marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Delete this appointment record?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);
        setAppointments(prev => prev.filter(app => app._id !== id));
        toast.success('Appointment deleted');
      } catch (err) {
        toast.error('Failed to delete appointment');
      }
    }
  };

  // WhatsApp Connect Helper
  const handleConnectWhatsApp = (phone, name, subject = '') => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const msg = encodeURIComponent(`Hello ${name}, this is NewHomeDevelopers Brokerage following up on your property inquiry${subject ? ` regarding "${subject}"` : ''}. How may we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
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

  // Calculate Real Metrics from Database Properties
  const now = new Date();
  const activeListings = properties.filter(p => p.status === 'published' && new Date(p.publishedAt) <= now).length;
  const scheduledListings = properties.filter(p => p.status === 'published' && new Date(p.publishedAt) > now).length;
  const soldListings = properties.filter(p => p.status === 'sold').length;
  const draftListings = properties.filter(p => p.status === 'draft').length;

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

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="admin-main-area">
        {/* Mobile Header Bar */}
        <div className="admin-mobile-header">
          <button 
            type="button" 
            className="admin-mobile-menu-trigger"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="admin-mobile-brand">
            <Shield size={18} color="#d49a3f" />
            <span>NewHomeDevelopers</span>
          </div>
          <div className="portal-status-badge">
            <span className={`portal-status-dot ${isMaintenanceActive ? 'maintenance' : ''}`} />
            <span>{isMaintenanceActive ? 'Maint' : 'Live'}</span>
          </div>
        </div>

        {/* Desktop Top Status Bar */}
        <header className="admin-top-status-bar">
          <div className="admin-system-name">
            NewHomeDevelopers Management System
          </div>
          <div className="portal-status-badge">
            <span>Portal Status:</span>
            <span className={`portal-status-dot ${isMaintenanceActive ? 'maintenance' : ''}`} />
            <span style={{ color: isMaintenanceActive ? '#d97706' : '#10b981', fontWeight: 700 }}>
              {isMaintenanceActive ? 'Maintenance Active' : 'Live'}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="admin-content-wrap">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Heading Bar */}
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">Operations Dashboard</h1>
                  <p className="admin-main-subtitle">
                    Real-time portfolio status, listing inventory, and brokerage operations summary.
                  </p>
                </div>

                <div className="admin-cta-group">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('add-property')}
                    className="btn btn-gold btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.35rem', borderRadius: '12px' }}
                  >
                    <PlusCircle size={17} />
                    <span>Publish New Property</span>
                  </button>
                </div>
              </div>

              {/* Real Metric KPI Cards */}
              <div className="admin-stats-grid">
                {/* Total Inventory */}
                <div className="stat-card" onClick={() => setActiveTab('properties')} style={{ cursor: 'pointer' }} title="View All Properties">
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
                
                {/* Active on Public Site */}
                <div className="stat-card">
                  <div className="stat-card-info">
                    <p>Active on Public Site</p>
                    <h3>{activeListings}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 500 }}>
                      {draftListings > 0 ? `${draftListings} drafts unpublished` : 'All ready listings live'}
                    </div>
                  </div>
                  <div className="stat-card-icon green">
                    <Eye size={24} />
                  </div>
                </div>

                {/* Portfolio Book Value */}
                <div className="stat-card">
                  <div className="stat-card-info">
                    <p>Portfolio Book Value</p>
                    <h3 style={{ fontSize: '1.65rem' }}>{formatPortfolioValue(totalValue)}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 500 }}>
                      Across {properties.length} verified assets
                    </div>
                  </div>
                  <div className="stat-card-icon amber">
                    <TrendingUp size={24} />
                  </div>
                </div>

                {/* System Visibility Status */}
                <div className="stat-card" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }} title="Configure Broker Settings">
                  <div className="stat-card-info">
                    <p>Public Portal Status</p>
                    <h3 style={{ fontSize: '1.25rem', color: isMaintenanceActive ? '#d97706' : '#10b981' }}>
                      {isMaintenanceActive ? 'Maintenance Active' : 'System Operational'}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                      <span style={{ color: '#d49a3f', fontWeight: 600 }}>Configure switch &rarr;</span>
                    </div>
                  </div>
                  <div className={`stat-card-icon ${isMaintenanceActive ? 'amber' : 'purple'}`}>
                    {isMaintenanceActive ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', margin: '2rem 0' }}>
                <div 
                  onClick={() => setActiveTab('properties')} 
                  className="dashboard-widget-card" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #3b82f6' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Building2 size={22} color="#3b82f6" />
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Manage Properties</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Edit status, delete, search catalog</p>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#94a3b8" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('add-property')} 
                  className="dashboard-widget-card" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #d49a3f' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <PlusCircle size={22} color="#d49a3f" />
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Add New Listing</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Upload high-res images & walkthrough</p>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#94a3b8" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('enquiries')} 
                  className="dashboard-widget-card" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #10b981' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <MessageSquare size={22} color="#10b981" />
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Customer Enquiries</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>{inquiries.length} client inquiries received</p>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#94a3b8" />
                  </div>
                </div>
              </div>

              {/* Recent Real Properties Overview */}
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="admin-card-title">Recent Real Estate Listings</h2>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      Latest property listings currently in your database.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('properties')} 
                    className="widget-view-all-link"
                    style={{ fontSize: '0.9rem' }}
                  >
                    View All {properties.length} Properties &rarr;
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    <p>No listings created yet. Click "Publish New Property" to add your first listing.</p>
                  </div>
                ) : (
                  <div className="widget-table-wrap" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    <table className="widget-mini-table">
                      <thead>
                        <tr>
                          <th>Property Title</th>
                          <th>Location</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.slice(0, 5).map((p) => (
                          <tr 
                            key={p.propertyId || p._id}
                            onClick={() => setPreviewProperty(p)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view property details"
                          >
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</div>
                            </td>
                            <td>
                              <span style={{ color: '#64748b', fontSize: '0.86rem' }}>{p.location}</span>
                            </td>
                            <td>
                              <span className="badge-type-pill">{p.propertyType}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#b87d28' }}>{formatPrice(p.price)}</span>
                            </td>
                            <td>
                              <span className={`badge-status ${p.status}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ALL PROPERTIES */}
          {activeTab === 'properties' && (
            <div>
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">All Properties</h1>
                  <p className="admin-main-subtitle">
                    Complete listing directory with direct links, category filters, and asset controls.
                  </p>
                </div>
                <div className="admin-cta-group">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('add-property')}
                    className="btn btn-gold btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.35rem', borderRadius: '12px' }}
                  >
                    <PlusCircle size={17} />
                    <span>New Listing</span>
                  </button>
                </div>
              </div>

              <div className="admin-card">
                <LandTable 
                  properties={properties} 
                  markSold={markSold} 
                  deleteProperty={deleteProperty} 
                  onEditProperty={handleStartEditProperty}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ADD / EDIT PROPERTY */}
          {activeTab === 'add-property' && (
            <div>
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">
                    {editingProperty ? `Edit Property (${editingProperty.propertyId || 'Listing'})` : 'Add New Property'}
                  </h1>
                  <p className="admin-main-subtitle">
                    {editingProperty 
                      ? 'Modify property specifications, pricing, media assets, or listing status.' 
                      : 'Publish a new luxury land, villa, or commercial listing with high-resolution photos and video.'}
                  </p>
                </div>
                <div className="admin-cta-group">
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingProperty(null);
                      setActiveTab('properties');
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel & Return to Catalog
                  </button>
                </div>
              </div>

              <UploadForm 
                initialData={editingProperty}
                onSuccess={handleSaveProperty} 
                onCancel={() => {
                  setEditingProperty(null);
                  setActiveTab('properties');
                }} 
              />
            </div>
          )}

          {/* TAB 4: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div>
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">Customer Enquiries</h1>
                  <p className="admin-main-subtitle">
                    Manage client enquiries submitted through the property detail forms and direct channels.
                  </p>
                </div>
                <div className="admin-cta-group">
                  <button 
                    type="button" 
                    onClick={fetchInquiries}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={14} className={inquiriesLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="admin-card">
                {inquiriesLoading ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#d49a3f' }} />
                    <p>Loading customer enquiries...</p>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#94a3b8' }}>
                      <MessageSquare size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                      No Customer Enquiries Yet
                    </h3>
                    <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      When visitors fill out the <strong>Send Enquiry</strong> form on any property detail page, their name, contact info, and message will appear here in real-time.
                    </p>
                    <a 
                      href="/properties" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-gold btn-sm"
                    >
                      View Live Properties
                    </a>
                  </div>
                ) : (
                  <div className="widget-table-wrap" style={{ padding: '1rem 1.5rem' }}>
                    <table className="widget-mini-table">
                      <thead>
                        <tr>
                          <th>Client Name & Contact</th>
                          <th>Property Interested In</th>
                          <th>Message Details</th>
                          <th>Received Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.map((inq) => (
                          <tr key={inq._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{inq.clientName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{inq.phone}</div>
                              {inq.email && <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{inq.email}</div>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                                {inq.propertyTitle || 'General Inquiry'}
                              </div>
                              {inq.propertyLocation && (
                                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{inq.propertyLocation}</div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inq.message}>
                                {inq.message || 'No extra message'}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </td>
                            <td>
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: inq.status === 'NEW' ? '#f0fdf4' : inq.status === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc',
                                  color: inq.status === 'NEW' ? '#166534' : inq.status === 'IN_PROGRESS' ? '#1d4ed8' : '#475569',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="NEW">NEW</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleConnectWhatsApp(inq.phone, inq.clientName, inq.propertyTitle)}
                                  className="btn-action-icon"
                                  style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                  title="Chat on WhatsApp"
                                >
                                  <WhatsAppIcon size={16} />
                                </button>
                                <a
                                  href={`tel:${inq.phone.replace(/[^\d+]/g, '')}`}
                                  className="btn-action-icon"
                                  style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                                  title="Call Client"
                                >
                                  <Phone size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInquiry(inq._id)}
                                  className="btn-action-icon delete"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">Site Visit Appointments</h1>
                  <p className="admin-main-subtitle">
                    Manage inspection appointments booked by prospective buyers from property detail pages.
                  </p>
                </div>
                <div className="admin-cta-group">
                  <button 
                    type="button" 
                    onClick={fetchAppointments}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={14} className={appointmentsLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="admin-card">
                {appointmentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#d49a3f' }} />
                    <p>Loading scheduled site visits...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#d97706' }}>
                      <Calendar size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                      No Site Visits Booked Yet
                    </h3>
                    <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      When clients book an appointment via the <strong>Book Site Visit</strong> tab on any property detail page, their inspection date, time slot, and contact details will appear here.
                    </p>
                    <a 
                      href="/properties" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-gold btn-sm"
                    >
                      View Live Properties
                    </a>
                  </div>
                ) : (
                  <div className="widget-table-wrap" style={{ padding: '1rem 1.5rem' }}>
                    <table className="widget-mini-table">
                      <thead>
                        <tr>
                          <th>Client Information</th>
                          <th>Property</th>
                          <th>Inspection Date & Slot</th>
                          <th>Visitors & Notes</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.clientName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.phone}</div>
                              {app.email && <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{app.email}</div>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                                {app.propertyTitle || 'Scheduled Property Inspection'}
                              </div>
                              {app.propertyLocation && (
                                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{app.propertyLocation}</div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                                <Calendar size={13} color="#d49a3f" />
                                <span>{app.preferredDate}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                                <Clock size={12} />
                                <span>{app.preferredTime}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Users size={13} color="#64748b" />
                                <span>{app.visitorsCount}</span>
                              </div>
                              {app.notes && (
                                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                                  "{app.notes}"
                                </div>
                              )}
                            </td>
                            <td>
                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateAppointmentStatus(app._id, e.target.value)}
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: app.status === 'CONFIRMED' ? '#f0fdf4' : app.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                                  color: app.status === 'CONFIRMED' ? '#166534' : app.status === 'PENDING' ? '#92400e' : '#991b1b',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                {app.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAppointmentStatus(app._id, 'CONFIRMED')}
                                    className="btn-action-icon"
                                    style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                    title="Confirm Booking"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleConnectWhatsApp(app.phone, app.clientName, `Site Visit on ${app.preferredDate} (${app.preferredTime})`)}
                                  className="btn-action-icon"
                                  style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                  title="WhatsApp Client"
                                >
                                  <WhatsAppIcon size={16} />
                                </button>
                                <a
                                  href={`tel:${app.phone.replace(/[^\d+]/g, '')}`}
                                  className="btn-action-icon"
                                  style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                                  title="Call Client"
                                >
                                  <Phone size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAppointment(app._id)}
                                  className="btn-action-icon delete"
                                  title="Delete Appointment"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: BROKER SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className="admin-heading-bar">
                <div>
                  <h1 className="admin-main-title">Broker Settings</h1>
                  <p className="admin-main-subtitle">
                    Control public portal visibility, maintenance splash announcement, and system mode.
                  </p>
                </div>
              </div>

              <MaintenanceToggle 
                onStatusChange={(status) => setIsMaintenanceActive(status)} 
              />
            </div>
          )}
        </main>
      </div>

      {/* Property Details Modal for Admin Dashboard Preview */}
      <PropertyDetailModal
        property={previewProperty}
        isOpen={!!previewProperty}
        onClose={() => setPreviewProperty(null)}
        onEdit={(prop) => {
          setPreviewProperty(null);
          handleStartEditProperty(prop);
        }}
        onMarkSold={async (id, title) => {
          await markSold(id);
          setPreviewProperty(prev => prev ? { ...prev, status: 'sold' } : null);
        }}
        onDelete={async (id, title) => {
          await deleteProperty(id);
          setPreviewProperty(null);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
