import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function RecruiterDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_jobs: 0, active_jobs: 0, total_applications: 0, total_views: 0, avg_skill_match: 85 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, jobsRes] = await Promise.all([
        axios.get(buildApiUrl('/api/analytics/recruiter'), { headers }).catch(() => null),
        axios.get(buildApiUrl('/api/recruiter/jobs'), { headers }).catch(() => ({ data: [] }))
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      setRecentJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
    } catch (err) {
      console.error('Error loading recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recruiter Dashboard 💼</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
            Welcome back! Monitor applicant pipelines, job performance, and post new positions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/recruiter/add-job')}
            style={{ padding: '12px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Post New Job
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading recruiter dashboard metrics...</div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Total Jobs Posted</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>{stats.total_jobs}</div>
              <div style={{ color: '#059669', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>Active: {stats.active_jobs}</div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Total Applications</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>{stats.total_applications}</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Submitted by candidates</div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Total Impressions</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', marginTop: '8px' }}>{stats.total_views}</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Job views & swipes</div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Average Match Score</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', marginTop: '8px' }}>{stats.total_applications > 0 ? (stats.avg_skill_match || 0) : 0}%</div>
              <div style={{ color: stats.total_applications > 0 ? '#059669' : '#64748b', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                {stats.total_applications > 0 ? 'AI Resume Match' : 'No applications yet'}
              </div>
            </div>
          </div>

          {/* Quick Overview Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Job Postings</h2>
            <button
              onClick={() => navigate('/recruiter/my-jobs')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
            >
              View All Jobs →
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#64748b', margin: 0 }}>No active job postings yet. Click "+ Post New Job" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {recentJobs.slice(0, 4).map((job) => (
                <div key={job.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h3>
                    <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {job.job_type || 'Full Time'}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    📍 {job.location || 'Remote'} • 💰 {job.salary || 'Competitive'}
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    <button
                      onClick={() => navigate('/recruiter/applications')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Applications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  border: '1px solid #f1f5f9'
};

export default RecruiterDashboard;
