import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

function SwipeJobs() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeFeedback, setSwipeFeedback] = useState(null);
  const [notification, setNotification] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Drag / Swipe Gesture State
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Clear data when component mounts/user changes
    setJobs([]);
    setCurrentIndex(0);
    setAppliedJobs(new Set());
    setLoading(true);
    
    // Only fetch if user is authenticated
    if (user && token) {
      fetchSwipeRecommendations();
    } else {
      setLoading(false);
    }
  }, [user?.id, token]); // Re-fetch when user or token changes

  const fetchSwipeRecommendations = async () => {
    try {
      setLoading(true);
      const currentToken = token || localStorage.getItem('accessToken');
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};

      let res = await axios.get(buildApiUrl('/api/recommendations'), { headers }).catch(() => null);
      if (!res || !Array.isArray(res.data) || res.data.length === 0) {
        res = await axios.get(buildApiUrl('/api/jobs'), { headers }).catch(() => ({ data: [] }));
      }

      const jobList = Array.isArray(res?.data) ? res.data : [];
      setJobs(jobList);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error loading swipe jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!jobs[currentIndex]) return;
    const currentJob = jobs[currentIndex];

    // Trigger visual overlay feedback
    setSwipeFeedback(direction);
    setTimeout(() => setSwipeFeedback(null), 800);

    try {
      const currentToken = token || localStorage.getItem('accessToken');
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};

      const res = await axios.post(
        buildApiUrl('/api/swipe/'),
        { job_id: Number(currentJob.id), action: direction },
        { headers }
      );

      if (res.status === 200) {
        if (direction === 'right') {
          showToast('Job saved to PostgreSQL SavedJobs successfully! 💙');
        } else {
          showToast('Job skipped and stored in SwipeHistory ✖');
        }
      }
    } catch (err) {
      console.error('Error submitting swipe:', err);
    }

    // Reset card drag position and advance to next card (removing swiped card)
    setDragX(0);
    setIsDragging(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleApply = async (jobId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const currentToken = token || localStorage.getItem('accessToken');
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};

      await axios.post(buildApiUrl('/api/applications'), { job_id: Number(jobId) }, { headers });
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      showToast('Application submitted to PostgreSQL Applications table! 🚀');
    } catch (err) {
      console.error('Error applying for job:', err);
      showToast(err?.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Touch and Mouse Drag Handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragX(0);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    setDragX(clientX - dragStartX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > 90) {
      // Swiped Right -> Save Job to PostgreSQL SavedJobs table
      handleSwipe('right');
    } else if (dragX < -90) {
      // Swiped Left -> Skip Job & add to SwipeHistory
      handleSwipe('left');
    } else {
      // Snap back to center
      setDragX(0);
    }
  };

  const currentJob = jobs[currentIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '80vh',
      gap: '24px',
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Swipe Jobs 🔥</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
          Real-time recruiter positions from PostgreSQL. Drag right to Save, drag left to Pass, or click Apply Now.
        </p>
      </div>

      {notification && (
        <div style={{
          background: '#0f172a',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', color: '#64748b', textAlign: 'center' }}>Loading live PostgreSQL recruiter jobs...</div>
      ) : !currentJob ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '520px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>No jobs available.</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>All available recruiter job cards have been reviewed or swiped.</p>
          <button
            type="button"
            onClick={fetchSwipeRecommendations}
            style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '12px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Refresh Jobs 🔄
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
          {/* Interactive Centered Swipe Card */}
          <div
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            style={{
              position: 'relative',
              width: '100%',
              background: '#fff',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '480px',
              transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              cursor: isDragging ? 'grabbing' : 'grab',
              boxSizing: 'border-box'
            }}
          >
            {/* Overlay Feedback Badges */}
            {(swipeFeedback === 'right' || dragX > 50) && (
              <div style={swipeOverlayRight}>SAVED TO LIST 💙</div>
            )}
            {(swipeFeedback === 'left' || dragX < -50) && (
              <div style={swipeOverlayLeft}>SKIPPED ✖</div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '13px', fontWeight: 700, padding: '6px 12px', borderRadius: '20px' }}>
                    {currentJob.job_type || 'Full Time'}
                  </span>
                  {(currentJob.company_type === 'Startup' || currentJob.company_type === 'startup') && (
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '13px', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>
                      🚀 Startup
                    </span>
                  )}
                </div>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                  Job {currentIndex + 1} of {jobs.length}
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '18px', marginBottom: '4px' }}>
                {currentJob.title}
              </h2>

              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>
                🏢 {currentJob.company_name || currentJob.company?.name || 'Tech Company'} • 📍 {currentJob.location || 'Remote'}
              </div>

              <div style={{ fontSize: '18px', color: '#059669', fontWeight: 800, marginTop: '12px' }}>
                💰 {currentJob.salary || `$${currentJob.salary_min || 80000} - $${currentJob.salary_max || 120000}`}
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: 0 }}>Description</h4>
                <p style={{ color: '#475569', fontSize: '14px', marginTop: '6px', lineHeight: '1.5' }}>
                  {currentJob.description}
                </p>
              </div>

              {currentJob.skills_required && (
                <div style={{ marginTop: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentJob.skills_required.split(',').map((skill, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#334155', fontSize: '13px', padding: '5px 12px', borderRadius: '8px', fontWeight: 500 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Explicit Swipe & Apply Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={(e) => handleSwipe('left', e)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                ✖ Pass
              </button>

              <button
                type="button"
                onClick={(e) => handleApply(currentJob.id, e)}
                disabled={appliedJobs.has(currentJob.id)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid #bfdbfe',
                  background: appliedJobs.has(currentJob.id) ? '#e2e8f0' : '#eff6ff',
                  color: appliedJobs.has(currentJob.id) ? '#64748b' : '#2563eb',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: appliedJobs.has(currentJob.id) ? 'default' : 'pointer'
                }}
              >
                {appliedJobs.has(currentJob.id) ? '✓ Applied' : '⚡ Apply Now'}
              </button>

              <button
                type="button"
                onClick={(e) => handleSwipe('right', e)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid #bbf7d0',
                  background: '#dcfce7',
                  color: '#16a34a',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                💙 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const swipeOverlayRight = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: '#16a34a',
  color: '#fff',
  padding: '8px 20px',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '16px',
  zIndex: 10,
  boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
};

const swipeOverlayLeft = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  background: '#dc2626',
  color: '#fff',
  padding: '8px 20px',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '16px',
  zIndex: 10,
  boxShadow: '0 4px 12px rgba(220,38,38,0.3)'
};

export default SwipeJobs;
