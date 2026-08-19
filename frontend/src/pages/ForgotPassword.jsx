import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch(buildApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: data.message || `Password reset link sent to '${email}'. Please check your inbox to set a new password.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.detail || 'Failed to send password reset request.'
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Unable to reach backend server. Please check your network connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)',
        padding: '40px 48px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Back Button & Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              color: '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Back to Login
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 800 }}>
            <span style={{ background: '#2563eb', color: '#fff', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>S</span>
            <span style={{ color: '#0f172a' }}>SwipeX</span>
          </div>
        </div>

        {/* Icon & Heading */}
        <div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px'
          }}>
            🔐
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Forgot Password?</h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', margin: 0, lineHeight: '1.5' }}>
            Enter your registered email address and we'll send you instructions to set a new password.
          </p>
        </div>

        {/* Status Notification Box */}
        {statusMessage && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '14px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontWeight: 600,
            background: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: statusMessage.type === 'success' ? '#059669' : '#dc2626',
            border: statusMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>📧</span>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '15px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            {loading ? 'Sending Instructions...' : 'Send Password Reset Email'}
          </button>
        </form>

        {/* Proceed to set password link */}
        {statusMessage?.type === 'success' && (
          <button
            onClick={() => navigate('/reset-password')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: '#f1f5f9',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Proceed to Set New Password →
          </button>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
