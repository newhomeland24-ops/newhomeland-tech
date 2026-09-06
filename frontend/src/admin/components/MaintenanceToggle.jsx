import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Settings2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenanceToggle = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) {
          setIsMaintenance(res.data.isMaintenance);
          setMessage(res.data.maintenanceMessage);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put('/api/settings', { isMaintenance, maintenanceMessage: message });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
          <Settings2 size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Global Maintenance Mode</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <AlertTriangle size={20} color="#dc2626" style={{ marginTop: '0.1rem', marginRight: '0.75rem', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Warning: Public Kill-Switch</p>
            <p style={{ fontSize: '0.75rem', color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>
              Enabling this will immediately block all public traffic and display the maintenance splash screen. The Admin portal will remain operational.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', margin: '0 0 0.25rem 0' }}>Enable Maintenance</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Toggle public portal visibility</p>
          </div>
          <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginLeft: 'auto' }}>
            <input 
              type="checkbox" 
              checked={isMaintenance}
              onChange={(e) => setIsMaintenance(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div style={{
              width: '3.5rem', height: '1.75rem', background: isMaintenance ? '#d97706' : '#cbd5e1', borderRadius: '9999px',
              transition: 'all 0.3s', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '2px', left: isMaintenance ? 'calc(100% - 1.5rem - 2px)' : '2px',
                width: '1.5rem', height: '1.5rem', background: '#fff', borderRadius: '50%', transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}></div>
            </div>
          </label>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>
            Maintenance Message (Visible to Public)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="3"
            className="form-input"
            style={{ width: '100%', resize: 'none' }}
            placeholder="We are currently performing maintenance..."
          ></textarea>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-gold"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save size={18} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceToggle;
