import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

function RecruiterMyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  const fetchRecruiterJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(buildApiUrl('/api/recruiter/jobs'), { headers }).catch(() => ({ data: [] }));
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(buildApiUrl(`/api/jobs/${jobId}`), { headers });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      alert('Job deleted successfully.');
    } catch (err) {
      console.error('Error deleting job:', err);
      // Optimistic delete fallback
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  const handleStartEdit = (job) => {
    setEditingJob(job.id);
    setEditForm({
      title: job.title || '',
      company_name: job.company_name || '',
      location: job.location || '',
      salary: job.salary || '',
      job_type: job.job_type || 'Full Time',
      skills_required: job.skills_required || '',
      description: job.description || ''
    });
  };

  const handleSaveEdit = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put(buildApiUrl(`/api/jobs/${jobId}`), editForm, { headers });

      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...res.data } : j)));
      setEditingJob(null);
      alert('Job details updated successfully!');
    } catch (err) {
      console.error('Error updating job:', err);
      setEditingJob(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Posted Jobs 📋</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
            Manage active job listings, edit requirement details, or review candidate applications.
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/add-job')}
          style={{
            padding: '12px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Add New Job
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading your posted jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>No jobs posted yet</h3>
          <p style={{ color: '#64748b', marginTop: '6px' }}>Click "Add New Job" to post your first position on SwipeX.</p>
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
              {editingJob === job.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={editInputStyle}
                  />
                  <input
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    style={editInputStyle}
                  />
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={editInputStyle}
                  />
                  <input
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    style={editInputStyle}
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ ...editInputStyle, minHeight: '70px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleSaveEdit(job.id)} style={saveBtn}>Save</button>
                    <button onClick={() => setEditingJob(null)} style={cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h3>
                    <span style={{ background: job.is_active ? '#ecfdf5' : '#f1f5f9', color: job.is_active ? '#059669' : '#64748b', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      {job.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>
                    🏢 {job.company_name || 'SwipeX Employer'} • 📍 {job.location || 'Remote'}
                  </div>

                  <div style={{ color: '#2563eb', fontSize: '15px', fontWeight: 700, marginTop: '10px' }}>
                    💰 {job.salary || 'Competitive Salary'} • {job.job_type}
                  </div>

                  {job.skills_required && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {job.skills_required.split(',').slice(0, 4).map((skill, idx) => (
                        <span key={idx} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '12px', padding: '3px 8px', borderRadius: '6px' }}>
                          {skill.strip ? skill.strip() : skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.description && (
                    <p style={{ color: '#475569', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>
                      {job.description.length > 120 ? `${job.description.substring(0, 120)}...` : job.description}
                    </p>
                  )}
                </div>
              )}

              {!editingJob && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button onClick={() => handleStartEdit(job)} style={actionBtnStyle}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} style={{ ...actionBtnStyle, background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                    🗑️ Delete
                  </button>
                  <button onClick={() => navigate('/recruiter/applications')} style={{ ...actionBtnStyle, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe', flex: 1 }}>
                    👥 View Applications
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const editInputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const actionBtnStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };
const saveBtn = { padding: '8px 14px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' };
const cancelBtn = { padding: '8px 14px', borderRadius: '8px', background: '#cbd5e1', color: '#334155', border: 'none', fontWeight: 600, cursor: 'pointer' };

export default RecruiterMyJobs;
