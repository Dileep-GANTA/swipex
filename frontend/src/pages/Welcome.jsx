import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    // If splash screen has not been shown yet, redirect to /splash to ensure 10s splash display
    const splashShown = sessionStorage.getItem('splash_shown');
    if (!splashShown) {
      navigate('/splash');
    }
  }, [navigate]);

  const handleRoleNavigateToLogin = (roleName) => {
    localStorage.setItem('selected_role', roleName);
    navigate('/login');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill in all fields.');
      return;
    }
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
      alert('Thank you for contacting SwipeX! Our team will get back to you shortly.');
    }, 1000);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      background: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Top Navbar - Fixed 70px height, crystal clear header extended full width */}
      <header style={{
        height: '70px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 64px',
        borderBottom: '1px solid #f1f5f9',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 800, cursor: 'pointer' }}
        >
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

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'how-it-works', label: 'How it Works' },
            { id: 'features', label: 'Features' },
            { id: 'about-us', label: 'About Us' },
            { id: 'contact', label: 'Contact' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#475569',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 24px',
              borderRadius: '10px',
              border: '1px solid #2563eb',
              background: '#ffffff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '9px 24px',
              borderRadius: '10px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Container - Extended 100% Full Width across Laptop Screen */}
      <main style={{
        flex: 1,
        width: '100%',
        padding: '24px 64px',
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto'
      }}>
        
        {/* PAGE VIEW 1: HOME */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '20px', width: '100%' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '48px',
              alignItems: 'center',
              flex: 1,
              width: '100%'
            }}>
              {/* Left Column Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '5px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  width: 'fit-content'
                }}>
                  Welcome to SwipeX 👋
                </div>

                <h1 style={{ fontSize: '46px', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: '1.15' }}>
                  Find Jobs That<br />
                  <span style={{ color: '#2563eb' }}>Fit Your Future</span>
                </h1>

                <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', margin: 0, maxWidth: '520px' }}>
                  Swipe, match, and connect with the right opportunities. Your next career move is just a swipe away.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      💼
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Smart Job Matching</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.3' }}>
                        AI-powered recommendations tailored to your skills and preferences.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      ⚡
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Swipe & Discover</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.3' }}>
                        Swipe right for opportunities, left to skip. It's that simple!
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      📊
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Track & Grow</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.3' }}>
                        Track applications, save jobs, and grow your career.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons: Direct turn to Login page */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleRoleNavigateToLogin('Job Seeker')}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '12px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    I'm a Job Seeker →
                  </button>

                  <button
                    onClick={() => handleRoleNavigateToLogin('Recruiter')}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    I'm a Recruiter
                  </button>
                </div>
              </div>

              {/* Right Column Interactive Company Card - Stretches to Fulfill Right Side of Laptop Screen */}
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                minHeight: '380px',
                width: '100%'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '360px',
                  height: '360px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0) 70%)',
                  top: '50%',
                  right: '40px',
                  transform: 'translateY(-50%)',
                  zIndex: 0
                }} />

                <div style={{ position: 'relative', width: '100%', maxWidth: '540px', zIndex: 1 }}>
                  <div style={{
                    position: 'relative',
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '28px 32px',
                    boxShadow: '0 20px 45px rgba(15,23,42,0.08)',
                    border: '1px solid #e2e8f0',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#4285f4' }}>G</div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Google <span style={{ color: '#2563eb' }}>✓</span>
                          </h3>
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Senior Software Engineer (Cloud)</span>
                        </div>
                      </div>
                      <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
                        🏢 MNC
                      </span>
                    </div>

                    <div style={{ color: '#475569', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      <div>📍 Bangalore, India • Remote Available</div>
                      <div style={{ color: '#059669', fontWeight: 800, fontSize: '16px' }}>💰 ₹18 - 25 LPA</div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {['React', 'Node.js', 'JavaScript', 'Python', '2-5 Yrs Exp'].map((tag, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', color: '#334155', fontSize: '12px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
                      <span style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 8px 20px rgba(239,68,68,0.18)', border: '1px solid #fecaca', cursor: 'pointer' }}>❌</span>
                      <span style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 8px 20px rgba(16,185,129,0.18)', border: '1px solid #a7f3d0', cursor: 'pointer' }}>💚</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner Card */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '16px 32px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              flexShrink: 0,
              width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👥</div>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                  Join thousands of job seekers and recruiters finding the perfect match on SwipeX.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '10px' }}>+2K Active Users</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE VIEW 2: HOW IT WORKS */}
        {activeTab === 'how-it-works' && (
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '36px 48px', border: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 28px auto' }}>
              <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Workflow</span>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px', margin: 0 }}>How SwipeX Works</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Get matched with your dream job in 3 simple interactive steps.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={featureCardStyle}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>1</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '12px', margin: 0 }}>Create Profile & Upload Resume</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Upload your resume for instant AI skill parsing, ATS keyword analysis, and profile matching.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>2</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '12px', margin: 0 }}>Swipe & Get Matched</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Swipe right on opportunities you love, left to skip. Our AI engine learns your tech preferences in real-time.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>3</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '12px', margin: 0 }}>Track Status & Get Hired</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Monitor application status live from submission to interview offer with real-time push alerts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE VIEW 3: FEATURES */}
        {activeTab === 'features' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 48px', border: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 28px auto' }}>
              <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Features</span>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px', margin: 0 }}>Platform Features Built for Speed</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Designed for candidate speed and recruiter accuracy.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div style={featureCardStyle}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Resume ATS Engine</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Instant keyword matching score against target recruiter job requirements.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tinder-Style Swiping</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Swipe right to save or apply to job cards with intuitive gesture controls.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Live Application Pipeline</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Track applications across Shortlisted, Interview, Offer, and Selection stages.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Real-Time Activity Alerts</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                  Instant notifications when recruiters review your profile or update status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE VIEW 4: ABOUT US */}
        {activeTab === 'about-us' && (
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '36px 48px', border: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
              <span style={{ color: '#059669', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>About Us</span>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px', margin: 0 }}>Reinventing Recruitment</h2>
              <p style={{ color: '#475569', fontSize: '15px', marginTop: '12px', lineHeight: '1.6' }}>
                We are revolutionizing recruitment by eliminating painful job hunting processes. SwipeX connects top technology talent with high-growth companies through intelligent AI matching, interactive swiping, and instant direct candidate tracking.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '28px', flexWrap: 'wrap' }}>
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 28px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>100K+</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Active Candidates</div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 28px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669' }}>5,000+</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Verified Recruiters</div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 28px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#7c3aed' }}>94%</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Placement Match Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE VIEW 5: CONTACT */}
        {activeTab === 'contact' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 48px', border: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Contact Us</span>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px', margin: 0 }}>Get in Touch</h2>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px', lineHeight: '1.5' }}>
                  Have questions, partnership inquiries, or platform feedback? Send us a message and our team will get back to you right away.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, fontSize: '14px' }}>
                    <span>📧</span> support@swipex.com
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, fontSize: '14px' }}>
                    <span>📞</span> +1 (800) 555-SWIPEX
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, fontSize: '14px' }}>
                    <span>📍</span> Bangalore & San Francisco HQ
                  </div>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <form onSubmit={handleContactSubmit} style={{ background: '#f8fafc', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Send Us a Message</h3>

                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  style={inputStyle}
                />
                <textarea
                  placeholder="Your Message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />

                <button
                  type="submit"
                  disabled={contactSubmitted}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                  }}
                >
                  {contactSubmitted ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const featureCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
  border: '1px solid #e2e8f0'
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'Inter, sans-serif'
};

export default Welcome;
