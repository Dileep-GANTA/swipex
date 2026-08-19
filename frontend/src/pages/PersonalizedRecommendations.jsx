import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

const PersonalizedRecommendations = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'high_match', 'low_comp'
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [highMatchJobs, setHighMatchJobs] = useState([]);
  const [lowCompJobs, setLowCompJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRecommendationData();
  }, []);

  const fetchAllRecommendationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [recRes, hmRes, lcRes] = await Promise.all([
        axios.get(buildApiUrl('/api/recommendations'), { headers }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/recommendations/high-match'), { headers }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/jobs/low-competition'), { headers }).catch(() => ({ data: [] }))
      ]);

      setRecommendedJobs(Array.isArray(recRes.data) ? recRes.data : []);
      setHighMatchJobs(Array.isArray(hmRes.data) ? hmRes.data : []);
      setLowCompJobs(Array.isArray(lcRes.data) ? lcRes.data : []);
    } catch (err) {
      console.error('Error loading recommendation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/applications/apply'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const handleSave = async (jobId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/saved/save'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Job saved to your list!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to save job.');
    }
  };

  let targetList = recommendedJobs;
  if (activeFilter === 'high_match') targetList = highMatchJobs;
  else if (activeFilter === 'low_comp') targetList = lowCompJobs;

  const filteredJobs = targetList.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.company_name && job.company_name.toLowerCase().includes(q)) ||
      (job.skills_required && job.skills_required.toLowerCase().includes(q)) ||
      (job.location && job.location.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '32px 40px',
        boxShadow: '0 10px 25px rgba(29,78,216,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
            Personalized AI Job Recommendations ✨
          </h1>
          <p style={{ color: '#dbeafe', fontSize: '15px', marginTop: '8px', margin: 0, fontWeight: 500 }}>
            Smart matching engine calculating skill overlap, experience, swipe history, high match opportunities (≥85%), and low competition alerts.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', padding: '20px 24px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeFilter === 'all' ? '#2563eb' : '#f1f5f9',
              color: activeFilter === 'all' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            All Recommendations ({recommendedJobs.length})
          </button>

          <button
            onClick={() => setActiveFilter('high_match')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeFilter === 'high_match' ? '#ea580c' : '#fff7ed',
              color: activeFilter === 'high_match' ? '#ffffff' : '#c2410c',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔥 High Match Opportunities (≥85%) ({highMatchJobs.length})
          </button>

          <button
            onClick={() => setActiveFilter('low_comp')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeFilter === 'low_comp' ? '#d97706' : '#fffbeb',
              color: activeFilter === 'low_comp' ? '#ffffff' : '#b45309',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ⭐ Low Competition Jobs ({lowCompJobs.length})
          </button>
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '18px', color: '#64748b' }}>🔍</span>
          <input
            type="text"
            placeholder="Filter jobs by title, company, skills, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0f172a'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Recommended Jobs */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Calculating AI skill match scores from database...</div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No jobs found in this category matching "{searchQuery}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobseeker/job/${job.id}`)}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: job.match_score >= 85 ? '2px solid #fdba74' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                {/* Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{
                    background: job.match_score >= 85 ? '#ffedd5' : '#eff6ff',
                    color: job.match_score >= 85 ? '#c2410c' : '#1d4ed8',
                    border: job.match_score >= 85 ? '1px solid #fed7aa' : '1px solid #bfdbfe',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 800
                  }}>
                    {job.match_score >= 85 ? '🔥' : '✨'} {job.match_score || 85}% AI Match
                  </span>

                  {job.applicant_count !== undefined && (
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      ⭐ {job.applicant_count} Applicant(s) ({job.competition_level} Comp)
                    </span>
                  )}

                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {job.job_type || 'Full Time'}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginTop: '12px', marginBottom: '4px' }}>
                  {job.title}
                </h3>

                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                  🏢 {job.company_name} • 📍 {job.location}
                </div>

                <div style={{ fontSize: '15px', color: '#059669', fontWeight: 800, marginTop: '8px' }}>
                  💰 {job.salary}
                </div>

                {/* Comparative Skill Advantage or Why Recommended Insight */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', marginTop: '12px', fontSize: '12px', color: '#475569', borderLeft: job.match_score >= 85 ? '3px solid #ea580c' : '3px solid #2563eb' }}>
                  💡 <strong>Recommendation Insight:</strong> {job.why_recommended || (job.match_score >= 85 ? 'You have high comparative skill alignment for this role!' : 'Matches your technical profile and skills')}
                </div>

                {/* Skills Pills */}
                {job.skills_required && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                    {job.skills_required.split(',').map((skill, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={(e) => handleApply(job.id, e)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                  Apply Now
                </button>
                <button onClick={(e) => handleSave(job.id, e)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>
                  💙 Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
