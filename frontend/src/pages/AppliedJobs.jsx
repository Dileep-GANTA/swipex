import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AppliedJobs = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear data when component mounts/user changes
    setApplications([]);
    setLoading(true);
    
    // Only fetch if user is authenticated
    if (user && token) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user?.id, token]); // Re-fetch when user or token changes

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const currentToken = token || localStorage.getItem('accessToken');
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
      const res = await axios.get(buildApiUrl('/api/applications/my-applications'), { headers }).catch(() => null);

      if (res && Array.isArray(res.data)) {
        const mapped = res.data.map((app) => {
          const rawStatus = app.status || 'Pending';
          let bg = '#eff6ff', color = '#2563eb', border = '#bfdbfe';
          if (rawStatus === 'Shortlisted') { bg = '#ecfdf5'; color = '#059669'; border = '#a7f3d0'; }
          if (rawStatus === 'Interview') { bg = '#fffbeb'; color = '#d97706'; border = '#fde68a'; }
          if (rawStatus === 'Rejected') { bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca'; }
          return {
            id: app.id,
            job_id: app.job_id,
            job_title: app.job_title || 'Software Developer',
            company_name: app.company_name || 'Tech Company',
            status: rawStatus,
            applied_at: app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            badge_bg: bg,
            badge_color: color,
            border_color: border
          };
        });
        setApplications(mapped);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (appId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to remove your application for '${jobTitle}'?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(buildApiUrl(`/api/applications/${appId}`), { headers });
      
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      alert(`Application for '${jobTitle}' removed successfully!`);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to remove application.');
    }
  };

  const filtered = applications.filter((app) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Applied') return app.status === 'Applied' || app.status === 'Pending' || app.status === 'New';
    return app.status === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Applications 📝</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', margin: 0 }}>
          Monitor the real-time status of every job application from submission to final selection.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Applications Data Table Container */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading application status...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No applications found in this status category.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Job Title</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Company</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Applied On</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '18px 20px', fontWeight: 800, color: '#0f172a' }}>{row.job_title}</td>
                  <td style={{ padding: '18px 20px', color: '#475569', fontWeight: 600 }}>{row.company_name}</td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      background: row.badge_bg,
                      color: row.badge_color,
                      border: `1px solid ${row.border_color}`,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 800
                    }}>
                      {row.status === 'Pending' ? 'Applied' : row.status}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', color: '#64748b', fontWeight: 500 }}>{row.applied_at}</td>
                  <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRemoveApplication(row.id, row.job_title)}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(220,38,38,0.08)'
                      }}
                    >
                      🗑️ Remove Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;
