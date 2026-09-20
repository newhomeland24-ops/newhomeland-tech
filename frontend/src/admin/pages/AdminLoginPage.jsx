import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useSettings } from '../../context/SettingsContext';
import { Shield, Mail, KeyRound, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, RotateCw, Building2 } from 'lucide-react';

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
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = otp.split('');
    newOtp[index] = digit;
    const finalOtp = newOtp.join('');
    setOtp(finalOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtp(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

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
      setInfoMessage('');
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
          <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <div className="brand-icon" style={{ width: '54px', height: '54px' }}>
              <Building2 size={28} />
            </div>
            <div className="brand-text" style={{ textAlign: 'left' }}>
              <span className="brand-title" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', display: 'block' }}>{settings.business_name || 'NewHomeDevelopers'}</span>
              <span className="brand-subtitle" style={{ fontSize: '0.85rem', color: '#64748b' }}>{settings.tagline || 'Your Ground. Your Future.'}</span>
            </div>
          </Link>
          <h2>Admin Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Management Dashboard
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
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
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
                A 6-digit one-time code will be dispatched to admin email.
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

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', textAlign: 'left' }}>
                6-Digit Security Code
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '0.5rem' }} onPaste={handleOtpPaste}>
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    required
                    autoFocus={index === 0}
                    maxLength={2} // Allow 2 characters so we can grab the last typed digit easily
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="form-input"
                    style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      width: '45px',
                      height: '50px'
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  marginTop: '0.75rem',
                  display: 'block',
                  textAlign: 'left',
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
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: '1.25rem',
                fontSize: '0.82rem',
              }}
            >

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
