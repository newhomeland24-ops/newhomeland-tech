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

  if (isLoading) return <div className="animate-pulse bg-gray-800 h-48 rounded-xl"></div>;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
          <Settings2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Global Maintenance Mode</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-start bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300 font-medium mb-1">Warning: Public Kill-Switch</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enabling this will immediately block all public traffic and display the maintenance splash screen. The Admin portal will remain operational.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Enable Maintenance</h4>
            <p className="text-sm text-gray-400">Toggle public portal visibility</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isMaintenance}
              onChange={(e) => setIsMaintenance(e.target.checked)}
            />
            <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Maintenance Message (Visible to Public)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="3"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="We are currently performing maintenance..."
          ></textarea>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors border border-gray-600"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceToggle;
