import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(buildApiUrl('/api/notifications'), { headers }).catch(() => null);
      
      if (res && Array.isArray(res.data)) {
        const mapped = res.data.map((n, i) => {
          const typeStr = n.notification_type || n.type || 'info';
          let category = 'System';
          let icon = '🔔';
          let color = '#2563eb';
          let bg = '#eff6ff';

          if (typeStr.includes('job_alert') || n.title?.includes('Job')) {
            category = 'Jobs';
            icon = '💼';
            color = '#2563eb';
            bg = '#eff6ff';
          } else if (typeStr.includes('hiring_alert') || n.title?.includes('Hiring')) {
            category = 'Alerts';
            icon = '🚀';
            color = '#7c3aed';
            bg = '#f5f3ff';
          } else if (typeStr.includes('high_match') || n.title?.includes('High Match')) {
            category = 'Alerts';
            icon = '🔥';
            color = '#ea580c';
            bg = '#fff7ed';
          } else if (typeStr.includes('low_competition') || n.title?.includes('Low Competition')) {
            category = 'Alerts';
            icon = '⭐';
            color = '#d97706';
            bg = '#fffbeb';
          } else if (n.title?.includes('Shortlisted')) {
            category = 'Applications';
            icon = '🎉';
            color = '#059669';
            bg = '#ecfdf5';
          } else if (n.title?.includes('Rejected')) {
            category = 'Applications';
            icon = '⚠️';
            color = '#dc2626';
            bg = '#fef2f2';
          } else if (n.title?.includes('Application')) {
            category = 'Applications';
            icon = '📋';
            color = '#0284c7';
            bg = '#f0f9ff';
          }

          return {
            id: n.id || i + 1,
            title: n.title || 'System Notification',
            message: n.message || 'Activity notification update.',
            category,
            time_ago: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            icon,
            color,
            bg,
            is_read: n.is_read || false,
            related_job_id: n.related_job_id,
            related_application_id: n.related_application_id
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put(buildApiUrl(`/api/notifications/${notif.id}/read`), {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error('Error marking notification read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(buildApiUrl('/api/notifications/mark-all-read'), {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const filtered = notifications.filter((n) => activeTab === 'All' || n.category === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Notifications & Smart Alerts 🔔</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', margin: 0 }}>
            Real-time PostgreSQL notifications for new jobs, hiring alerts, application updates, high-match opportunities, and low-competition jobs.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          ✓ Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        {['All', 'Jobs', 'Alerts', 'Applications', 'System'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Feed */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No notifications found in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              style={{
                background: item.is_read ? '#ffffff' : '#f0f9ff',
                borderRadius: '16px',
                padding: '20px 24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                border: item.is_read ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {item.title} {!item.is_read && <span style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%', display: 'inline-block', marginLeft: '6px' }} />}
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                    {item.message}
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {item.time_ago}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Notification Message Details Modal */}
      {selectedNotification && (
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
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: selectedNotification.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {selectedNotification.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedNotification.title}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {selectedNotification.time_ago} • {selectedNotification.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 800, cursor: 'pointer', color: '#475569' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '15px', lineHeight: '1.6', fontWeight: 500 }}>
              {selectedNotification.message}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => {
                  const targetJobId = selectedNotification.related_job_id;
                  setSelectedNotification(null);
                  if (targetJobId) {
                    navigate(`/jobseeker/job/${targetJobId}`);
                  } else if (selectedNotification.category === 'Applications') {
                    navigate('/jobseeker/applied');
                  } else {
                    navigate('/jobseeker/recommended');
                  }
                }}
                style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
              >
                View Details →
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
