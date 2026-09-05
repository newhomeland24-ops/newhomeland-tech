import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMaintenance = () => {
  const [maintenance, setMaintenance] = useState({ isMaintenance: false, message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) {
          setMaintenance({
            isMaintenance: res.data.isMaintenance,
            message: res.data.maintenanceMessage
          });
        }
      } catch (error) {
        console.error('Failed to check maintenance status', error);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, []);

  return { maintenance, loading };
};
