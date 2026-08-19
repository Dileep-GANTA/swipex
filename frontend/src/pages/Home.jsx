import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [profileAvatar, setProfileAvatar] = useState(localStorage.getItem('user_avatar') || null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const [realActivities, setRealActivities] = useState([]);
  const [profileStrength, setProfileStrength] = useState(80);
  const [resumeScore, setResumeScore] = useState(85);
  const [resumeScoreLabel, setResumeScoreLabel] = useState('Excellent');

  const [stats, setStats] = useState({
    jobsViewed: 0,
    swipes: 0,
    savedJobs: 0,
    applications: 0,
    recommendedJobsCount: 0
  });
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchHomeData();
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(buildApiUrl('/api/notifications/unread-count'), { headers }).catch(() => null);
      if (res && res.data && res.data.unread_count !== undefined) {
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const jobsRes = await axios.get(buildApiUrl('/api/jobs'), { headers }).catch(() => ({ data: [] }));
      const allJobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];

      const recRes = await axios.get(buildApiUrl('/api/recommendations'), { headers }).catch(() => ({ data: [] }));
      const recList = Array.isArray(recRes.data) && recRes.data.length > 0 ? recRes.data : allJobs;
      setRecommendedJobs(recList);

      setLatestJobs(allJobs.slice(0, 4));

      // Fetch user's real applications & saved jobs to build dynamic activity feed
      const [appsRes, savedRes, statsRes, profRes, perfRes] = await Promise.all([
        axios.get(buildApiUrl('/api/applications/my-applications'), { headers }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/saved-jobs'), { headers }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/analytics/jobseeker'), { headers }).catch(() => null),
        axios.get(buildApiUrl('/api/profile/jobseeker'), { headers }).catch(() => null),
        axios.get(buildApiUrl('/api/resume/performance'), { headers }).catch(() => null)
      ]);

      const appsList = Array.isArray(appsRes?.data) ? appsRes.data : [];
      const savedList = Array.isArray(savedRes?.data) ? savedRes.data : [];

      // Build real activity timeline from PostgreSQL
      const activities = [];
      appsList.forEach((app) => {
        activities.push({
          id: `app-${app.id}`,
          type: 'applied',
          icon: '✓',
          bg: '#dcfce7',
          color: '#16a34a',
          title: `Applied to ${app.job_title || 'Software Role'}`,
          company: app.company_name || 'SwipeX Partner',
          time: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently',
          timestamp: app.applied_at ? new Date(app.applied_at).getTime() : 0
        });
      });

      savedList.forEach((sj) => {
        activities.push({
          id: `saved-${sj.id}`,
          type: 'saved',
          icon: '💙',
          bg: '#f5f3ff',
          color: '#7c3aed',
          title: `Saved ${sj.title || 'Job Position'}`,
          company: sj.company_name || 'SwipeX Partner',
          time: sj.saved_at ? new Date(sj.saved_at).toLocaleDateString() : 'Recently',
          timestamp: sj.saved_at ? new Date(sj.saved_at).getTime() : 0
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRealActivities(activities);

      // Compute Profile Strength dynamically from PostgreSQL
      if (profRes && profRes.data) {
        const p = profRes.data;
        let pScore = 20;
        if (p.full_name || user?.full_name) pScore += 20;
        if (p.email || user?.email) pScore += 20;
        if (p.skills || user?.skills) pScore += 20;
        if (p.experience || p.education || p.preferred_location) pScore += 20;
        setProfileStrength(Math.min(pScore, 100));
      }

      // Compute Resume Score dynamically from PostgreSQL performance
      if (perfRes && perfRes.data) {
        const score = perfRes.data.avg_job_match_pct || perfRes.data.skill_coverage_pct || 85;
        setResumeScore(score);
        if (score >= 80) setResumeScoreLabel('Excellent');
        else if (score >= 60) setResumeScoreLabel('Good');
        else setResumeScoreLabel('Needs Focus');
      }

      if (statsRes && statsRes.data) {
        setStats({
          jobsViewed: statsRes.data.discovered_today ?? (allJobs.length ? Math.min(allJobs.length, 5) : 0),
          swipes: (statsRes.data.swipe_left_count || 0) + (statsRes.data.swipe_right_count || 0),
          savedJobs: statsRes.data.saved_jobs ?? savedList.length,
          applications: statsRes.data.applications_submitted ?? appsList.length,
          recommendedJobsCount: recList.length
        });
      } else {
        setStats({
          jobsViewed: allJobs.length ? Math.min(allJobs.length, 5) : 0,
          swipes: 0,
          savedJobs: savedList.length,
          applications: appsList.length,
          recommendedJobsCount: recList.length
        });
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setProfileAvatar(base64Image);
        localStorage.setItem('user_avatar', base64Image);
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/applications/apply'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Application submitted successfully!');
      fetchHomeData();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const handleSave = async (jobId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(buildApiUrl('/api/saved/save'), { job_id: jobId }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Job saved to your list!');
      fetchHomeData();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to save job.');
    }
  };

  const filteredRecommended = recommendedJobs.filter(j => 
    !searchQuery || 
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.company_name || j.company?.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.skills_required?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLatest = latestJobs.filter(j => 
    !searchQuery || 
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.company_name || j.company?.name)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userName = user?.full_name || localStorage.getItem('user_name') || 'Hema Perumal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header Bar with Profile Controls & Notifications */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '16px 28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '10px 16px',
          border: '1px solid #e2e8f0',
          flex: '1',
          maxWidth: '520px'
        }}>
          <span style={{ fontSize: '18px', color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search jobs by title, skills, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: '14px', width: '100%', color: '#0f172a' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          )}
        </div>

        {/* Right Top Header Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Notification Bell Icon */}
          <div
            onClick={() => navigate('/jobseeker/notifications')}
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '22px' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{unreadCount}</span>
            )}
          </div>

          {/* Messages Chat Icon */}
          <div
            onClick={() => navigate('/jobseeker/notifications')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#475569' }}
          >
            💬
          </div>

          {/* Profile Section with Photo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile picture"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '2px solid #2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {profileAvatar ? (
                <img src={profileAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '22px' }}>👤</span>
              )}
            </div>

            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/jobseeker/profile')}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {userName} <span style={{ fontSize: '12px', color: '#64748b' }}>∨</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Job Seeker</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Right Sidebar (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px' }}>
        
        {/* Left Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '28px 32px',
            boxShadow: '0 10px 25px rgba(29,78,216,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Welcome back, {userName}! 👋
              </h1>
              <p style={{ color: '#dbeafe', fontSize: '14px', marginTop: '6px', margin: 0 }}>
                Discover personalized AI job matches and track your applications in real-time.
              </p>
            </div>
            <button
              onClick={() => navigate('/jobseeker/discover')}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#1d4ed8',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Discover Jobs →
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            <StatCard title="Jobs Viewed" value={stats.jobsViewed} icon="👀" color="#2563eb" bg="#eff6ff" />
            <StatCard title="Total Swipes" value={stats.swipes} icon="🔥" color="#7c3aed" bg="#f5f3ff" />
            <StatCard title="Saved Jobs" value={stats.savedJobs} icon="💙" color="#059669" bg="#ecfdf5" />
            <StatCard title="Applications" value={stats.applications} icon="📄" color="#d97706" bg="#fffbeb" />
          </div>

          {/* Recommended Jobs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recommended Jobs for You</h2>
              <span onClick={() => navigate('/jobseeker/recommended')} style={{ fontSize: '14px', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}>View All →</span>
            </div>
            
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading job recommendations...</div>
            ) : filteredRecommended.length === 0 ? (
              <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
                No recommended jobs found matching your query.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredRecommended.slice(0, 4).map((job) => (
                  <JobCard key={job.id} job={job} onApply={handleApply} onSave={handleSave} />
                ))}
              </div>
            )}
          </div>

          {/* Latest Jobs */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Latest Job Openings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLatest.map((job) => (
                <div key={job.id} style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>{job.title}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{job.company_name || job.company?.name || 'Tech Company'} • {job.location || 'Remote'}</div>
                    <div style={{ color: '#059669', fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{job.salary || '$80,000 - $120,000'}</div>
                  </div>
                  <button onClick={() => handleApply(job.id)} style={primaryBtnSmall}>Apply</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Real Profile Strength Card */}
          <div style={sidebarCardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1d4ed8', margin: 0 }}>Profile Strength</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <div style={{ position: 'relative', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path stroke="#e2e8f0" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#2563eb" strokeWidth="3.5" strokeDasharray={`${profileStrength}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span style={{ position: 'absolute', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{profileStrength}%</span>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4', fontWeight: 500 }}>
                {profileStrength >= 90 ? 'Your profile is fully complete!' : 'Complete your profile to get better recommendations.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/jobseeker/profile')}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                background: '#ffffff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Complete Profile →
            </button>
          </div>

          {/* Card 2: Real Resume Score Card with "Improve your resume" Modal Trigger */}
          <div style={sidebarCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📄</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Resume Score</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: resumeScore >= 80 ? '#059669' : '#0284c7' }}>{resumeScoreLabel}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{resumeScore}<span style={{ color: '#94a3b8', fontSize: '12px' }}>/100</span></span>
            </div>

            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${resumeScore}%`, height: '100%', background: resumeScore >= 80 ? '#059669' : '#0284c7', borderRadius: '4px' }} />
            </div>

            <button
              onClick={() => setShowResumeModal(true)}
              style={{
                marginTop: '14px',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Improve your resume →
            </button>
          </div>

          {/* Card 3: Recent Activity Card (100% Real PostgreSQL Data) */}
          <div style={sidebarCardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '16px' }}>Recent Activity</h3>

            {realActivities.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 8px', background: '#f8fafc', borderRadius: '12px' }}>
                No recent activity yet. Discover jobs or apply to start building your activity feed!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {realActivities.slice(0, 4).map((act) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                      {act.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, lineHeight: '1.3' }}>
                        {act.title} {act.company ? <span>at <strong>{act.company}</strong></span> : ''}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/jobseeker/applied')}
              style={{
                marginTop: '16px',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              View all activity →
            </button>
          </div>

          {/* Card 4: Job Alerts Toggle Card */}
          <div style={sidebarCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔔</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Job Alerts</h3>
              </div>

              <div
                onClick={() => setJobAlertsEnabled(!jobAlertsEnabled)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: jobAlertsEnabled ? '#2563eb' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  transform: jobAlertsEnabled ? 'translateX(20px)' : 'translateX(0px)',
                  transition: 'transform 0.2s ease'
                }} />
              </div>
            </div>

            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
              Get notified about new jobs that match your preferences.
            </p>

            <button
              onClick={() => alert(`Job alerts are now ${jobAlertsEnabled ? 'enabled' : 'disabled'}.`)}
              style={{
                marginTop: '14px',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Manage Alerts →
            </button>
          </div>

        </div>
      </div>

      {/* Resume Improvement Suggestions Modal */}
      {showResumeModal && (
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
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💡</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Resume Optimization Tips</h3>
              </div>
              <button onClick={() => setShowResumeModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={modalTipStyle}>
                <strong>1. Highlight High-Demand Market Skills:</strong> Add core technical keywords (React, Python, SQL, FastAPI) explicitly in your skills section.
              </div>
              <div style={modalTipStyle}>
                <strong>2. Quantify Achievement Metrics:</strong> Include quantifiable metrics (e.g. "Improved system performance by 35% using React").
              </div>
              <div style={modalTipStyle}>
                <strong>3. Align Job Titles:</strong> Tailor your headline to match target role titles like Senior Software Engineer or Data Engineer.
              </div>
              <div style={modalTipStyle}>
                <strong>4. Use ATS Compatible Formats:</strong> Upload standard PDF or Word doc formats with clear section headers.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={() => { setShowResumeModal(false); navigate('/jobseeker/resume-ats'); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                Run AI ATS Scanner ⚡
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                style={{ padding: '12px 20px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{title}</div>
      </div>
    </div>
  );
}

function JobCard({ job, onApply, onSave }) {
  const companyName = job.company_name || job.company?.name || 'Tech Company';
  const cType = (job.company_type || 'Startup').toLowerCase();
  const isMnc = cType.includes('not a startup') || cType.includes('mnc');

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{job.title}</h3>
          <span style={{ background: isMnc ? '#eff6ff' : '#f5f3ff', color: isMnc ? '#2563eb' : '#7c3aed', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
            {isMnc ? '🏢 Not a Startup' : '🚀 Startup'}
          </span>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>🏢 {companyName} • 📍 {job.location || 'Remote'}</div>
        <div style={{ color: '#059669', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>💰 {job.salary || '$80,000 - $120,000'}</div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={() => onApply(job.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Apply Now</button>
        <button onClick={() => onSave(job.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#2563eb', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>♥</button>
      </div>
    </div>
  );
}

const sidebarCardStyle = { background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' };
const primaryBtnSmall = { padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };
const modalTipStyle = { background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '14px', lineHeight: '1.5' };

export default Home;
