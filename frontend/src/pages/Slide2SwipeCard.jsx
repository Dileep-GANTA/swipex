import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiInfo, FiHeart } from 'react-icons/fi';
import { getNextIndex, getSwipeAction, normalizeIndex } from './swipeCardLogic';

export default function Slide2SwipeCard({ jobs, onView, jobIndex, onJobIndexChange, onSwipeDecision }) {
  const [index, setIndex] = useState(jobIndex || 0);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [decision, setDecision] = useState(null);

  const safeJobs = useMemo(() => jobs && jobs.length ? jobs : [], [jobs]);
  const activeJob = safeJobs[normalizeIndex(index, safeJobs.length)] || null;

  useEffect(() => {
    const normalized = normalizeIndex(jobIndex ?? 0, safeJobs.length);
    setIndex(normalized);
    setDragX(0);
    setDecision(null);
  }, [jobIndex, safeJobs.length]);

  const changeIndex = (nextIndex) => {
    const normalized = normalizeIndex(nextIndex, safeJobs.length);
    setIndex(normalized);
    if (onJobIndexChange) onJobIndexChange(normalized);
  };

  const advanceQueue = () => {
    setDecision(null);
    setDragX(0);
    changeIndex(getNextIndex(index, safeJobs.length));
  };

  const handleSwipeAction = (action) => {
    if (!activeJob) return;

    if (onSwipeDecision) {
      onSwipeDecision(action, activeJob.id);
    }

    if (action === 'interested') {
      window.alert(`Saved ${activeJob.title} to your saved jobs.`);
    } else if (action === 'skip') {
      window.alert(`Skipped ${activeJob.title}.`);
    }
    advanceQueue();
  };

  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragX(0);
    setDecision(null);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    setDragX(clientX - dragStartX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const action = getSwipeAction(dragX);
    if (action) {
      setDecision(action);
      handleSwipeAction(action);
    } else {
      setDragX(0);
    }
  };

  const handlePointerDown = (event) => {
    handleDragStart(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    handleDragMove(event.clientX);
  };

  if (!activeJob) {
    return <div style={{textAlign:'center', padding:'40px'}}>No jobs available right now.</div>;
  }

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0'}}>
      <div
        className="swipex-premium-card"
        style={{width:'460px', borderRadius:'16px', padding:'32px', boxShadow:'0 12px 36px rgba(0,0,0,0.08)', position:'relative', backgroundColor:'white', transform:`translateX(${dragX}px) rotate(${dragX / 15}deg)`, transition: isDragging ? 'none' : 'transform 0.3s ease', cursor:'grab'}}
        onMouseDown={(event) => handlePointerDown(event)}
        onMouseMove={(event) => handlePointerMove(event)}
        onMouseUp={() => handleDragEnd()}
        onMouseLeave={() => handleDragEnd()}
        onTouchStart={(event) => handlePointerDown(event.touches[0])}
        onTouchMove={(event) => handlePointerMove(event.touches[0])}
        onTouchEnd={() => handleDragEnd()}
      >
        {decision ? <div style={{position:'absolute', top:'16px', right:'16px', fontWeight:'700', color: decision === 'interested' ? '#38A169' : '#E53E3E'}}>{decision === 'interested' ? 'Interested' : 'Skipped'}</div> : null}
        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
          <div style={{width:'54px', height:'54px', background:'#F3F6F8', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px'}}>{activeJob.companyLogo}</div>
          <div>
            <span style={{fontSize:'14px', color:'var(--text-muted)', fontWeight:'500'}}>{activeJob.companyName}</span>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginTop:'2px'}}>{activeJob.title}</h2>
          </div>
        </div>

        <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px'}}>
          <span className="pill-badge blue">{activeJob.salary}</span>
          <span className="pill-badge">{activeJob.experience}</span>
          <span className="pill-badge">{activeJob.jobType}</span>
          <span className="pill-badge">{activeJob.location}</span>
        </div>

        <p style={{fontSize:'14px', color:'#4A5568', lineHeight:'1.6', marginBottom:'24px'}}>{activeJob.description}</p>

        <h5 style={{fontSize:'13px', fontWeight:'700', marginBottom:'10px'}}>Skills Required</h5>
        <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'32px'}}>
          {activeJob.skills.map((s, idx) => <span key={idx} className="pill-badge" style={{background:'#EDF2F7', color:'#2D3748'}}>{s}</span>)}
        </div>

        <div style={{display:'flex', gap:'12px'}}>
          <button className="action-secondary-btn" style={{flex:1}} onClick={() => onView(8, activeJob.id)}>View Details</button>
          <button className="action-link-btn" style={{flex:1}} onClick={() => alert("Redirected to job setup workflow application")}>Apply Now</button>
        </div>
      </div>

      <div style={{display:'flex', gap:'30px', marginTop:'32px', alignItems:'center'}}>
        <div style={{textAlign:'center'}}>
          <button onClick={() => handleSwipeAction('skip')} style={{width:'56px', height:'56px', borderRadius:'50%', background:'white', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#E53E3E', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', cursor:'pointer'}}><FiX size={24}/></button>
          <span style={{fontSize:'12px', color:'var(--text-muted)', display:'block', marginTop:'8px', fontWeight:'500'}}>Skip</span>
        </div>
        <div style={{textAlign:'center'}}>
          <button onClick={() => onView(8, activeJob.id)} style={{width:'46px', height:'46px', borderRadius:'50%', background:'white', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', cursor:'pointer'}}><FiInfo size={18}/></button>
          <span style={{fontSize:'12px', color:'var(--text-muted)', display:'block', marginTop:'8px', fontWeight:'500'}}>Details</span>
        </div>
        <div style={{textAlign:'center'}}>
          <button onClick={() => handleSwipeAction('interested')} style={{width:'56px', height:'56px', borderRadius:'50%', background:'white', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#38A169', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', cursor:'pointer'}}><FiHeart size={24}/></button>
          <span style={{fontSize:'12px', color:'var(--text-muted)', display:'block', marginTop:'8px', fontWeight:'500'}}>Interested</span>
        </div>
      </div>
      <p style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'20px'}}>💡 Swipe Left to Skip • Swipe Right to Interested</p>
    </div>
  );
}

