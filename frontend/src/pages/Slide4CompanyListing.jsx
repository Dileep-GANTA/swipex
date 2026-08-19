import React from 'react';
import { FiGrid } from 'react-icons/fi';

export default function Slide4CompanyListing({ companies, onView }) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <div>
          <h2 style={{fontSize:'22px', fontWeight:'700'}}>Explore Companies</h2>
          <p style={{color:'var(--text-muted)', fontSize:'14px'}}>Discover outstanding workplaces hiring right now</p>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <input type="text" placeholder="Search companies..." style={{padding:'8px 16px', borderRadius:'6px', border:'1px solid var(--border-color)', width:'260px', outline:'none', fontSize:'14px'}} />
          <button className="action-secondary-btn" style={{padding:'8px'}}><FiGrid size={18}/></button>
        </div>
      </div>

      <div className="standard-card-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))'}}>
        {companies.map(comp => (
          <div key={comp.id} className="swipex-premium-card" style={{textAlign:'center', padding:'28px 20px'}}>
            <div style={{width:'64px', height:'64px', background:'#F3F6F8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 16px auto'}}>{comp.logo || '🏢'}</div>
            <h3 style={{fontSize:'16px', fontWeight:'700'}}>{comp.name}</h3>
            <p style={{fontSize:'13px', color:'var(--text-muted)', margin:'4px 0 16px 0'}}>{comp.location}</p>
            <span className="pill-badge blue" style={{display:'inline-block', marginBottom:'16px'}}>{comp.openingsCount || 0} Open Openings</span>
            <button className="action-secondary-btn" style={{width:'100%', fontSize:'13px'}} onClick={() => onView(5, comp.id)}>View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}


