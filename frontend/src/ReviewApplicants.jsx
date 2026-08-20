import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ReviewApplicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: State for the success message
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate('/');

      try {
        const response = await axios.get(`http://localhost:8000/jobs/${jobId}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicants(response.data);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
        setError("Could not load applicants for this position.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId, navigate]);

  const handleVerdict = async (applicationId, newVerdict, applicantName) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`http://localhost:8000/applications/${applicationId}/verdict`, 
        { verdict: newVerdict },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.application_id === applicationId ? { ...app, verdict: newVerdict } : app
      ));

      // NEW: Trigger the success message based on the action taken
      if (newVerdict === 'to be reviewed') {
        setSuccessMsg(`Verdict reset for ${applicantName}.`);
      } else {
        setSuccessMsg(`Candidate ${applicantName} successfully ${newVerdict}!`);
      }
      
      // Clear the message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      console.error(`Failed to mark as ${newVerdict}:`, err);
      alert(`Failed to update application verdict.`);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <button 
        // CHANGED: Route to '/' and pass the targetTab state
        onClick={() => navigate('/home', { state: { targetTab: 'postedJobs' } })} 
        style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
      >
        &larr; Back
      </button>
      <h2>Applicant Review Pipeline</h2>

      {/* NEW: Success Message Banner */}
      {successMsg && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {isLoading ? <p style={{ color: '#94a3b8' }}>Loading applicants...</p> : 
       error ? <p style={{ color: '#ef4444' }}>{error}</p> : 
       applicants.length === 0 ? (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', marginTop: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>No applications yet.</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>This is normal if no job seekers have swiped right/applied to this posting yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
         {applicants.map((app, index) => {
            const isDecided = app.verdict === 'accepted' || app.verdict === 'rejected';

            return (
              <div key={index} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', transition: 'border-color 0.3s' }}>
                {/* 1. Header & Verdict */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '20px' }}>{app.applicant_name}</h3>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#cbd5e1' }}>📧<a href={`mailto:${app.applicant_email}`} style={{ color: '#3b82f6' }}>{app.applicant_email}</a></p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#cbd5e1' }}>
    🔗 {(app.portfolio_url && app.portfolio_url.trim() !== '') ? (
      <a href={app.portfolio_url} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>Portfolio Link</a>
    ) : (
      <span style={{color: '#64748b'}}>No portfolio given</span>
    )}
  </p>

  
                  </div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                    {app.verdict === 'accepted' && <span style={{ color: '#10b981', fontWeight: '600', padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>✓ Accepted</span>}
                    {app.verdict === 'rejected' && <span style={{ color: '#ef4444', fontWeight: '600', padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>✕ Rejected</span>}
                    {app.verdict === 'to be reviewed' && <span style={{ color: '#f59e0b', fontWeight: '600', padding: '6px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>⏳ Needs Review</span>}
                    
                    {app.resume_url && (
                      <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                        📄 View Resume
                      </a>
                    )}
                  </div>
                </div>
                
                {/* 2. Rich Profile Data Grid */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                  {/* Left Column: Education */}
                  <div>
                    <h4 style={{color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase'}}>Education History</h4>
                    {app.education && app.education.length > 0 ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        {app.education.map((edu, i) => (
                          <div key={i} style={{backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155'}}>
                            <div style={{fontWeight: '600', color: '#f8fafc', fontSize: '15px'}}>{edu.institution || "Unknown Institution"}</div>
                            <div style={{color: '#cbd5e1', fontSize: '14px', marginTop: '4px'}}>{edu.type} • {edu.group}</div>
                            <div style={{color: '#10b981', fontSize: '13px', fontWeight: '600', marginTop: '4px'}}>Score: {edu.score}</div>
                          </div>
                        ))}
                      </div>
                    ) : <span style={{color: '#64748b', fontSize: '14px'}}>No education history provided.</span>}
                  </div>

                  {/* Right Column: Skills & Achievements */}
                  <div>
                    <h4 style={{color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase'}}>Technical Skills</h4>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px'}}>
                      {app.skills ? app.skills.split(',').map((skill, i) => (
                        <span key={i} style={{backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500'}}>
                          {skill.trim()}
                        </span>
                      )) : <span style={{color: '#64748b', fontSize: '14px'}}>No skills provided.</span>}
                    </div>

                    <h4 style={{color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase'}}>Key Achievements</h4>
                    {app.achievements && app.achievements.length > 0 ? (
                      <ul style={{margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6'}}>
                        {app.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                      </ul>
                    ) : <span style={{color: '#64748b', fontSize: '14px'}}>No achievements listed.</span>}
                  </div>
                </div>
                
                {/* 3. Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                  <button onClick={() => handleVerdict(app.application_id, 'accepted', app.applicant_name)} disabled={isDecided} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: isDecided ? 'not-allowed' : 'pointer', opacity: isDecided ? 0.3 : 1, transition: 'opacity 0.2s', fontWeight: '600' }}>Accept Candidate</button>
                  <button onClick={() => handleVerdict(app.application_id, 'rejected', app.applicant_name)} disabled={isDecided} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: isDecided ? 'not-allowed' : 'pointer', opacity: isDecided ? 0.3 : 1, transition: 'opacity 0.2s', fontWeight: '600' }}>Reject Candidate</button>
                  <button onClick={() => handleVerdict(app.application_id, 'to be reviewed', app.applicant_name)} disabled={!isDecided} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: !isDecided ? '#475569' : '#94a3b8', border: '1px solid', borderColor: !isDecided ? '#334155' : '#64748b', borderRadius: '6px', cursor: !isDecided ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontWeight: '600' }}>Reset Verdict</button>
                </div>
              </div>
            );
          })}
          


        </div>
      )}
    </div>
  );
}