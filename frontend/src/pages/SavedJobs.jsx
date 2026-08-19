import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function SavedJobs() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear data when component mounts/user changes
    setJobs([]);
    setLoading(true);
    
    // Only fetch if user is authenticated
    if (user && token) {
      fetchSavedJobs();
    } else {
      setLoading(false);
    }
  }, [user?.id, token]); // Re-fetch when user or token changes

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const currentToken = token || localStorage.getItem('accessToken');
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};

      const res = await axios.get(buildApiUrl('/api/saved-jobs'), { headers }).catch(() => ({ data: [] }));
      setJobs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/applications/apply'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const handleRemove = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(buildApiUrl(`/api/saved/remove/${jobId}`), { headers: { Authorization: `Bearer ${token}` } });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      alert('Job removed from saved list.');
    } catch (err) {
      // Fallback optimistic update if backend remove endpoint varies
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Saved Jobs 💙</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
            Jobs you saved during swipes or searches. Review and submit your applications anytime.
          </p>
        </div>
        <button
          onClick={fetchSavedJobs}
          style={{
            padding: '10px 18px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#334155'
          }}
        >
          Refresh List 🔄
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading your saved jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>No saved jobs yet</h3>
          <p style={{ color: '#64748b', marginTop: '6px' }}>Swipe right on jobs in the Swipe tab or click Save on Discover to add them here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {jobs.map((job) => (
            <div key={job.id} style={{
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
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h3>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                    Saved
                  </span>
                </div>

                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>
                  🏢 {job.company_name || 'SwipeX Partner'} • 📍 {job.location || 'Remote'}
                </div>

                <div style={{ color: '#2563eb', fontSize: '15px', fontWeight: 700, marginTop: '10px' }}>
                  💰 {job.salary || 'Competitive Salary'}
                </div>

                {job.description && (
                  <p style={{ color: '#475569', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>
                    {job.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleApply(job.id)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Apply Now
                </button>
                <button onClick={() => handleRemove(job.id)} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
