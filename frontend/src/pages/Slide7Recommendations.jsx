import React from 'react';
import { FiRefreshCw, FiZap } from 'react-icons/fi';

export default function Slide7Recommendations({ jobs, onView }) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <div>
          <h2 style={{fontSize:'22px', fontWeight:'700'}}>Personalized Recommendations</h2>
          <p style={{color:'var(--text-muted)', fontSize:'14px'}}>AI matching systems powered dynamically by your profile skills context</p>
        </div>
        <button className="action-secondary-btn" style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'13px'}} onClick={() => alert("Re-indexing algorithms updates logs.")}><FiRefreshCw/> Refresh</button>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {jobs.map(job => (
          <div key={job.id} className="swipex-premium-card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'4px solid var(--theme-blue)'}}>
            <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
              <span style={{fontSize:'28px'}}>{job.companyLogo}</span>
              <div>
                <span style={{fontSize:'11px', color:'var(--theme-blue)', fontWeight:'700', display:'flex', alignItems:'center', gap:'2px'}}><FiZap/> 98% MATCH STRENGTH</span>
                <h4 style={{fontSize:'16px', fontWeight:'700', marginTop:'2px'}}>{job.title}</h4>
                <p style={{fontSize:'13px', color:'var(--text-muted)'}}>{job.companyName} • {job.location}</p>
                <div style={{display:'flex', gap:'4px', marginTop:'6px'}}>
                  {job.skills.slice(0, 3).map((s, i) => <span key={i} className="pill-badge" style={{fontSize:'10px'}}>{s}</span>)}
                </div>
              </div>
            </div>
            <button className="action-link-btn" onClick={() => onView(8, job.id)}>Quick Apply</button>
          </div>
        ))}
      </div>
    </div>
  );
}

