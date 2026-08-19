import React from 'react';
import { FiBookmark, FiTrash2 } from 'react-icons/fi';

export default function Slide6SavedJobs({ jobs, onView }) {
  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'22px', fontWeight:'700'}}>Saved Jobs ({jobs.length})</h2>
        <p style={{color:'var(--text-muted)', fontSize:'14px'}}>Track roles you have saved or short-listed for applications</p>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {jobs.map(job => (
          <div key={job.id} className="swipex-premium-card" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px'}}>
            <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
              <span style={{fontSize:'28px', padding:'6px', background:'#F3F6F8', borderRadius:'6px'}}>{job.companyLogo}</span>
              <div>
                <h4 style={{fontSize:'16px', fontWeight:'700', color:'var(--text-main)', cursor:'pointer'}} onClick={() => onView(8, job.id)}>{job.title}</h4>
                <p style={{fontSize:'13px', color:'var(--text-muted)', marginTop:'2px'}}>{job.companyName} • {job.location} • <strong style={{color:'#2D3748'}}>{job.salary}</strong></p>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px'}}>
              <button className="action-secondary-btn" style={{color:'#E53E3E', border:'1px solid #FED7D7'}} onClick={() => alert("Removed item reference index sync")}><FiTrash2/></button>
              <button className="action-link-btn" onClick={() => onView(8, job.id)}>Apply Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}