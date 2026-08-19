import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function Slide5CompanyProfile({ company, jobs, onView }) {
  if (!company) return <p>No company context selected.</p>;
  const companyJobs = jobs.filter((job) => job.company?.id === company.id || job.company_id === company.id || job.companyId === company.id);

  return (
    <div>
      <button onClick={() => onView(4)} style={{background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', marginBottom:'20px', fontWeight:'600'}}><FiArrowLeft/> Back to Listings</button>
      
      <div className="swipex-premium-card" style={{padding:'32px', marginBottom:'30px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px'}}>
          <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <span style={{fontSize:'54px', background:'#F3F6F8', padding:'10px', borderRadius:'12px'}}>{company.logo}</span>
            <div>
              <h1 style={{fontSize:'26px', fontWeight:'700'}}>{company.name} Verified ✓</h1>
              <p style={{color:'var(--text-muted)', fontSize:'14px', marginTop:'4px'}}>{company.location} &nbsp;•&nbsp; <a href={company.website || '#'} style={{color:'var(--theme-blue)', textDecoration:'none'}}>{company.website || `${company.name.toLowerCase().replace(/\s+/g, '')}.com`}</a></p>
            </div>
          </div>
          <button className="action-link-btn" style={{padding:'10px 24px'}}>Follow</button>
        </div>

        <div style={{borderTop:'1px solid #EEE', marginTop:'24px', paddingTop:'24px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'20px'}}>
          <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Industry</span><strong style={{fontSize:'14px'}}>{company.industry}</strong></div>
          <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Company Size</span><strong style={{fontSize:'14px'}}>{company.employees || company.size}</strong></div>
          <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Founded</span><strong style={{fontSize:'14px'}}>{company.founded}</strong></div>
        </div>

        <h3 style={{fontSize:'16px', fontWeight:'700', marginTop:'28px', marginBottom:'10px'}}>About Us</h3>
        <p style={{fontSize:'14px', color:'#4A5568', lineHeight:'1.6'}}>{company.description}</p>
      </div>

      <h3 style={{fontSize:'18px', fontWeight:'700', marginBottom:'16px'}}>Open Positions ({companyJobs.length})</h3>
      <div className="standard-card-grid">
        {companyJobs.map(job => (
          <div key={job.id} className="swipex-premium-card" style={{cursor:'pointer'}} onClick={() => onView(8, job.id)}>
            <h4 style={{fontSize:'15px', fontWeight:'700', color:'var(--theme-blue)'}}>{job.title}</h4>
            <p style={{fontSize:'12px', color:'var(--text-muted)', margin:'4px 0'}}>{job.location} • {job.salary}</p>
            <span style={{fontSize:'11px', color:'var(--text-muted)'}}>{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently posted'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

