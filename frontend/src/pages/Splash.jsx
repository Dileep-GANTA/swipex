import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    // 10 Second Splash Screen Timer before transitioning to Welcome page
    const timer = setTimeout(() => {
      sessionStorage.setItem('splash_shown', 'true');
      navigate('/welcome');
    }, 10000);

    // 1-second countdown tick
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1d4ed8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* SwipeX Premium Logo Box */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          fontWeight: 900,
          boxShadow: '0 12px 36px rgba(37, 99, 235, 0.45)'
        }}>
          S
        </div>

        {/* SwipeX Title & Tagline */}
        <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Swipe<span style={{ color: '#60a5fa' }}>X</span>
          <span style={{ fontSize: '36px', color: '#facc15' }}>★</span>
        </div>

        <p style={{ fontSize: '20px', color: '#94a3b8', margin: 0, fontWeight: 500, letterSpacing: '0.5px' }}>
          Swipe-Based Intelligent Job Discovery & Career Assistance Platform
        </p>

        {/* 10-Second Progress Bar Container */}
        <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '320px' }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
              borderRadius: '4px',
              animation: 'splashProgress 10s linear forwards'
            }} />
          </div>

          <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 700 }}>
            Launching SwipeX in {secondsLeft}s...
          </span>
        </div>
      </div>

      <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Splash;