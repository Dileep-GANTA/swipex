import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthServices from '../services/authService';

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('selected_role') || 'Job Seeker');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const handleRoleClick = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('selected_role', selectedRole);
    // Stay on Register page to create account based on selected role!
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await AuthServices.register({
        username: email.split('@')[0],
        full_name: fullName,
        email,
        phone_number: phone,
        role,
        password,
      });
      alert(`Account created successfully as ${role}! Redirecting to login...`);
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Registration failed.';
      alert(message === 'Network Error' ? 'Unable to connect to SwipeX API backend. Please check your network connection.' : message);
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
      {/* 16:9 Desktop Widescreen Container Card extending to left */}
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
        
        {/* Left Panel */}
        <div style={{
          background: 'linear-gradient(145deg, #f0f7ff 0%, #e6f0fa 100%)',
          padding: '48px 40px',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid #e2e8f0'
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
              <span style={{ color: '#0f172a' }}>SwipeX</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.25', marginTop: '36px', marginBottom: '12px', color: '#0f172a' }}>
              Find Jobs That<br />
              <span style={{ color: '#2563eb' }}>Fit Your Future</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', maxWidth: '380px', marginBottom: '32px' }}>
              Swipe, match, and connect with the right opportunities effortlessly.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  🔍
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Smart Job Matching</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.4' }}>
                    AI-powered recommendations tailored for you.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  ⚡
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Swipe & Discover</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.4' }}>
                    Swipe right for opportunities, left to skip.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  📊
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Track & Grow</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.4' }}>
                    Track applications and grow your career.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(37,99,235,0.08)',
            border: '1px solid #dbeafe',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💻</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Join 2,000+ Professionals</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Find your next role or top talent today.</div>
            </div>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
          
          <div style={{ textAlign: 'right', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              Login
            </button>
          </div>

          <div style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Create Your Account</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', marginBottom: '24px' }}>
              Join SwipeX and start your journey today!
            </p>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Role Cards: Selects role for registration without turning page */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>I am a</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => handleRoleClick('Job Seeker')}
                    style={{
                      border: role === 'Job Seeker' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: role === 'Job Seeker' ? '#eff6ff' : '#ffffff',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Job Seeker</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Find jobs and grow your career</div>
                    </div>
                    {role === 'Job Seeker' && (
                      <span style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✓</span>
                    )}
                  </div>

                  <div
                    onClick={() => handleRoleClick('Recruiter')}
                    style={{
                      border: role === 'Recruiter' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: role === 'Recruiter' ? '#eff6ff' : '#ffffff',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💼</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Recruiter</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Post jobs and hire the best talent</div>
                    </div>
                    {role === 'Recruiter' && (
                      <span style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✓</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name & Email Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>👤</span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>✉️</span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Phone & Create Password Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>📞</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
              </div>

              {/* Password Requirement Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={pillStyle(hasMinLen)}>{hasMinLen ? '✓' : '🔘'} Min 8 characters</span>
                <span style={pillStyle(hasUpper)}>{hasUpper ? '✓' : '🔘'} One uppercase letter</span>
                <span style={pillStyle(hasNumber)}>{hasNumber ? '✓' : '🔘'} One number</span>
                <span style={pillStyle(hasSpecial)}>{hasSpecial ? '✓' : '🔘'} One special character</span>
              </div>

              {/* Terms Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                I agree to the <span style={{ color: '#2563eb', fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: '#2563eb', fontWeight: 700 }}>Privacy Policy</span>
              </label>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  marginTop: '4px'
                }}
              >
                {loading ? `Creating ${role} Account...` : `Create ${role} Account`}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>or sign up with</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" style={socialBtnStyle}>
                <span>🌐</span> Google
              </button>
              <button type="button" style={socialBtnStyle}>
                <span>in</span> LinkedIn
              </button>
              <button type="button" style={socialBtnStyle}>
                <span>🍎</span> Apple
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'Inter, sans-serif'
};

const pillStyle = (active) => ({
  background: active ? '#ecfdf5' : '#f1f5f9',
  color: active ? '#059669' : '#64748b',
  border: active ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: '12px',
  fontWeight: 600
});

const socialBtnStyle = {
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#334155',
  fontWeight: 700,
  fontSize: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px'
};

export default Register;
