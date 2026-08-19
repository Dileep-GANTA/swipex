import React from 'react';
import { FiEye, FiCheckCircle, FiSend, FiUsers } from 'react-icons/fi';

export default function Slide9DashboardActivity({ jobs, onView }) {
  // Analytical Metrics Setup Data Mock Row Mapping Array
  const stats = [
    { label: 'Jobs Viewed', value: 24, icon: <FiEye size={20} color="#0A66C2"/> },
    { label: 'Jobs Saved', value: 8, icon: <FiCheckCircle size={20} color="#38A169"/> },
    { label: 'Applications Sent', value: 12, icon: <FiSend size={20} color="#D69E2E"/> },
    { label: 'Profile Views', value: 156, icon: <FiUsers size={20} color="#4C51BF"/> }
  ];

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px'}}>
        <div>
          <h2 style={{fontSize:'22px', fontWeight:'700'}}>Welcome back, John! 🚀</h2>
          <p style={{color:'var(--text-muted)', fontSize:'14px'}}>Here is what's happening with your job search.</p>
        </div>
        <button className="action-link-btn" onClick={() => alert("Profile update logic panel workflow")}>Update Profile</button>
      </div>

      {/* Metrics Counter Card Array Grid Layout Wrapper */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'32px'}}>
        {stats.map((st, i) => (
          <div key={i} className="swipex-premium-card" style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{padding:'12px', background:'#F3F6F8', borderRadius:'8px'}}>{st.icon}</div>
            <div>
              <span style={{fontSize:'13px', color:'var(--text-muted)', display:'block'}}>{st.label}</span>
              <strong style={{fontSize:'24px', fontWeight:'800', color:'var(--text-main)'}}>{st.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
        {/* Recent Activity Telemetry Pipeline */}
        <div className="swipex-premium-card" style={{flex:2, minWidth:'360px'}}>
          <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'16px'}}>Recent Activity</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {jobs.map((job, idx) => (
              <div key={job.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: idx !== jobs.length-1 ? '1px solid #F3F6F8' : 'none', paddingBottom:'12px'}}>
                <div>
                  <strong style={{fontSize:'14px', color:'var(--text-main)'}}>Applied for {job.title}</strong>
                  <p style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'2px'}}>{job.companyName}</p>
                </div>
                <span style={{fontSize:'12px', color:'var(--text-muted)'}}>{idx + 1}d ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommendations Mini Box Layout Component */}
        <div className="swipex-premium-card" style={{flex:1, minWidth:'280px'}}>
          <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'16px'}}>Top Recommendations</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
            {jobs.slice(0, 3).map(job => (
              <div key={job.id} style={{display:'flex', gap:'10px', alignItems:'center', cursor:'pointer'}} onClick={() => onView(8, job.id)}>
                <span style={{fontSize:'24px'}}>{job.companyLogo}</span>
                <div>
                  <h4 style={{fontSize:'13px', fontWeight:'700', color:'var(--theme-blue)'}}>{job.title}</h4>
                  <p style={{fontSize:'11px', color:'var(--text-muted)'}}>{job.companyName}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="action-secondary-btn" style={{width:'100%', marginTop:'20px', fontSize:'13px'}} onClick={() => onView(7)}>View All Recommendations</button>
        </div>
      </div>
    </div>
  );
}

