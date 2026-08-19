import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

export default function Slide1HomeFeed({ jobs, companies, onView }) {
  const displayJobs = jobs || [];
  const displayCompanies = companies || [];

  return (
    <div>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{fontSize:'26px', fontWeight:'700', color:'var(--text-main)'}}>Good Morning, John! 👋</h1>
        <p style={{color:'var(--text-muted)', marginTop:'4px'}}>Find the right opportunity for your career</p>
      </div>

      <div style={{display:'flex', justifyContent:'between', alignItems:'center', marginBottom:'16px'}}>
        <h3 style={{fontSize:'18px', fontWeight:'700'}}>Recommended for You</h3>
        <button onClick={() => onView(7)} style={{background:'none', border:'none', color:'var(--theme-blue)', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>View all <FiArrowRight/></button>
      </div>

      <div className="standard-card-grid">
        {displayJobs.slice(0, 3).map(job => (
          <div key={job.id} className="swipex-premium-card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'240px'}}>
            <div>
              <div style={{display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px'}}>
                <div style={{width:'40px', height:'40px', background:'#F3F6F8', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>{job.company?.logo || '💼'}</div>
                <div>
                  <h4 style={{fontSize:'16px', fontWeight:'700', color:'var(--text-main)'}}>{job.title}</h4>
                  <p style={{fontSize:'13px', color:'var(--text-muted)'}}>{job.company?.name || job.companyName}</p>
                </div>
              </div>
              <p style={{fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>📍 {job.location} &nbsp;•&nbsp; 💰 {job.salary}</p>
              <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'10px'}}>
                {(job.required_skills || job.skills || []).slice(0, 3).map((s, idx) => <span key={idx} className="pill-badge">{s}</span>)}
              </div>
            </div>
            <div style={{display:'flex', justifyContent:'between', alignItems:'center', borderTop:'1px solid #EEE', paddingTop:'12px', marginTop:'12px'}}>
              <span style={{fontSize:'11px', color:'var(--text-muted)'}}>{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently posted'}</span>
              <button className="action-link-btn" style={{padding:'6px 12px', fontSize:'12px'}} onClick={() => onView(8, job.id)}>View Details</button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{fontSize:'18px', fontWeight:'700', marginTop:'40px', marginBottom:'16px'}}>Top Companies Hiring</h3>
      <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
        {displayCompanies.map(comp => (
          <div key={comp.id} className="swipex-premium-card" style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 20px', cursor:'pointer', minWidth:'180px'}} onClick={() => onView(5, comp.id)}>
            <span style={{fontSize:'24px'}}>{comp.logo || '🏢'}</span>
            <div>
              <h5 style={{fontSize:'14px', fontWeight:'700'}}>{comp.name}</h5>
              <p style={{fontSize:'11px', color:'var(--text-muted)'}}>{comp.openingsCount || 0} Openings</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

