import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminProperties } from '../hooks/useAdminProperties';
import axios from 'axios';
import LandTable from '../components/LandTable';
import UploadForm from '../components/UploadForm';
import AdminSidebar from '../components/AdminSidebar';
import PropertyDetailModal from '../components/PropertyDetailModal';
import InquiryDetailModal from '../components/InquiryDetailModal';
import LeadNotificationPopup from '../components/LeadNotificationPopup';
import LeadNotificationBell from '../components/LeadNotificationBell';
import { playLeadNotificationChime } from '../../utils/notificationSound';
import AdminSettings from './AdminSettings';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { useSettings } from '../../context/SettingsContext';
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
  ArrowRight, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Users, 
  LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const { properties, loading: propertiesLoading, fetchProperties, createProperty, updateProperty, markSold, deleteProperty } = useAdminProperties();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleAdminLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [previewProperty, setPreviewProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Live Inquiries & Appointments State
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Lead Notification Popups, Mobile Push & Audio State
  const [leadPopups, setLeadPopups] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [bellUnreadCount, setBellUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('adminLeadSound') !== 'false';
  });
  const knownInquiryIdsRef = useRef(new Set());
  const knownAppointmentIdsRef = useRef(new Set());
  const hasInitializedLeadsRef = useRef(false);

  // Register Service Worker for Mobile OS Lockscreen & Status Bar Notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration note:', err);
      });
    }
  }, []);

  useEffect(() => {
    document.title = `Operations Console | ${settings.business_name || 'Admin'}`;
  }, [settings.business_name]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Mobile OS Status Bar & Lock Screen Notification Delivery
  const triggerOsPushNotification = useCallback((title, body, tag = 'lead_alert') => {
    // 1. Device Vibration (Haptic feedback for phones like incoming messages)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 300]);
      } catch (e) {}
    }

    // 2. Mobile Service Worker Notification (Shows in Mobile Notification Panel & Lockscreen)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag,
          renotify: true,
          requireInteraction: true,
          vibrate: [300, 150, 300, 150, 300],
          data: { url: '/admin/dashboard' }
        });
      }).catch(() => {
        try {
          new Notification(title, { body, icon: '/favicon.ico' });
        } catch (e) {}
      });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {}
    }
  }, []);

  // Trigger Lead Notification Popup & Sound
  const triggerLeadAlert = useCallback((leadData) => {
    if (!leadData) return;

    const popupItem = {
      id: leadData.id || leadData._id || 'lead_' + Date.now() + '_' + Math.random(),
      type: leadData.type || 'enquiry',
      clientName: leadData.clientName || 'Interested Client',
      phone: leadData.phone || '',
      propertyTitle: leadData.propertyTitle || 'Property',
      propertyId: leadData.propertyId || '',
      message: leadData.message || '',
      preferredDate: leadData.preferredDate || '',
      preferredTime: leadData.preferredTime || '',
      visitorsCount: leadData.visitorsCount || '',
      timestamp: Date.now(),
      rawLead: leadData
    };

    // Play chime if enabled
    if (soundEnabled) {
      playLeadNotificationChime(popupItem.type);
    }

    // Trigger Mobile OS notification in phone's notification panel & lockscreen
    const title = popupItem.type === 'enquiry'
      ? `🔔 New Inquiry: ${popupItem.clientName}`
      : `📅 New Site Visit: ${popupItem.clientName}`;
    const body = popupItem.type === 'enquiry'
      ? `Interested in ${popupItem.propertyTitle}. Contact: ${popupItem.phone}`
      : `Site visit for ${popupItem.propertyTitle} on ${popupItem.preferredDate} (${popupItem.preferredTime})`;

    triggerOsPushNotification(title, body, popupItem.id);

    // Increment unread count badge for the bell icon
    setBellUnreadCount((prev) => prev + 1);

    // Add to floating popups queue (max 4 on screen)
    setLeadPopups((prev) => {
      if (prev.some((p) => p.id === popupItem.id)) return prev;
      return [popupItem, ...prev].slice(0, 4);
    });

    // Add to bell dropdown feed (max 25)
    setRecentLeads((prev) => {
      if (prev.some((l) => (l._id || l.id) === popupItem.id)) return prev;
      return [{ ...popupItem, isNew: true }, ...prev].slice(0, 25);
    });
  }, [soundEnabled, triggerOsPushNotification]);

  const handleDismissPopup = useCallback((id) => {
    setLeadPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Single-toast sound toggle (prevents duplicate toast info)
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('adminLeadSound', String(next));
    if (next) {
      playLeadNotificationChime('test');
      toast.success('Alert chime enabled', { id: 'admin-sound-toggle-toast' });
    } else {
      toast('Alert chime muted', { icon: '🔇', id: 'admin-sound-toggle-toast' });
    }
  };

  // Clear unread bell count when the admin opens and sees the notification bell
  const handleOpenBell = () => {
    setBellUnreadCount(0);
    setRecentLeads((prev) => prev.map((l) => ({ ...l, isNew: false })));
  };

  const handleClearAllLeads = () => {
    setRecentLeads([]);
    setBellUnreadCount(0);
  };

  const handleTestAlert = () => {
    const isEnquiry = Math.random() > 0.5;
    const testLead = isEnquiry ? {
      id: 'test_' + Date.now(),
      type: 'enquiry',
      clientName: 'Vikram Malhotra',
      phone: '+91 98765 43210',
      propertyTitle: 'Sunset Boulevard Luxury Villa #12',
      propertyId: 'PROP-104',
      message: 'Hello, I want to review the registry paperwork and schedule an inspection this weekend.',
      isTest: true
    } : {
      id: 'test_' + Date.now(),
      type: 'appointment',
      clientName: 'Pooja Kashyap',
      phone: '+91 98112 34567',
      propertyTitle: 'Greenwood Heights Penthouse #402',
      propertyId: 'PROP-208',
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferredTime: '10:00 AM - 12:00 PM',
      visitorsCount: '2 people',
      isTest: true
    };

    triggerLeadAlert(testLead);

    // If permission not granted, request permission so mobile lockscreen alerts work
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          triggerOsPushNotification(
            isEnquiry ? '🔔 New Inquiry: Vikram Malhotra' : '📅 New Site Visit: Pooja Kashyap',
            'Mobile push notification active in notification panel!'
          );
        }
      });
    }

    toast.success('Test notification triggered!', { id: 'test-notification-toast' });
  };

  const handleViewLead = (lead) => {
    if (lead.type === 'enquiry') {
      setActiveTab('enquiries');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const found = inquiries.find((i) => i._id === lead.id || i._id === lead._id);
      setSelectedInquiry(found || lead.rawLead || lead);
    } else {
      setActiveTab('appointments');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchInquiries = useCallback(async () => {
    try {
      setInquiriesLoading(true);
      const res = await axios.get('/api/inquiries');
      if (res.data?.data) {
        setInquiries(res.data.data);
        // Register known IDs on first load
        if (!hasInitializedLeadsRef.current) {
          res.data.data.forEach((inq) => knownInquiryIdsRef.current.add(inq._id));
        }
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
        // Register known IDs on first load
        if (!hasInitializedLeadsRef.current) {
          res.data.data.forEach((app) => knownAppointmentIdsRef.current.add(app._id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      Promise.all([fetchInquiries(), fetchAppointments()]).then(() => {
        hasInitializedLeadsRef.current = true;
      });

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

  // Background Polling Engine (Every 10 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const [inqRes, appRes] = await Promise.all([
          axios.get('/api/inquiries').catch(() => null),
          axios.get('/api/appointments').catch(() => null)
        ]);

        if (inqRes?.data?.data) {
          const freshInqs = inqRes.data.data;
          setInquiries(freshInqs);

          if (hasInitializedLeadsRef.current) {
            freshInqs.forEach((inq) => {
              if (!knownInquiryIdsRef.current.has(inq._id)) {
                knownInquiryIdsRef.current.add(inq._id);
                triggerLeadAlert({
                  type: 'enquiry',
                  id: inq._id,
                  clientName: inq.clientName,
                  phone: inq.phone,
                  email: inq.email,
                  propertyTitle: inq.propertyTitle,
                  propertyId: inq.propertyId,
                  message: inq.message,
                  rawLead: inq
                });
              }
            });
          }
        }

        if (appRes?.data?.data) {
          const freshApps = appRes.data.data;
          setAppointments(freshApps);

          if (hasInitializedLeadsRef.current) {
            freshApps.forEach((app) => {
              if (!knownAppointmentIdsRef.current.has(app._id)) {
                knownAppointmentIdsRef.current.add(app._id);
                triggerLeadAlert({
                  type: 'appointment',
                  id: app._id,
                  clientName: app.clientName,
                  phone: app.phone,
                  email: app.email,
                  propertyTitle: app.propertyTitle,
                  propertyId: app.propertyId,
                  preferredDate: app.preferredDate,
                  preferredTime: app.preferredTime,
                  visitorsCount: app.visitorsCount,
                  rawLead: app
                });
              }
            });
          }
        }
      } catch (err) {
        // Silent polling catch
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, triggerLeadAlert]);

  // Zero-Latency Instant Cross-Tab Broadcast Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleIncomingLeadMessage = (leadPayload) => {
      if (!leadPayload || !leadPayload.id) return;

      if (leadPayload.type === 'enquiry') {
        knownInquiryIdsRef.current.add(leadPayload.id);
        fetchInquiries();
      } else {
        knownAppointmentIdsRef.current.add(leadPayload.id);
        fetchAppointments();
      }

      triggerLeadAlert(leadPayload);
    };

    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('newhome_leads_channel');
      bc.onmessage = (event) => {
        handleIncomingLeadMessage(event.data);
      };
    }

    const handleStorageEvent = (event) => {
      if (event.key === 'newhome_lead_event' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          handleIncomingLeadMessage(data);
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [isAuthenticated, triggerLeadAlert, fetchInquiries, fetchAppointments]);

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

  const handleSaveProperty = async (data, onProgress) => {
    if (editingProperty) {
      const propId = editingProperty.propertyId || editingProperty._id;
      const res = await updateProperty(propId, data, onProgress);
      if (res && res.success === false) {
        return res;
      }
      setEditingProperty(null);
      fetchProperties();
      setActiveTab('properties');
      return { success: true };
    } else {
      const res = await createProperty(data, onProgress);
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

  // Confirm Booking and Send Confirmation Message to Client on their given number
  const handleConfirmBooking = async (app) => {
    const businessName = settings.business_name || 'NewHomeDevelopers';
    const brokerPhone = settings.phone || '+91 98765 43210';
    const cleanPhone = (app.phone || '').replace(/[^\d]/g, '');

    const confirmationMsg = 
`Hello ${app.clientName || 'Valued Client'},

Your site visit booking with *${businessName}* has been *CONFIRMED*! ✅

📋 *Booking Details:*
• Property: ${app.propertyTitle || 'Property Inspection'} ${app.propertyId ? `[ID: #${app.propertyId}]` : ''} ${app.propertyLocation ? `(${app.propertyLocation})` : ''}
• Date: ${app.preferredDate}
• Time Slot: ${app.preferredTime}
• Visitors: ${app.visitorsCount || '1-2 people'}
${app.notes ? `• Special Notes: "${app.notes}"\n` : ''}
Our certified property advisor will be ready to assist you at the site. If you need directions or have any questions, feel free to call us at ${brokerPhone}.

Thank you for choosing ${businessName}!`;

    const encodedMsg = encodeURIComponent(confirmationMsg);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    // Open WhatsApp immediately so browser doesn't block asynchronous popup
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    try {
      await axios.patch(`/api/appointments/${app._id}/status`, { status: 'CONFIRMED' });
      setAppointments(prev => prev.map(a => a._id === app._id ? { ...a, status: 'CONFIRMED' } : a));
      toast.success(`Booking Confirmed! Confirmation message sent to ${app.clientName} (${app.phone})`);
    } catch (err) {
      console.error('Failed to update status in database:', err);
      toast.error('Confirmation message dispatched, but failed to update status in database.');
    }
  };

  // WhatsApp Connect Helper for Appointments
  const handleAppointmentWhatsApp = (app) => {
    const businessName = settings.business_name || 'NewHomeDevelopers';
    const brokerPhone = settings.phone || '+91 98765 43210';
    const cleanPhone = (app.phone || '').replace(/[^\d]/g, '');

    let msgText;
    if (app.status === 'CONFIRMED') {
      msgText = 
`Hello ${app.clientName || 'Valued Client'},

This is a reminder regarding your *CONFIRMED* site visit booking with *${businessName}*! ✅

📋 *Booking Details:*
• Property: ${app.propertyTitle || 'Property Inspection'} ${app.propertyId ? `[ID: #${app.propertyId}]` : ''} ${app.propertyLocation ? `(${app.propertyLocation})` : ''}
• Date: ${app.preferredDate}
• Time Slot: ${app.preferredTime}
• Visitors: ${app.visitorsCount || '1-2 people'}

Our property advisor is ready to assist you. Contact us at ${brokerPhone} for any inquiries.`;
    } else {
      msgText = `Hello ${app.clientName}, this is ${businessName} following up on your requested site visit for "${app.propertyTitle || 'our property'}"${app.propertyId ? ` (ID: #${app.propertyId})` : ''} on ${app.preferredDate} (${app.preferredTime}). How may we assist you today?`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`, '_blank', 'noopener,noreferrer');
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

  // WhatsApp Connect Helper for Inquiries
  const handleConnectWhatsApp = (phone, name, subject = '', propertyId = '') => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const businessName = settings.business_name || 'NewHomeDevelopers';
    const propIdText = propertyId ? ` (ID: #${propertyId})` : '';
    const msg = encodeURIComponent(`Hello ${name}, this is ${businessName} following up on your property inquiry${subject ? ` regarding "${subject}"${propIdText}` : ''}. How may we assist you today?`);
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
  const activeListings = properties.filter(p => (p.status === 'published' || p.status === 'Available') && new Date(p.publishedAt) <= now).length;
  const scheduledListings = properties.filter(p => (p.status === 'published' || p.status === 'Available') && new Date(p.publishedAt) > now).length;
  const soldListings = properties.filter(p => p.status === 'sold' || p.status === 'Sold').length;
  const draftListings = properties.filter(p => p.status === 'draft' || p.status === 'Under Offer').length;

  const newInquiriesCount = inquiries.filter(i => i.status === 'NEW').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'PENDING').length;
  const totalUnreadLeads = newInquiriesCount + pendingAppointmentsCount;

  const totalValue = properties.reduce((acc, curr) => acc + (Number(curr.pricing?.price || curr.price) || 0), 0);
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

  const formatLocation = (loc) => {
    if (!loc) return 'N/A';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      return [loc.locality, loc.city].filter(Boolean).join(', ') || loc.address || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Real-Time Floating Lead Notification Popups */}
      <LeadNotificationPopup
        notifications={leadPopups}
        onDismiss={handleDismissPopup}
        onViewLead={handleViewLead}
        businessName={settings.business_name}
      />

      {/* Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        enquiriesBadgeCount={newInquiriesCount}
        appointmentsBadgeCount={pendingAppointmentsCount}
        onLogout={handleAdminLogout}
        isMaintenanceActive={isMaintenanceActive}
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
            <span>{settings.business_name || 'NewHomeDevelopers'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <LeadNotificationBell
              unreadCount={bellUnreadCount}
              recentLeads={recentLeads}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onTestAlert={handleTestAlert}
              onSelectLead={handleViewLead}
              onClearAll={handleClearAllLeads}
              onOpen={handleOpenBell}
            />
          </div>
        </div>

        {/* Desktop Top Status Bar */}
        <header className="admin-top-status-bar">
          <div className="admin-system-name">
            {settings.business_name || 'NewHomeDevelopers'} Management Portal
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LeadNotificationBell
              unreadCount={bellUnreadCount}
              recentLeads={recentLeads}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onTestAlert={handleTestAlert}
              onSelectLead={handleViewLead}
              onClearAll={handleClearAllLeads}
              onOpen={handleOpenBell}
            />
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
                  <h1 className="admin-main-title">Welcome to {settings.business_name || 'Operations'} Dashboard</h1>
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
                              <span style={{ color: '#64748b', fontSize: '0.86rem' }}>{formatLocation(p.location)}</span>
                            </td>
                            <td>
                              <span className="badge-type-pill">{p.propertyType}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#b87d28' }}>{formatPrice(p.pricing?.price ?? p.price ?? 0)}</span>
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
            <div style={{ marginTop: '-1.25rem' }}>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                {inq.propertyId && (
                                  <a
                                    href={`/property/${inq.propertyId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textDecoration: 'none' }}
                                    title="View Property Page"
                                  >
                                    ID: #{inq.propertyId}
                                  </a>
                                )}
                                {inq.propertyLocation && (
                                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{formatLocation(inq.propertyLocation)}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div 
                                style={{ 
                                  fontSize: '0.82rem', 
                                  color: '#475569', 
                                  maxWidth: '260px', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer'
                                }} 
                                title={inq.message ? `${inq.message} (Click to view full enquiry)` : 'No extra message'}
                                onClick={() => setSelectedInquiry(inq)}
                              >
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
                                  onClick={() => setSelectedInquiry(inq)}
                                  className="btn-action-icon view"
                                  title="View Full Enquiry"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConnectWhatsApp(inq.phone, inq.clientName, inq.propertyTitle, inq.propertyId)}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                {app.propertyId && (
                                  <a
                                    href={`/property/${app.propertyId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textDecoration: 'none' }}
                                    title="View Property Page"
                                  >
                                    ID: #{app.propertyId}
                                  </a>
                                )}
                                {app.propertyLocation && (
                                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{formatLocation(app.propertyLocation)}</span>
                                )}
                              </div>
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
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus === 'CONFIRMED' && app.status !== 'CONFIRMED') {
                                    handleConfirmBooking(app);
                                  } else {
                                    handleUpdateAppointmentStatus(app._id, newStatus);
                                  }
                                }}
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
                                    onClick={() => handleConfirmBooking(app)}
                                    className="btn-action-icon"
                                    style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                    title="Confirm Booking & Send Notification"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAppointmentWhatsApp(app)}
                                  className="btn-action-icon"
                                  style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                  title={app.status === 'CONFIRMED' ? 'Resend Confirmation via WhatsApp' : 'WhatsApp Client'}
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
            <AdminSettings />
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

      {/* Customer Enquiry Details Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onUpdateStatus={(id, status) => {
          handleUpdateInquiryStatus(id, status);
          setSelectedInquiry(prev => prev ? { ...prev, status } : null);
        }}
        onDelete={(id) => {
          handleDeleteInquiry(id);
          setSelectedInquiry(null);
        }}
        onConnectWhatsApp={handleConnectWhatsApp}
      />
    </div>
  );
};

export default AdminDashboardPage;
