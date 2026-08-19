import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import AuthServices from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const selectedRole = localStorage.getItem('selected_role');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthServices.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const user = response.user || {};
      const token = response.session_token || localStorage.getItem('accessToken');
      login(user, token);

      const role = user.role || selectedRole || 'Job Seeker';
      if (role === 'Recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/jobseeker/home');
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        (error?.message === 'Network Error'
          ? 'Unable to reach the backend server. Please check your network connection.'
          : 'Invalid email or password. Please verify your password or use "Forgot Password?".');

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Split-Screen Desktop Panel extending fully to left edge */}
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '1440px',
        minHeight: '100vh',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        overflow: 'hidden',
        borderRight: '1px solid #e2e8f0'
      }}>
        {/* Left Dark Blue Panel extending edge-to-edge on left */}
        <div style={{
          background: 'linear-gradient(145deg, #091e42 0%, #041227 100%)',
          padding: '48px 40px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 800 }}>
              <span style={{
                background: '#2563eb',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900
              }}>S</span>
              <span>SwipeX</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: '1.25', marginTop: '40px', marginBottom: '12px' }}>
              Find Jobs That<br />
              <span style={{ color: '#38bdf8' }}>Fit Your Future</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '380px', marginBottom: '36px' }}>
              Swipe, match, and connect with the right opportunities effortlessly.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  💼
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Smart Job Matching</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                    AI-powered recommendations tailored for you.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  ⚡
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Swipe & Discover</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                    Swipe right for opportunities, left to skip.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  📊
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Track & Grow</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                    Track applications and grow your career.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Illustration Card Graphic */}
          <div style={{
            marginTop: '40px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#38bdf8', color: '#091e42', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>👤</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Career Match Verified</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>98% Compatibility Score</div>
            </div>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Header Link */}
          <div style={{ textAlign: 'right', fontSize: '14px', color: '#64748b' }}>
            New to SwipeX?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div style={{ margin: '32px 0' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Welcome Back!</h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px', marginBottom: '32px' }}>
              Login to continue your job search journey {selectedRole ? `as ${selectedRole}` : ''}
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email Input */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>👤</span>
                <input
                  type="email"
                  placeholder="Enter your email"
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
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '14px' }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
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
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'background 0.2s ease'
                }}
              >
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Social Login Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🌐</span> Google
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>in</span> LinkedIn
              </button>
            </div>
          </div>

          {/* Privacy Note Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
            <span>🛡️</span> We respect your privacy and keep your data secure.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
