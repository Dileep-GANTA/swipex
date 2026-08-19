import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function RecruiterAddJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    company_name: '',
    company_type: '',
    description: '',
    skills_required: '',
    job_type: 'Full Time',
    salary: '',
    salary_min: '',
    salary_max: '',
    experience_required: '',
    education: "Bachelor's Degree",
    location: '',
    last_date_to_apply: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!form.title.trim() || !form.company_name.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Please fill in all required fields: Job Title, Company Name, Location, and Description.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        ...form,
        recruiter_id: user.id || 1,
        salary_min: form.salary_min ? Number(form.salary_min) : 60000,
        salary_max: form.salary_max ? Number(form.salary_max) : 120000,
        experience_required: form.experience_required ? Number(form.experience_required) : 1,
        salary: form.salary || `$${form.salary_min || '60,000'} - $${form.salary_max || '120,000'}`,
        last_date_to_apply: form.last_date_to_apply || null
      };

      const res = await axios.post(buildApiUrl('/api/jobs'), payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.status === 200 || res.status === 201) {
        setSuccess('Job created successfully! Redirecting to My Jobs...');
        setTimeout(() => {
          navigate('/recruiter/my-jobs');
        }, 1000);
      }
    } catch (err) {
      console.error('Error adding job:', err);
      setError(err?.response?.data?.detail || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Job ➕</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
          Post a new job opening to start matching with candidate resumes on SwipeX.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '14px 18px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#ecfdf5', color: '#059669', padding: '14px 18px', borderRadius: '12px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Job Title *</label>
            <input
              name="title"
              value={form.title}
              placeholder="e.g. Senior Frontend Developer"
              onChange={handleChange}
              autoComplete="off"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Company Name *</label>
            <input
              name="company_name"
              value={form.company_name}
              placeholder="e.g. TechCorp Solutions"
              onChange={handleChange}
              autoComplete="new-password"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Company Classification / Category *</label>
            <select name="company_type" value={form.company_type} onChange={handleChange} style={inputStyle}>
              <option value="">✨ Auto-detect (AI Classifies as 'Not a Startup' for Enterprise MNCs, or 'Startup')</option>
              <option value="Startup">🚀 Startup</option>
              <option value="Not a Startup">🏢 Not a Startup</option>
            </select>
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Select either Startup or Not a Startup. Auto-detect classifies top MNCs (Google, Microsoft, TCS, Infosys, etc.) as 'Not a Startup' and all other companies as 'Startup'.
            </span>
          </div>
          <div>
            <label style={labelStyle}>Location *</label>
            <input
              name="location"
              value={form.location}
              placeholder="e.g. Remote / New York, NY"
              onChange={handleChange}
              autoComplete="off"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Job Type *</label>
            <select name="job_type" value={form.job_type} onChange={handleChange} style={inputStyle}>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Salary Range / Text</label>
            <input
              name="salary"
              value={form.salary}
              placeholder="e.g. $90,000 - $120,000"
              onChange={handleChange}
              autoComplete="off"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Min & Max Salary ($)</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                name="salary_min"
                type="number"
                value={form.salary_min}
                placeholder="Min (e.g. 80000)"
                onChange={handleChange}
                autoComplete="off"
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                name="salary_max"
                type="number"
                value={form.salary_max}
                placeholder="Max (e.g. 110000)"
                onChange={handleChange}
                autoComplete="off"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Experience Required (Years)</label>
            <input
              name="experience_required"
              type="number"
              value={form.experience_required}
              placeholder="e.g. 2"
              onChange={handleChange}
              autoComplete="off"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Education Requirement</label>
            <input
              name="education"
              value={form.education}
              placeholder="e.g. Bachelor's in CS"
              onChange={handleChange}
              autoComplete="off"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Required Skills (Comma separated)</label>
          <input
            name="skills_required"
            value={form.skills_required}
            placeholder="e.g. React, JavaScript, Python, PostgreSQL"
            onChange={handleChange}
            autoComplete="off"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Job Description *</label>
          <textarea
            name="description"
            value={form.description}
            placeholder="Detail the core responsibilities, qualifications, and role summary..."
            onChange={handleChange}
            required
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Last Date to Apply</label>
          <input
            name="last_date_to_apply"
            type="date"
            value={form.last_date_to_apply}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            transition: 'background 0.2s ease'
          }}
        >
          {loading ? 'Posting Job...' : 'Save & Publish Job 🚀'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };

export default RecruiterAddJob;
