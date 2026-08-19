import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const jobSeekerLinks = [
    { to: '/jobseeker/home', label: 'Home', icon: '🏠' },
    { to: '/jobseeker/discover', label: 'Discover Jobs', icon: '🔍' },
    { to: '/jobseeker/swipe', label: 'Swipe Jobs', icon: '🔥' },
    { to: '/jobseeker/recommended', label: 'Recommended', icon: '✨' },
    { to: '/jobseeker/saved', label: 'Saved Jobs', icon: '💙' },
    { to: '/jobseeker/applied', label: 'Applied Jobs', icon: '📝' },
    { to: '/jobseeker/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/jobseeker/resume', label: 'Resume ATS Engine', icon: '⚡' },
    { to: '/jobseeker/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/jobseeker/profile', label: 'Profile', icon: '👤' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/recruiter/add-job', label: 'Add Job', icon: '➕' },
    { to: '/recruiter/my-jobs', label: 'My Jobs', icon: '💼' },
    { to: '/recruiter/applications', label: 'Applications', icon: '📝' },
    { to: '/recruiter/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/recruiter/analytics', label: 'Analytics', icon: '📈' },
    { to: '/recruiter/profile', label: 'Profile', icon: '👤' },
  ];

  const links = role === 'Recruiter' ? recruiterLinks : jobSeekerLinks;
  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      background: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Fixed Left Sidebar (260px) */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        height: '100vh',
        background: '#0f172a',
        color: '#fff',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        boxSizing: 'border-box'
      }}>
        <div>
          {/* App Logo */}
          <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.5px' }}>
            Swipe<span style={{ color: '#38bdf8' }}>X</span>
          </div>

          {/* User Profile Card Header */}
          <div style={{
            background: '#1e293b',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '24px',
            border: '1px solid #334155'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 600 }}>
              Signed in as
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600, marginTop: '4px' }}>
              {role || 'Job Seeker'}
            </div>
          </div>

          {/* Sidebar Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  background: isActive ? '#2563eb' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                })}
              >
                <span style={{ fontSize: '16px' }}>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sticky Sidebar Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Dynamic Content Area (Strict 100vh height with clean internal scroll) */}
      <main style={{
        marginLeft: '260px',
        width: 'calc(100vw - 260px)',
        height: '100vh',
        maxHeight: '100vh',
        padding: '24px 40px',
        boxSizing: 'border-box',
        background: '#ffffff',
        overflowY: 'auto'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
