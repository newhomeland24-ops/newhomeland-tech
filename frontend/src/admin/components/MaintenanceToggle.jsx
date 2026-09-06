import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldAlert, CheckCircle2, Save, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenanceToggle = ({ onStatusChange, onClose }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setIsMaintenance(res.data.isMaintenance);
        setMessage(res.data.maintenanceMessage || '');
        setLastUpdated(res.data.updatedAt);
        if (onStatusChange) onStatusChange(res.data.isMaintenance);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      toast.error('Failed to load maintenance settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put('/api/settings', { 
        isMaintenance, 
        maintenanceMessage: message 
      });
      if (res.data) {
        setLastUpdated(res.data.updatedAt || new Date());
        if (onStatusChange) onStatusChange(isMaintenance);
      }
      toast.success(isMaintenance ? 'System placed in Maintenance Mode' : 'Public portal is now LIVE');
    } catch (error) {
      console.error('Failed to update settings', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#d49a3f' }} />
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Retrieving system configuration...</p>
      </div>
    );
  }

  return (
    <div className="maintenance-panel-card">
      <div className="maintenance-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className={`maintenance-icon-badge ${isMaintenance ? 'amber' : 'green'}`}>
            {isMaintenance ? <ShieldAlert size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Public Portal Visibility & Maintenance
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Control whether public visitors can access properties or see a maintenance announcement.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={`status-pill ${isMaintenance ? 'amber' : 'green'}`}>
            <span className="pulse-dot" />
            <span>{isMaintenance ? 'Maintenance Active' : 'Public Site Live'}</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="modal-close-icon-btn"
              title="Close Panel"
              style={{ width: '32px', height: '32px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isMaintenance ? (
        <div className="maintenance-alert-box alert-warning">
          <AlertTriangle size={20} style={{ flexShrink: 0, color: '#d97706' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.88rem' }}>
              Public Kill-Switch Engaged
            </div>
            <div style={{ color: '#b45309', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              All public visitors to NewHomeLand will see the maintenance splash screen. The Admin dashboard remains accessible.
            </div>
          </div>
        </div>
      ) : (
        <div className="maintenance-alert-box alert-success">
          <CheckCircle2 size={20} style={{ flexShrink: 0, color: '#10b981' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.88rem' }}>
              Public Catalog Active
            </div>
            <div style={{ color: '#047857', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              All properties are visible to the public according to their individual published dates.
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Toggle Switch */}
        <div className="maintenance-toggle-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              Maintenance Mode Switch
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
              {isMaintenance 
                ? 'Flip to restore normal public access' 
                : 'Flip to immediately suspend public browsing'}
            </div>
          </div>

          <label className="switch-control">
            <input 
              type="checkbox" 
              checked={isMaintenance}
              onChange={(e) => setIsMaintenance(e.target.checked)}
            />
            <span className="switch-slider" />
          </label>
        </div>

        {/* Message Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            Maintenance Announcement (Visible to Public Visitors)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="form-input"
            style={{ width: '100%', resize: 'vertical', borderRadius: '10px', fontSize: '0.9rem' }}
            placeholder="NewHomeLand catalog is currently undergoing scheduled maintenance..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            <span>Supports plain text announcements</span>
            {lastUpdated && <span>Last modified: {new Date(lastUpdated).toLocaleString()}</span>}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button 
            type="button"
            onClick={fetchSettings}
            disabled={isSaving}
            className="btn btn-outline btn-sm"
          >
            Reset Changes
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-gold btn-sm"
            style={{ minWidth: '140px' }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Apply Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceToggle;
