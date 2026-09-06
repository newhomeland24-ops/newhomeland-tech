import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const AdminLoginPage = () => {
  useEffect(() => {
    document.title = 'Admin Portal Secure Login | NewHomeLand';
  }, []);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const result = await login(password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="brand-icon" style={{ width: '54px', height: '54px', margin: '0 auto' }}>
            <Shield size={28} />
          </div>
          <h2>Admin Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            NewHomeLand Management Dashboard
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Master Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-gold"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
