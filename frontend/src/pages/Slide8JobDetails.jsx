import React, { useState } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiMapPin, FiBriefcase, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { buildApiUrl, getApiHeaders } from '../config/api';

export default function Slide8JobDetails({ job, onView }) {
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!job) return <p>Select a job role reference frame entry metadata point.</p>;

  const handleApply = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      await axios.post(buildApiUrl('/api/apply/'), { job_id: job.id }, { headers: getApiHeaders(token) });
      setApplied(true);
      alert('Application submitted successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to apply right now.');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      await axios.post(buildApiUrl('/api/save-job/'), { job_id: job.id }, { headers: getApiHeaders(token) });
      setSaved(true);
      alert('Job saved successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save job.');
    }
  };

  return (
    <div>
      <button onClick={() => onView(1)} style={{background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', marginBottom:'20px', fontWeight:'600'}}><FiArrowLeft/> Back to Jobs Feed</button>

      <div style={{display:'flex', gap:'30px', alignItems:'flex-start', flexWrap:'wrap'}}>
        {/* Core Description Main Card Panel */}
        <div className="swipex-premium-card" style={{flex:2, minWidth:'400px'}}>
          <div style={{display:'flex', gap:'16px', alignItems:'center', marginBottom:'20px'}}>
            <span style={{fontSize:'44px', background:'#F3F6F8', padding:'6px', borderRadius:'8px'}}>{job.company?.logo || '💼'}</span>
            <div>
              <h2 style={{fontSize:'24px', fontWeight:'700'}}>{job.title}</h2>
              <p style={{color:'var(--theme-blue)', fontWeight:'600', cursor:'pointer'}} onClick={() => onView(5, job.company?.id || job.companyId)}>{job.company?.name || job.companyName} Verified ✓</p>
            </div>
          </div>

          <div style={{display:'flex', gap:'10px', marginBottom:'24px'}}>
            <button className="action-link-btn" style={{padding:'10px 24px'}} onClick={handleApply}>{applied ? 'Applied' : 'Apply Now'}</button>
            <button className="action-secondary-btn" onClick={handleSave}>{saved ? 'Saved' : 'Save Job'}</button>
          </div>

          <h3 style={{fontSize:'16px', fontWeight:'700', borderBottom:'1px solid #EEE', paddingBottom:'8px', marginBottom:'12px'}}>Job Description</h3>
          <p style={{fontSize:'14px', color:'#4A5568', lineHeight:'1.7', marginBottom:'24px'}}>{job.description}</p>

          <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'12px'}}>Responsibilities</h3>
          <ul style={{fontSize:'14px', color:'#4A5568', paddingLeft:'20px', lineHeight:'1.8'}}>
            <li>Build responsive and scalable web applications</li>
            <li>Work with React, JavaScript, and modern frontend tools</li>
            <li>Collaborate with designers and backend teams to deliver high-quality products</li>
            <li>Optimize applications for maximum speed and scalability</li>
          </ul>
        </div>

        {/* Overview Technical Spec Sidebar Panel */}
        <div className="swipex-premium-card" style={{flex:1, minWidth:'280px', background:'#FAFAFA'}}>
          <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'16px'}}>Job Overview</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
            <div style={{display:'flex', gap:'10px'}}><FiBriefcase color="var(--text-muted)"/> <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Experience</span><strong style={{fontSize:'13px'}}>{job.experience}</strong></div></div>
            <div style={{display:'flex', gap:'10px'}}><FiMapPin color="var(--text-muted)"/> <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Location</span><strong style={{fontSize:'13px'}}>{job.location}</strong></div></div>
            <div style={{display:'flex', gap:'10px'}}><FiDollarSign color="var(--text-muted)"/> <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Salary</span><strong style={{fontSize:'13px'}}>{job.salary}</strong></div></div>
            <div style={{display:'flex', gap:'10px'}}><FiCalendar color="var(--text-muted)"/> <div><span style={{fontSize:'12px', color:'var(--text-muted)', display:'block'}}>Posted Date</span><strong style={{fontSize:'13px'}}>{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently posted'}</strong></div></div>
          </div>

          <h4 style={{fontSize:'13px', fontWeight:'700', marginTop:'24px', marginBottom:'10px'}}>Skills Required</h4>
          <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
            {(job.required_skills || job.skills || []).map((s, i) => <span key={i} className="pill-badge" style={{background:'white', border:'1px solid var(--border-color)'}}>{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

