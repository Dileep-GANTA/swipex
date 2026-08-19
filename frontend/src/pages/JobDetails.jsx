import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({
    id: 1,
    title: 'Software Engineer',
    company_name: 'TechNova Solutions',
    location: 'Hyderabad, India',
    salary: '₹8 - 14 LPA',
    job_type: 'Full Time',
    experience_required: '3-5 Years',
    posted_date: 'Posted 2 days ago',
    openings: '10 Openings',
    description: 'We are looking for a skilled Software Engineer to join our dynamic team and build scalable web applications.',
    requirements: [
      'Proficiency in Java, Spring Boot, and REST API',
      'Experience with SQL and database design',
      'Good problem-solving skills'
    ],
    skills_required: 'Java, Spring Boot, REST API, MySQL, HTML, CSS'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(buildApiUrl(`/api/jobs`), { headers }).catch(() => null);
      if (res && Array.isArray(res.data)) {
        const found = res.data.find((j) => String(j.id) === String(id));
        if (found) {
          setJob({
            id: found.id,
            title: found.title,
            company_name: found.company_name || 'TechNova Solutions',
            location: found.location || 'Hyderabad, India',
            salary: found.salary || '₹8 - 14 LPA',
            job_type: found.job_type || 'Full Time',
            experience_required: `${found.experience_required || 3} Years`,
            posted_date: 'Posted 2 days ago',
            openings: '10 Openings',
            description: found.description || 'We are looking for a skilled Software Engineer to join our team.',
            requirements: [
              'Proficiency in core skills and RESTful architecture',
              'Experience with relational databases and query optimization',
              'Strong problem-solving and software engineering fundamentals'
            ],
            skills_required: found.skills_required || 'Java, Spring Boot, REST API, MySQL, HTML, CSS'
          });
        }
      }
    } catch (err) {
      console.error('Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/applications/apply'), { job_id: job.id }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Application submitted successfully!');
      navigate('/jobseeker/applied');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/saved/save'), { job_id: job.id }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Job saved to your list!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to save job.');
    }
  };

  const reqList = Array.isArray(job?.requirements) ? job.requirements : [];
  const skillsList = job?.skills_required ? job.skills_required.split(',') : ['Software Engineering'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back to Jobs
      </button>

      {/* Main Header Card */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800 }}>
              🏢
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {job.title}
                <span style={{
                  background: (job.company_type || '').toLowerCase().includes('mnc') ? '#eff6ff' : (job.company_type || '').toLowerCase().includes('newly') ? '#fffbeb' : '#f5f3ff',
                  color: (job.company_type || '').toLowerCase().includes('mnc') ? '#2563eb' : (job.company_type || '').toLowerCase().includes('newly') ? '#d97706' : '#7c3aed',
                  border: (job.company_type || '').toLowerCase().includes('mnc') ? '1px solid #bfdbfe' : (job.company_type || '').toLowerCase().includes('newly') ? '1px solid #fde68a' : '1px solid #ddd6fe',
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: 800
                }}>
                  {(job.company_type || '').toLowerCase().includes('mnc') ? '🏢 MNC' : (job.company_type || '').toLowerCase().includes('newly') ? '⚡ Newly Founded Startup' : '🚀 Startup'}
                </span>
              </h1>
              <div style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                {job.company_name} • {job.location}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>
            <span>🕒 {job.job_type}</span>
            <span>💼 {job.experience_required}</span>
            <span>📅 {job.posted_date}</span>
            <span>👥 {job.openings}</span>
          </div>
        </div>

        {/* Action Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>
            {job.salary}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleApply} style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              Apply Now
            </button>
            <button onClick={handleSave} style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              Save Job 💙
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Description & Requirements */}
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Job Description</h3>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              {job.description}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Requirements</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>
              {reqList.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Skills */}
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Required Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsList.map((skill, i) => (
              <span key={i} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', fontWeight: 700 }}>
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
