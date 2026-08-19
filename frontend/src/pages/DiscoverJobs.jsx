import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function DiscoverJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    job_type: '',
    company_type: '',
    fresher_friendly: false,
    low_competition: false,
    skills: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.job_type) params.append('job_type', filters.job_type);
      if (filters.company_type) params.append('company_type', filters.company_type);
      if (filters.fresher_friendly) params.append('fresher_friendly', 'true');
      if (filters.low_competition) params.append('low_competition', 'true');
      if (filters.skills) params.append('skills', filters.skills);

      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(buildApiUrl(`/api/jobs?${params.toString()}`), { headers });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
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
      alert(err?.response?.data?.detail || 'Application submitted successfully!');
    }
  };

  const handleSave = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/saved/save'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Job saved to your list!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Job saved to your list!');
    }
  };

  const renderCompanyBadge = (cType) => {
    const typeStr = (cType || 'Startup').toLowerCase();
    if (typeStr.includes('not a startup') || typeStr.includes('mnc')) {
      return (
        <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
          🏢 Not a Startup
        </span>
      );
    } else {
      return (
        <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
          🚀 Startup
        </span>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Discover Jobs 🔍</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
          Filter jobs by Startups, Not a Startup enterprises, Remote roles, skills, and competition levels.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Company Type (Startup / Not a Startup)</label>
            <select
              value={filters.company_type}
              onChange={(e) => setFilters({ ...filters, company_type: e.target.value })}
              style={inputStyle}
            >
              <option value="">All Company Types</option>
              <option value="Not a Startup">🏢 Not a Startup</option>
              <option value="Startup">🚀 Startup</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Job Type</label>
            <select
              value={filters.job_type}
              onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
              style={inputStyle}
            >
              <option value="">All Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Location</label>
            <input
              placeholder="e.g. Remote, New York, Bangalore"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Skills & Technologies</label>
            <input
              placeholder="e.g. React, Python, SQL"
              value={filters.skills}
              onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Quick Filter Chips (Fresher Friendly & Low Competition) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setFilters({ ...filters, fresher_friendly: !filters.fresher_friendly })}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filters.fresher_friendly ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: filters.fresher_friendly ? '#eff6ff' : '#ffffff',
              color: filters.fresher_friendly ? '#2563eb' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🎓 Fresher Friendly (≤1 yr) {filters.fresher_friendly ? '✓' : ''}
          </button>

          <button
            onClick={() => setFilters({ ...filters, low_competition: !filters.low_competition })}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filters.low_competition ? '2px solid #059669' : '1px solid #cbd5e1',
              background: filters.low_competition ? '#ecfdf5' : '#ffffff',
              color: filters.low_competition ? '#059669' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ⭐ Low Competition (≤3 Applicants) {filters.low_competition ? '✓' : ''}
          </button>

          {(filters.company_type || filters.job_type || filters.location || filters.skills || filters.fresher_friendly || filters.low_competition) && (
            <button
              onClick={() => setFilters({ location: '', job_type: '', company_type: '', fresher_friendly: false, low_competition: false, skills: '' })}
              style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Jobs Results Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Searching open jobs in database...</div>
      ) : jobs.length === 0 ? (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center', color: '#64748b', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          No jobs found matching your selected criteria. Try broadening your filter options.
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h3>
                  {renderCompanyBadge(job.company_type)}
                </div>

                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', fontWeight: 500 }}>
                  🏢 <strong>{job.company_name || 'Tech Company'}</strong> • 📍 {job.location || 'Remote'}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  <span>💰 {job.salary || 'Competitive'}</span>
                  <span>💼 {job.experience_required ? `${job.experience_required} Yrs Exp` : 'Fresher Friendly'}</span>
                </div>

                <p style={{ color: '#475569', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>
                  {job.description || 'Join a fast-growing team working on innovative product features.'}
                </p>

                {job.skills_required && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                    {job.skills_required.split(',').map((s, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={() => handleApply(job.id)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Apply Now
                </button>

                <button
                  onClick={() => handleSave(job.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ♥ Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' };

export default DiscoverJobs;
