import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RecruiterHome = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.targetTab || 'dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State - Profile
  const [formData, setFormData] = useState({
    full_name: '', email: '', company_name: '', designation: '', company_website: ''
  });

 const [jobFormData, setJobFormData] = useState({
    title: '', company: '', location: '', salary: '', description: '', tags: '',
    openings: 1, contact: '', work_type: 'Full-time', duration: '', work_mode: 'On Location', experience: ''
  });
  
  const [jobSuccessMsg, setJobSuccessMsg] = useState('');
  const [postedJobs, setPostedJobs] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // FIX 1: This is the missing line that caused the crash and warnings
  const [editingJobId, setEditingJobId] = useState(null); 

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeTab === 'profile' && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, activeTab]);

  useEffect(() => {
    if (userProfile) {
      const companyName = userProfile.recruiter_profile?.company_name || '';
      setFormData({
        full_name: userProfile.full_name || '', 
        email: userProfile.email || '',
        company_name: companyName,
        designation: userProfile.recruiter_profile?.designation || '',
        company_website: userProfile.recruiter_profile?.company_website || ''
      });
      setJobFormData(prev => ({ ...prev, company: companyName }));
    }
  }, [userProfile]);

  // FIX 2: Extracted fetch function so we can refresh the list after deleting
  const fetchPostedJobs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/jobs/posted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPostedJobs(response.data);
    } catch (err) {
      console.error("Failed to load posted jobs", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'postedJobs' || activeTab === 'dashboard') {
      fetchPostedJobs();
    }
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    if (activeTab === 'profile' && hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved profile changes. Are you sure you want to leave without saving?");
      if (!confirmLeave) return;
    }
    setHasUnsavedChanges(false);
    setActiveTab(newTab);
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true); 
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  const handleEditClick = (job) => {
    setEditingJobId(job.id);
    setJobFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      description: job.description,
      tags: Array.isArray(job.tags) ? job.tags.join(', ') : job.tags || '',
      openings: job.openings || 1,
      contact: job.contact || '',
      work_type: job.work_type || 'Full-time',
      duration: job.duration || '',
      work_mode: job.work_mode || 'On Location',
      experience: job.experience || ''
    });
    // FIX 3: Switch the tab to the form so the user can actually edit it
    setActiveTab('postJob'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return;
    
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8000/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Job deleted successfully!');
      
      // FIX 4: Refresh the list immediately after deleting
      fetchPostedJobs(); 
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const handleJobFormChange = (e) => setJobFormData({ ...jobFormData, [e.target.name]: e.target.value });

  const submitProfile = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      await axios.post('http://localhost:8000/profile/recruiter', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Profile secured and saved successfully.');
      setHasUnsavedChanges(false);
      setUserProfile(prev => ({
        ...prev, 
        full_name: formData.full_name,
        email: formData.email,
        recruiter_profile: {
          ...prev.recruiter_profile,
          company_name: formData.company_name,
          designation: formData.designation,
          company_website: formData.company_website
        }
      }));
      
      setJobFormData(prev => ({ ...prev, company: formData.company_name }));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const submitJobPosting = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    
    const payload = {
      ...jobFormData,
      tags: typeof jobFormData.tags === 'string' ? jobFormData.tags.split(',').map(t => t.trim()) : jobFormData.tags
    };

    try {
      if (editingJobId) {
        await axios.put(`http://localhost:8000/jobs/${editingJobId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobSuccessMsg('Job updated successfully!');
        setEditingJobId(null); 
      } else {
        await axios.post('http://localhost:8000/jobs', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobSuccessMsg('Job posted successfully!');
      }

      setJobFormData({
        title: '', company: '', location: '', salary: '', description: '', tags: '',
        openings: 1, contact: '', work_type: 'Full-time', duration: '', work_mode: 'On Location', experience: ''
      });
      
      setTimeout(() => setJobSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        .pro-btn-subtle { transition: background-color 0.2s; }
        .pro-btn-subtle:hover { background-color: #334155; }
        .nav-item { transition: background-color 0.2s, color 0.2s; }
        .nav-item:hover { background-color: #1e293b; color: #ffffff; }
        .pro-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
        .saved-card-hover { transition: transform 0.2s, border-color 0.2s; }
        .saved-card-hover:hover { transform: translateY(-2px); border-color: #3b82f6; }
        
        /* Dashboard Animations */
        .stat-card-hover { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .stat-card-hover:hover { transform: translateY(-3px); border-color: #3b82f6; box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.4); }
        .quick-action-hover { transition: transform 0.15s, background-color 0.2s; }
        .quick-action-hover:hover { transform: translateY(-2px); background-color: #334155 !important; }
        .activity-item-hover { transition: background-color 0.2s, transform 0.15s; }
        .activity-item-hover:hover { background-color: #334155 !important; transform: translateX(4px); }
      `}</style>

      <div style={styles.layout}>
        {/* Sidebar */}
       <aside style={{ ...styles.sidebar, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.brand}>SwipeX</h2>
            <button className="pro-btn-subtle" onClick={() => setIsSidebarOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={{...styles.profileCard, border: activeTab === 'profile' ? '1px solid #3b82f6' : '1px solid #334155'}}>
            <div style={styles.avatar}>{userProfile.full_name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <p style={styles.profileName}>{userProfile.full_name}</p>
              <p style={styles.profileRole}>{userProfile.role}</p>
              <button 
                className="pro-btn-subtle"
                onClick={() => handleTabChange('profile')} 
                style={styles.viewProfileBtn}
              >
                View Profile
              </button>
            </div>
          </div>

          <nav style={styles.navMenu}>
            <div onClick={() => handleTabChange('dashboard')} className="nav-item" style={activeTab === 'dashboard' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                <span>Dashboard</span>
              </div>
            </div>
            <div onClick={() => handleTabChange('postJob')} className="nav-item" style={activeTab === 'postJob' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Post an Opportunity</span>
              </div>
            </div>
            <div onClick={() => handleTabChange('postedJobs')} className="nav-item" style={activeTab === 'postedJobs' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>Posted Opportunities</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ ...styles.mainContent, marginLeft: isSidebarOpen ? '260px' : '0' }}>
        <header style={styles.topbar}>
            <div style={styles.topbarLeft}>
              {!isSidebarOpen && (
                <button 
                  className="pro-btn-subtle" 
                  onClick={() => setIsSidebarOpen(true)} 
                  style={{...styles.menuBtn, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              )}
              <h3 style={styles.pageTitle}>
                {activeTab === 'dashboard' ? 'Overview' : 
                 activeTab === 'feed' ? 'Discovery Feed' : 
                 activeTab === 'postJob' ? 'New Opportunity' :
                 activeTab === 'postedJobs' ? 'Posted Opportunities' :
                 activeTab === 'saved' ? 'My Pipeline' : 'Profile Settings'}
              </h3>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
          </header>

          <div style={styles.contentArea}>
            
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (() => {
              const totalApplicants = postedJobs.reduce((acc, job) => acc + (job.application_count || 0), 0);
              const totalHired = postedJobs.reduce((acc, job) => acc + (job.accepted_count || 0), 0);
              
              return (
                <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div>
                    <h1 style={styles.welcomeHeading}>Welcome back, {userProfile.full_name ? userProfile.full_name.split(' ')[0] : 'User'}!</h1>
                    <p style={styles.welcomeText}>Here's a metrics overview of your active listings and candidates.</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div style={styles.statsGrid}>
                    <div onClick={() => handleTabChange('postedJobs')} className="stat-card-hover" style={styles.statCard}>
                      <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                      </div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statValue}>{postedJobs.length}</h3>
                        <p style={styles.statLabel}>Active Listings</p>
                      </div>
                    </div>
                    
                    <div onClick={() => handleTabChange('postedJobs')} className="stat-card-hover" style={styles.statCard}>
                      <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statValue}>{totalApplicants}</h3>
                        <p style={styles.statLabel}>Total Applicants</p>
                      </div>
                    </div>

                    <div onClick={() => handleTabChange('postedJobs')} className="stat-card-hover" style={styles.statCard}>
                      <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                      </div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statValue}>{totalHired}</h3>
                        <p style={styles.statLabel}>Hires Made</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 style={styles.sectionTitle}>Quick Actions</h3>
                    <div style={styles.quickActionsGrid}>
                      <button onClick={() => handleTabChange('postJob')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Post a New Opportunity
                      </button>
                      <button onClick={() => handleTabChange('postedJobs')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        Manage Active Listings
                      </button>
                      <button onClick={() => handleTabChange('profile')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Configure Company Details
                      </button>
                    </div>
                  </div>

                  {/* Recent Opportunities */}
                  <div>
                    <h3 style={styles.sectionTitle}>Recent Opportunities</h3>
                    <div style={styles.recentActivityList}>
                      {postedJobs.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, padding: '16px', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '8px' }}>No opportunities posted yet.</p>
                      ) : (
                        postedJobs.slice(0, 3).map(job => (
                          <div key={job.id} onClick={() => handleTabChange('postedJobs')} className="activity-item-hover" style={styles.recentActivityItem}>
                            <div style={{ ...styles.activityDot, backgroundColor: '#10b981' }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, color: '#f8fafc', fontSize: '14px', fontWeight: '500' }}>{job.title}</p>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{job.location} • {job.salary || 'Salary not specified'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px' }}>
                                {job.application_count || 0} applicant{job.application_count !== 1 ? 's' : ''}
                              </span>
                              <span style={{ color: '#3b82f6', fontSize: '12px' }}>Review ➔</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
{/* Post a Job View */}
          {activeTab === 'postJob' && (
            <div style={styles.formContainer}>
              <h2 style={styles.formHeading}>{editingJobId ? 'Edit Opportunity' : 'Draft a New Role'}</h2>
              <p style={styles.formSubText}>Post an opportunity to the SwipeX feed to start sourcing candidates immediately.</p>
              {jobSuccessMsg && <div style={styles.successMessage}>{jobSuccessMsg}</div>}
              
              <form onSubmit={submitJobPosting} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Role Highlights */}
                <div style={styles.sectionHeader}>Role Highlights</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.inputGroup, flex: 2 }}>
                    <label style={styles.label}>Job Title *</label>
                    <input className="pro-input" type="text" name="title" placeholder="e.g., Backend Engineer" value={jobFormData.title} onChange={handleJobFormChange} style={styles.input} required />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>No. of Openings</label>
                    <input className="pro-input" type="number" min="1" name="openings" value={jobFormData.openings} onChange={handleJobFormChange} style={styles.input} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Company *</label>
                    <input className="pro-input" type="text" name="company" value={jobFormData.company} onChange={handleJobFormChange} style={styles.input} required />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Location / City *</label>
                    <input className="pro-input" type="text" name="location" value={jobFormData.location} onChange={handleJobFormChange} style={styles.input} required />
                  </div>
                </div>

                {/* Work Arrangements */}
                <div style={styles.sectionHeader}>Work Arrangements</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Work Mode</label>
                    <select className="pro-input" name="work_mode" value={jobFormData.work_mode} onChange={handleJobFormChange} style={styles.input}>
                      <option value="On Location">On Location</option>
                      <option value="Work From Home">Work From Home (WFH)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Work Type</label>
                    <select className="pro-input" name="work_type" value={jobFormData.work_type} onChange={handleJobFormChange} style={styles.input}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                {jobFormData.work_type === 'Internship' && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Internship Duration *</label>
                    <input className="pro-input" type="text" name="duration" placeholder="e.g., 6 Months, 1 Year" value={jobFormData.duration} onChange={handleJobFormChange} style={styles.input} required={jobFormData.work_type === 'Internship'} />
                  </div>
                )}

                {/* Requirements & Compensation */}
                <div style={styles.sectionHeader}>Requirements & Compensation</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Required Experience</label>
                    <input className="pro-input" type="text" name="experience" placeholder="e.g., 0-2 Years, Fresher" value={jobFormData.experience} onChange={handleJobFormChange} style={styles.input} />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Salary / Compensation</label>
                    <input className="pro-input" type="text" name="salary" placeholder="e.g., $120k - $140k" value={jobFormData.salary} onChange={handleJobFormChange} style={styles.input} />
                  </div>
                </div>

                {/* Details */}
                <div style={styles.sectionHeader}>Details</div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Job Description *</label>
                  <textarea className="pro-input" name="description" placeholder="Describe the responsibilities..." value={jobFormData.description} onChange={handleJobFormChange} style={styles.textarea} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tech Stack & Skills Tags (comma separated)</label>
                  <input className="pro-input" type="text" name="tags" placeholder="e.g., FastAPI, PostgreSQL, React" value={jobFormData.tags} onChange={handleJobFormChange} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>HR / Recruiter Contact (Email or LinkedIn)</label>
                  <input className="pro-input" type="text" name="contact" placeholder="Where can candidates reach you?" value={jobFormData.contact} onChange={handleJobFormChange} style={styles.input} />
                </div>
                
                {/* Dynamic Submit / Cancel Buttons */}
                <button type="submit" style={styles.primaryButton}>
                  {editingJobId ? 'Update Opportunity' : 'Publish Opportunity to Feed'}
                </button>
                
                {editingJobId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingJobId(null); 
                      setJobFormData({ title: '', company: '', location: '', salary: '', description: '', tags: '', openings: 1, contact: '', work_type: 'Full-time', duration: '', work_mode: 'On Location', experience: '' });
                    }} 
                    style={{...styles.secondaryButton, marginTop: '10px'}}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          )}
          
          
          
            {/* Posted Jobs View */}
            {activeTab === 'postedJobs' && (
              <div style={styles.savedContainer}>
                <h2 style={styles.formHeading}>Your Posted Opportunities</h2>
                <p style={styles.formSubText}>Manage your active job listings and review incoming applications.</p>
                {successMsg && <div style={styles.successMessage}>{successMsg}</div>}
                
                <div style={styles.savedGrid}>
                  {postedJobs.length === 0 ? (
                    <div style={styles.emptyState}>
                      <h3>No opportunities posted yet.</h3>
                      <p>Use the "Post an Opportunity" tab to create your first listing.</p>
                    </div>
                  ) : (
                    postedJobs.map((job) => (
                      <div key={job.id} className="saved-card-hover" style={styles.savedCard}>
                        <div style={styles.savedCardTop}>
                          <div>
                            <h3 style={styles.savedJobTitle}>{job.title}</h3>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                              {job.location && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                  {job.location}
                                </span>
                              )}
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                {job.openings || 1} opening{job.openings !== 1 ? 's' : ''}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                              <button 
                                onClick={() => handleEditClick(job)}
                                style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteClick(job.id)}
                                style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Delete
                              </button>
                            </div>
                          </div>
                          <span style={styles.savedBadge}>Active</span>
                        </div>
                        <div style={styles.savedCardBottom}>
                          <span style={styles.savedJobSalary}>{job.salary || 'Salary not specified'}</span>
                          <div style={{display: 'flex', gap: '12px'}}>
                            <button onClick={() => navigate(`/jobs/${job.id}/applicants`)} className="pro-btn-subtle" style={{...styles.viewDetailsBtn, backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: '600'}}>
                              Review Applicants
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile Settings View */}
            {activeTab === 'profile' && (
              <div style={styles.formContainer}>
                <h2 style={styles.formHeading}>Complete Your Profile</h2>
                <p style={styles.formSubText}>Update your account details and professional information.</p>
                {successMsg && <div style={styles.successMessage}>{successMsg}</div>}
                <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={styles.sectionHeader}>Account Information</div>
                  <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input className="pro-input" type="text" name="full_name" value={formData.full_name} onChange={handleProfileChange} style={styles.input} required /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Email Address</label><input className="pro-input" type="email" name="email" value={formData.email} onChange={handleProfileChange} style={styles.input} required /></div>
                  
                  <div style={styles.sectionHeader}>Company Information</div>
                  <div style={styles.inputGroup}><label style={styles.label}>Company Name</label><input className="pro-input" type="text" name="company_name" value={formData.company_name} onChange={handleProfileChange} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Your Designation</label><input className="pro-input" type="text" name="designation" value={formData.designation} onChange={handleProfileChange} style={styles.input} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Company Website</label><input className="pro-input" type="url" name="company_website" value={formData.company_website} onChange={handleProfileChange} style={styles.input} /></div>
                  
                  <button type="submit" style={styles.primaryButton}>Save Profile Configurations</button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

const styles = {
  viewProfileBtn: { marginTop: '10px', padding: '6px 0', width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' },
  sidebar: { position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px', backgroundColor: '#0b1120', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease-in-out', zIndex: 100 },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { margin: 0, fontSize: '24px', color: '#ffffff', fontWeight: '700', letterSpacing: '-0.5px' },
  closeBtn: { backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' },
  profileCard: { margin: '20px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '16px' },
  profileName: { margin: 0, fontWeight: '500', fontSize: '14px', color: '#f8fafc' },
  profileRole: { margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' },
  navMenu: { padding: '0 12px', flex: 1 },
  navItem: { padding: '10px 16px', margin: '4px 0', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navItemActive: { backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', fontWeight: '600' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', transition: 'margin-left 0.3s ease-in-out' },
  topbar: { height: '64px', backgroundColor: '#0b1120', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  menuBtn: { backgroundColor: 'transparent', border: '1px solid #334155', color: '#cbd5e1', fontSize: '16px', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' },
  pageTitle: { margin: 0, fontSize: '16px', fontWeight: '500', color: '#f8fafc' },
  logoutButton: { padding: '8px 16px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  contentArea: { padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  welcomeHeading: { margin: '0 0 8px 0', fontSize: '28px', color: '#ffffff', fontWeight: '600', width: '100%', maxWidth: '800px' },
  welcomeText: { margin: '0 0 32px 0', fontSize: '15px', color: '#94a3b8', width: '100%', maxWidth: '800px' },
  formContainer: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '600px' },
  formHeading: { margin: '0 0 8px 0', fontSize: '20px', color: '#ffffff', fontWeight: '600' },
  formSubText: { margin: '0 0 24px 0', fontSize: '14px', color: '#94a3b8' },
  sectionHeader: { fontSize: '14px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#cbd5e1' },
  input: { padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#f8fafc', outline: 'none' },
  textarea: { padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#f8fafc', outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' },
  primaryButton: { padding: '12px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  secondaryButton: { padding: '12px 16px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px', width: '100%' },
  successMessage: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' },
  savedContainer: { width: '100%', maxWidth: '800px' },
  savedGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  savedCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  savedCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  savedJobTitle: { margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: '600' },
  savedJobCompany: { margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' },
  savedBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' },
  savedCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '16px' },
  savedJobSalary: { color: '#cbd5e1', fontSize: '14px', fontWeight: '500' },
  viewDetailsBtn: { padding: '8px 16px', backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  emptyState: { textAlign: 'center', color: '#94a3b8', padding: '40px' },

  // Redesigned Dashboard Styles
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', width: '100%', maxWidth: '800px' },
  statCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  statIconContainer: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#ffffff' },
  statLabel: { margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '500' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '18px', color: '#ffffff', fontWeight: '600', width: '100%', maxWidth: '800px' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%', maxWidth: '800px' },
  quickActionBtn: { padding: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' },
  recentActivityList: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '800px' },
  recentActivityItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer' },
  activityDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }
};

export default RecruiterHome;