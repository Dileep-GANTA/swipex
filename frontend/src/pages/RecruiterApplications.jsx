import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(buildApiUrl('/api/recruiter/applications'), { headers }).catch(() => ({ data: [] }));
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(buildApiUrl(`/api/applications/${appId}`), { status: newStatus }, { headers });

      setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));
    } catch (err) {
      console.error('Error updating status:', err);
      setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));
    }
  };

  const handleViewResume = (app) => {
    const hasResume = app.resume_url &&
                      app.resume_url !== 'null' &&
                      app.resume_url !== 'undefined' &&
                      app.resume_url !== '' &&
                      app.has_resume !== false;

    if (hasResume) {
      window.open(buildApiUrl(app.resume_url), '_blank');
    } else {
      setPopupMessage(`Resume not uploaded by ${app.applicant_name || 'the applicant'}.`);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Candidate Applications 👥</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
          Review candidate resumes, skill match scores, and manage hiring pipeline statuses.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading applicant pipelines...</div>
      ) : applications.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📬</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>No applications yet</h3>
          <p style={{ color: '#64748b', marginTop: '6px' }}>When job seekers apply to your job postings, their applications will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {applications.map((app) => (
            <div key={app.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{app.applicant_name}</h3>
                    <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>📧 {app.applicant_email}</div>
                  </div>
                  <span style={{
                    background: app.status === 'Shortlisted' ? '#ecfdf5' : app.status === 'Rejected' ? '#fef2f2' : app.status === 'Selected' ? '#eff6ff' : '#f8fafc',
                    color: app.status === 'Shortlisted' ? '#059669' : app.status === 'Rejected' ? '#dc2626' : app.status === 'Selected' ? '#2563eb' : '#64748b',
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}>
                    {app.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginTop: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Applied Position:</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{app.job_title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px' }}>
                      🔥 {app.matching_score}% Match Score
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Skills: {app.applicant_skills || 'React, Python, SQL'}</div>
                  
                  {/* View Resume Action Button */}
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => handleViewResume(app)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: '1px solid #bfdbfe',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.08)'
                      }}
                    >
                      📄 View Resume
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ecfdf5', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Selected')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#eff6ff', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                >
                  Select
                </button>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Message Modal when Resume is Not Uploaded */}
      {popupMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '44px' }}>📄⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Resume Not Uploaded
            </h3>
            <p style={{ color: '#475569', fontSize: '15px', margin: 0, lineHeight: '1.5', fontWeight: 500 }}>
              {popupMessage}
            </p>
            <button
              onClick={() => setPopupMessage(null)}
              style={{
                marginTop: '8px',
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterApplications;
