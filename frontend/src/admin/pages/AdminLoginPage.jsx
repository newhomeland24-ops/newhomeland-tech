import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useSettings } from '../../context/SettingsContext';
import { Shield, Mail, KeyRound, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, RotateCw } from 'lucide-react';

const AdminLoginPage = () => {
  const { settings } = useSettings();
  const { sendOtp, verifyOtp } = useAdminAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Email input, 2 = OTP input
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    document.title = `Admin Portal Secure Login | ${settings.business_name || 'Admin'}`;
  }, [settings.business_name]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      setError('Please enter your administrator email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    const result = await sendOtp(cleanEmail);
    setIsSubmitting(false);

    if (result.success) {
      setInfoMessage(result.message || 'Verification code sent to your email.');
      setStep(2);
      setResendCooldown(60);
    } else {
      setError(result.message || 'Unable to send verification code.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = (otp || '').trim();
    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await verifyOtp(email.trim(), cleanOtp);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Invalid or expired verification code.');
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
    setInfoMessage('');
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
            {settings.business_name || 'NewHomeDevelopers'} Management Dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && step === 2 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#ecfdf5',
              color: '#047857',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Admin Email Form */
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@newhomedevelopers.in"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={17}
                  color="#94a3b8"
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                A 6-digit one-time code will be dispatched to your authorized inbox.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              <span>{isSubmitting ? 'Sending Code...' : 'Send Login Code'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Form */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Verification code sent to <br />
                <strong style={{ color: '#0f172a' }}>{email}</strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                6-Digit Security Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  className="form-input"
                  style={{
                    paddingLeft: '2.5rem',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '0.35em',
                    fontWeight: 700,
                  }}
                />
                <KeyRound
                  size={17}
                  color="#94a3b8"
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  marginTop: '0.35rem',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                Code expires in 5 minutes.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length < 6}
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Login'}</span>
              <CheckCircle2 size={16} />
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                fontSize: '0.82rem',
              }}
            >
              <button
                type="button"
                onClick={handleBackToEmail}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                }}
              >
                <ArrowLeft size={14} />
                <span>Use Different Email</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isSubmitting}
                onClick={handleSendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#94a3b8' : '#d97706',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                <RotateCw size={13} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
