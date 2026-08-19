import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Sparkles, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();

    // Set up WebSocket for realtime notification push
    if (token) {
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsHost}/api/notifications/ws?token=${token}`;
      let ws;
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== 'pong') {
              setNotifications(prev => [data, ...prev]);
            }
          } catch (e) {
            console.error('WS message error:', e);
          }
        };
      } catch (e) {
        console.error('WS connection error:', e);
      }
      return () => {
        if (ws) ws.close();
      };
    }
  }, [token, fetchNotifications]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-read/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'match_alert':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'startup_alert':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'application_status':
        return <CheckCheck className="w-4 h-4 text-teal-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-extrabold tracking-wide uppercase">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No new notifications</p>
                <p className="text-[11px] text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !notif.is_read ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 ml-1"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
