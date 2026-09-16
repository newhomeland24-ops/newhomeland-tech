import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 3 hours of inactivity in milliseconds
const INACTIVITY_TIMEOUT_MS = 3 * 60 * 60 * 1000;
const ACTIVITY_STORAGE_KEY = 'admin_last_activity';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/admin/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem(ACTIVITY_STORAGE_KEY);
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, []);

  // Check initial authentication and verify inactivity limit
  useEffect(() => {
    const checkAuth = async () => {
      const lastActive = parseInt(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '0', 10);
      const now = Date.now();

      // If inactive for more than 3 hours, force logout immediately
      if (lastActive && now - lastActive > INACTIVITY_TIMEOUT_MS) {
        await logout();
        setLoading(false);
        return;
      }

      try {
        await axios.get('/api/auth/admin/verify');
        setIsAuthenticated(true);
        // Refresh activity timestamp on successful verification
        localStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [logout]);

  // Inactivity tracking: monitors user events and logs out after 3 hours of idle time
  useEffect(() => {
    if (!isAuthenticated) return;

    // Record initial activity if not set
    if (!localStorage.getItem(ACTIVITY_STORAGE_KEY)) {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
    }

    // Throttled activity updater (at most once every 15 seconds)
    let lastThrottledUpdate = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledUpdate > 15000) {
        lastThrottledUpdate = now;
        localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
      }
    };

    // Listen to standard user interaction events
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Periodic check every 30 seconds for 3-hour inactivity expiration
    const inactivityInterval = setInterval(() => {
      const lastActive = parseInt(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '0', 10);
      if (lastActive && Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
        logout();
      }
    }, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(inactivityInterval);
    };
  }, [isAuthenticated, logout]);

  const sendOtp = async (email) => {
    try {
      const response = await axios.post('/api/auth/admin/send-otp', { email });
      return { success: true, message: response.data?.message || 'Verification code sent.' };
    } catch (error) {
      const status = error.response?.status;
      const message =
        status === 403
          ? 'Unauthorized: Only registered admin email is allowed.'
          : error.response?.data?.message || 'Failed to send verification code.';
      return { success: false, message, status };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post('/api/auth/admin/verify-otp', { email, otp });
      const token = response.data?.token;

      if (token) {
        localStorage.setItem('adminToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Record active timestamp on successful login
      localStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired verification code.',
      };
    }
  };

  return { isAuthenticated, loading, sendOtp, verifyOtp, logout };
};
