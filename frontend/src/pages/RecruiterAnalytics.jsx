import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function RecruiterAnalytics() {
  const [analytics, setAnalytics] = useState({
    total_jobs: 0,
    total_applications: 0,
    total_saved_jobs: 0,
    total_views: '0',
    jobs_breakdown: [],
    recent_applications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch summary metrics
      const res = await axios.get(buildApiUrl('/api/analytics/recruiter'), { headers }).catch(() => null);
      
      // Fetch REAL candidate applications from PostgreSQL
      const appsRes = await axios.get(buildApiUrl('/api/recruiter/applications'), { headers }).catch(() => ({ data: [] }));
      const realApps = Array.isArray(appsRes.data) ? appsRes.data : [];

      const mappedApps = realApps.map((app) => ({
        id: app.id,
        candidate: app.applicant_name || 'Job Seeker',
        job_title: app.job_title || 'Position',
        status: app.status || 'Pending',
        applied_on: app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'
      }));

      setAnalytics({
        total_jobs: res?.data?.total_jobs || 0,
        total_applications: realApps.length,
        total_saved_jobs: res?.data?.saved_jobs || 0,
        total_views: res?.data?.total_views ? `${res.data.total_views}` : '0',
        jobs_breakdown: (res?.data?.jobs_breakdown && res.data.jobs_breakdown.length > 0) ? res.data.jobs_breakdown.map((j, i) => ({
          title: j.title,
          percentage: realApps.length ? Math.round((j.applications / realApps.length) * 100) : 0,
          color: ['#2563eb', '#059669', '#7c3aed', '#d97706'][i % 4]
        })) : [],
        recent_applications: mappedApps
      });
    } catch (err) {
      console.error('Error loading recruiter analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recruiter Analytics 📊</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
          Real-time hiring statistics, job views, applicant conversion rates, and candidate pipeline tracking.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading analytics dashboard...</div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Total Jobs</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{analytics.total_jobs}</div>
              <div style={{ color: analytics.total_jobs > 0 ? '#059669' : '#94a3b8', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                {analytics.total_jobs > 0 ? 'Active positions' : 'No jobs posted'}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Total Applications</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>{analytics.total_applications}</div>
              <div style={{ color: analytics.total_applications > 0 ? '#059669' : '#94a3b8', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                {analytics.total_applications > 0 ? 'Candidates applied' : 'No applications yet'}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Total Saved Jobs</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{analytics.total_saved_jobs}</div>
              <div style={{ color: analytics.total_saved_jobs > 0 ? '#059669' : '#94a3b8', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                {analytics.total_saved_jobs > 0 ? 'Bookmarked by candidates' : 'No saved jobs'}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Job Views</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>{analytics.total_views}</div>
              <div style={{ color: analytics.total_jobs > 0 ? '#059669' : '#94a3b8', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                {analytics.total_jobs > 0 ? 'Candidate impressions' : 'No views recorded'}
              </div>
            </div>
          </div>

          {/* Charts Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Applications Overview Bar Chart */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Applications Overview</h3>
              {analytics.total_applications === 0 ? (
                <div style={{ marginTop: '24px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px stroke #e2e8f0' }}>
                  No application history available yet.<br />Post a job to start tracking candidate applications.
                </div>
              ) : (
                <div style={{ marginTop: '24px', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                  {['1 May', '8 May', '15 May', '22 May', '29 May'].map((label, idx) => {
                    const baseHeight = Math.min(160, Math.max(20, analytics.total_applications * 30));
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100%', maxWidth: '36px', height: `${baseHeight}px`, background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '8px 8px 0 0' }} />
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applications by Job */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Applications by Job</h3>
              {analytics.jobs_breakdown.length === 0 ? (
                <div style={{ marginTop: '20px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                  No active job postings to analyze yet.
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.jobs_breakdown.map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        <span>{item.title}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, borderRadius: '5px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* REAL Candidate Applications Table */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Job Applications</h3>
              {analytics.recent_applications.length > 0 && (
                <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>View All</span>
              )}
            </div>
            {analytics.recent_applications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No candidate applications received yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>Candidate</th>
                    <th style={{ padding: '12px' }}>Job Title</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recent_applications.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>{row.candidate}</td>
                      <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>{row.job_title}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: row.status === 'Shortlisted' ? '#ecfdf5' : '#eff6ff',
                          color: row.status === 'Shortlisted' ? '#059669' : '#2563eb',
                          border: row.status === 'Shortlisted' ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{row.applied_on}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

export default RecruiterAnalytics;
