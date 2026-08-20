import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';




  const JobSeekerHome = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [errorMessage, setErrorMessage] = useState(null);
  // Form State
  const [formData, setFormData] = useState({
    full_name: '', email: '', education: '', skills: '', portfolio_url: ''
  });

  
  const [educationList, setEducationList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [profileResumeFile, setProfileResumeFile] = useState(null);
  // Feed & Pipeline State
  const [jobs, setJobs] = useState([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [savedList, setSavedList] = useState([]);
  const [appliedList, setAppliedList] = useState([]);
  const [pipelineSubTab, setPipelineSubTab] = useState('applied');
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSalary, setFilterSalary] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  // Gesture State
  const [dragStartX, setDragStartX] = useState(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  


  
  
  const [existingResumePath, setExistingResumePath] = useState(null); // <-- Add this here

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);


  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:8000/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:8000/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:8000/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleViewJobDetails = async (jobId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedJob(response.data);
      setIsJobModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch job details", err);
      showToast("Job details could not be loaded. It may have been deleted by the recruiter.", "error");
    }
  };



  // ATS Checker State
  // ATS Checker State (UPDATED FOR PDF)
  
  const [atsJd, setAtsJd] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [isAtsLoading, setIsAtsLoading] = useState(false);

 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [useProfileResume, setUseProfileResume] = useState(true);
const [resumeFile, setResumeFile] = useState(null);


const handleAtsCheck = async (e) => {
    // 1. This completely stops the page from reloading!
    e.preventDefault(); 
    
    setIsAtsLoading(true);
    
    try {
        const token = sessionStorage.getItem("token");
        const formData = new FormData();
        
        // 2. We use your textarea state variable here instead of currentJob
        formData.append("job_description", atsJd);
        
        // If they toggled off the default profile resume, attach the new file
        if (!useProfileResume) {
            if (!resumeFile) {
                showToast("Please select a resume file to upload for this check.", "error");
                setIsAtsLoading(false);
                return;
            }
            formData.append("resume_pdf", resumeFile);
        }

        const response = await axios.post("http://localhost:8000/jobs/ats-score", formData, {
            headers: { Authorization: `Bearer ${token}` } 
        });

        setAtsResult(response.data);
        
    } catch (error) {
        console.error("ATS Check failed", error);
        showToast(error.response?.data?.detail || "Failed to run ATS check.", "error");
    } finally {
        setIsAtsLoading(false);
    }
};




 useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '', 
        email: userProfile.email || '',
        skills: userProfile.job_seeker_profile?.skills || '',
        portfolio_url: userProfile.job_seeker_profile?.portfolio_url || ''
      });
      // Load dynamic arrays
      setEducationList(userProfile.job_seeker_profile?.education || []);
      setAchievementsList(userProfile.job_seeker_profile?.achievements || []);
      
      // NEW: Capture the existing resume path
      setExistingResumePath(userProfile.job_seeker_profile?.resume_path || null);
    }
  }, [userProfile]);


  // NEW: Warn user if they try to close or refresh the browser window
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeTab === 'profile' && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, activeTab]);


// NEW: Intercept tab changes to warn about unsaved data
  const handleTabChange = (newTab) => {
    if (activeTab === 'profile' && hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved profile changes. Are you sure you want to leave without saving?");
      if (!confirmLeave) return; // Stop navigation if they click Cancel
    }
    setHasUnsavedChanges(false); // Reset the flag
    setActiveTab(newTab);
  };
  
  // 3. ADD HELPER FUNCTIONS FOR DYNAMIC ARRAYS
  const addEducation = () => setEducationList([...educationList, { type: 'UG', institution: '', group: '', score: '' }]);
  const updateEducation = (index, field, value) => {
    const newList = [...educationList];
    newList[index][field] = value;
    setEducationList(newList);
  };
  const removeEducation = (index) => setEducationList(educationList.filter((_, i) => i !== index));

  const addAchievement = () => setAchievementsList([...achievementsList, '']);
  const updateAchievement = (index, value) => {
    const newList = [...achievementsList];
    newList[index] = value;
    setAchievementsList(newList);
  };
  const removeAchievement = (index) => setAchievementsList(achievementsList.filter((_, i) => i !== index));


  // Fetch Jobs Feed
  // 1. Create a standalone function to fetch and reset the feed
 // 1. Create a standalone function to fetch and reset the feed
  // 1. Updated fetch function handling search and filters
  const fetchFeed = async (isReset = false) => {
    setIsFeedLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const activeSearch = isReset ? '' : searchQuery;
      const activeLoc = isReset ? '' : filterLocation;
      const activeComp = isReset ? '' : filterCompany;
      const activeSal = isReset ? '' : filterSalary;
      const activeSkill = isReset ? '' : filterSkill;
      
      // 1. Swap the base URL if they clicked the matches tab
      const baseUrl = activeTab === 'matches' 
        ? 'http://localhost:8000/jobs/matched' 
        : 'http://localhost:8000/jobs/feed';

      let url = `${baseUrl}?t=${Date.now()}`;
      
      // (Your existing filters will still work on the matched jobs too!)
      if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;
      if (activeLoc) url += `&location=${encodeURIComponent(activeLoc)}`;
      if (activeComp) url += `&company=${encodeURIComponent(activeComp)}`;
      if (activeSal) url += `&salary=${encodeURIComponent(activeSal)}`;
      if (activeSkill) url += `&skill=${encodeURIComponent(activeSkill)}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setJobs(response.data);      
      setCurrentJobIndex(0);       
      setSwipeDirection(null);     
      setDragOffsetX(0);
      
    } catch (err) {
      console.error("Failed to load jobs", err);
      
      // 2. Catch the specific error if they have no resume saved in their profile
      if (activeTab === 'matches' && err.response?.status === 400) {
        showToast(err.response.data.detail || "Please upload a resume in your profile first to see matches!", 'error');
        setActiveTab('profile'); // Send them straight to the profile tab
      }
    } finally {
      setIsFeedLoading(false);
    }
  };



 useEffect(() => {
  if (activeTab === 'feed' || activeTab === 'matches') {
    fetchFeed();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);


  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterLocation('');
    setFilterCompany('');
    setFilterSalary('');
    setFilterSkill('');
    fetchFeed(true); 
  };
  
  
  
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

 const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

 const submitProfile = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      // A. Save JSON Data
      const payload = { ...formData, education: educationList, achievements: achievementsList };
      await axios.post('http://localhost:8000/profile/job-seeker', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // B. Save PDF Resume if attached
      if (profileResumeFile) {
        const fileData = new FormData();
        fileData.append('resume_pdf', profileResumeFile);
        await axios.post('http://localhost:8000/profile/job-seeker/resume', fileData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccessMsg('Profile and resume saved successfully.');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update profile.");
    }
  };




  // Add shouldAdvance = true as the second parameter
const handleAction = async (actionType, shouldAdvance = true) => {
    const currentJob = jobs[currentJobIndex];
    if (!currentJob) return;

    if (swipeDirection !== null) return;

    try {
      const token = sessionStorage.getItem('token');
      
      // 1. ADD .then() TO TRIGGER SUCCESS MESSAGES
      axios.post('http://localhost:8000/jobs/swipe', 
        { job_id: currentJob.id, action: actionType },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(() => {
          // Trigger the specific message based on what the user clicked/swiped
          if (actionType === 'right') {
              setSuccessMsg(`Successfully applied to ${currentJob.company}!`);
          } else if (actionType === 'save') {
              setSuccessMsg(`Saved ${currentJob.title} to your pipeline.`);
          }
          
          // Clear the message after 2.5 seconds
          setTimeout(() => setSuccessMsg(''), 2500);
      }).catch(err => console.error("API error:", err));

      // 1. Update the Pipeline Tabs
      if (actionType === 'right') {
        setAppliedList(prev => !prev.find(j => j.id === currentJob.id) ? [...prev, { ...currentJob, status: 'applied' }] : prev);
      } else if (actionType === 'save') {
        setSavedList(prev => !prev.find(j => j.id === currentJob.id) ? [...prev, { ...currentJob, status: 'saved' }] : prev);
      }

      // 2. Update the CURRENT job's status
      setJobs(prevJobs => {
        const updatedJobs = [...prevJobs];
        let currentStatus = updatedJobs[currentJobIndex].status || '';

        if (actionType === 'right') currentStatus = currentStatus.includes('saved') ? 'applied_and_saved' : 'applied';
        else if (actionType === 'save') currentStatus = currentStatus.includes('applied') ? 'applied_and_saved' : 'saved';
        else if (actionType === 'left') currentStatus = 'skipped';

        updatedJobs[currentJobIndex] = { ...updatedJobs[currentJobIndex], status: currentStatus };
        return updatedJobs;
      });

      // 3. FIX 2: Animate first, then advance and wipe the state clean
      if (shouldAdvance) {
        // A. Trigger the CSS 3D throw animation
        setSwipeDirection(actionType);
        
        // B. Wait exactly 400ms for the animation to finish
        setTimeout(() => {
          setCurrentJobIndex(prevIndex => prevIndex + 1);
          
          // C. CRITICAL: Scrub all gesture state back to zero so the next card starts completely fresh
          setSwipeDirection(null);
          setDragOffsetX(0);
          setIsDragging(false);
          setDragStartX(null);
        }, 400); 
      }

    } catch (err) {
      console.error("Failed to record action", err);
    }
  };




  const handleDragStart = (e) => {
    if (swipeDirection !== null) return; 
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging || dragStartX === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - dragStartX;
    setDragOffsetX(offsetX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const SWIPE_THRESHOLD = 100;
    
    if (dragOffsetX > SWIPE_THRESHOLD) {
      handleAction('right'); 
    } else if (dragOffsetX < -SWIPE_THRESHOLD) {
      handleAction('left');  
    } else {
      // If they didn't drag far enough, snap the card back to the center
      setDragOffsetX(0);
    }
    
    setDragStartX(null);
  };
  


  
const handleApplyFromSaved = async (job) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:8000/jobs/swipe', 
        { job_id: job.id, action: 'right' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Instantly update UI: Change status in Saved tab, and copy to Applied tab
      setSavedList(prev => prev.map(j => j.id === job.id ? { ...j, status: 'applied_and_saved' } : j));
      setAppliedList(prev => !prev.find(j => j.id === job.id) ? [...prev, { ...job, status: 'applied_and_saved' }] : prev);
    } catch (err) {
      console.error("Failed to apply from saved", err);
    }
  };


  const handleRemoveSaved = async (job) => {
    try {
      const token = sessionStorage.getItem('token');
      // Tell backend to remove the saved status
      await axios.delete(`http://localhost:8000/jobs/${job.id}/save`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Instantly update UI
      setSavedList(prev => prev.filter(j => j.id !== job.id));
    } catch (err) {
      console.error("Failed to remove saved job", err);
    }
  };

  const handleWithdrawApplication = async (job) => {
    try {
      const token = sessionStorage.getItem('token');
      // Tell backend to delete or downgrade the application
      await axios.delete(`http://localhost:8000/jobs/${job.id}/apply`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 1. Instantly remove it from the Applied tab
      setAppliedList(prev => prev.filter(j => j.id !== job.id));
      
      // 2. Instantly update it in the Saved tab so the button reverts to "Apply Now"
      setSavedList(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'saved' } : j
      ));

      // 3. Trigger a quick success notification
      setSuccessMsg(`Successfully withdrawn application for ${job.company}.`);
      setTimeout(() => setSuccessMsg(''), 2500);

    } catch (err) {
      console.error("Failed to withdraw application", err);
    }
  };

  useEffect(() => {

    const handleKeyDown = (e) => {
      if (activeTab !== 'feed' && activeTab !== 'matches') return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        handleAction('right');
      } else if (e.key === 'ArrowLeft') {
        handleAction('left');
      } else if (e.key === 'ArrowUp') {
        handleAction('save');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, jobs, currentJobIndex, swipeDirection]);

  // Fetch Saved & Applied Jobs when opening the Pipeline tab

  const fetchPipeline = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Fetch Applied Jobs
      const appliedRes = await axios.get('http://localhost:8000/jobs/applied', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedList(appliedRes.data);

      // Fetch Saved Jobs
      const savedRes = await axios.get('http://localhost:8000/jobs/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedList(savedRes.data);
    } catch (err) {
      console.error("Failed to load pipeline jobs", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved' || activeTab === 'dashboard') {
      fetchPipeline();
    }
  }, [activeTab]);


  return (
    <>
      <style>{`
        .pro-btn-subtle { transition: background-color 0.2s; }
        .pro-btn-subtle:hover { background-color: #334155; }
        .nav-item { transition: background-color 0.2s, color 0.2s; }
        .nav-item:hover { background-color: #1e293b; color: #ffffff; }
        .pro-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
        .action-btn { transition: transform 0.1s, background-color 0.2s; }
        .action-btn:active { transform: scale(0.9); }
        .action-btn.skip:hover { background-color: rgba(239, 68, 68, 0.2); }
        .action-btn.save-action:hover { background-color: rgba(59, 130, 246, 0.2); }
        .action-btn.apply-action:hover { background-color: rgba(16, 185, 129, 0.2); }
        .saved-card-hover { transition: transform 0.2s, border-color 0.2s; }
        .saved-card-hover:hover { transform: translateY(-2px); border-color: #3b82f6; }
        
        /* Dashboard & Skeleton Animations */
        .stat-card-hover { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .stat-card-hover:hover { transform: translateY(-3px); border-color: #3b82f6; box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.4); }
        .quick-action-hover { transition: transform 0.15s, background-color 0.2s; }
        .quick-action-hover:hover { transform: translateY(-2px); background-color: #334155 !important; }
        .activity-item-hover { transition: background-color 0.2s, transform 0.15s; }
        .activity-item-hover:hover { background-color: #334155 !important; transform: translateX(4px); }
        
        @keyframes shimmer {
          0% { opacity: 0.35; }
          50% { opacity: 0.7; }
          100% { opacity: 0.35; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      {toast.visible && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{toast.type === 'error' ? '✕' : '✓'}</span>
          <span style={{ fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}

      <div style={styles.layout}>
        <aside style={{ ...styles.sidebar, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.brand}>SwipeX</h2>
            <button className="pro-btn-subtle" onClick={() => setIsSidebarOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* ADDED ONCLICK AND HOVER CLASS HERE */}
        {/* UPDATED PROFILE CARD WITH DEDICATED BUTTON */}
          <div style={{...styles.profileCard, border: activeTab === 'profile' ? '1px solid #3b82f6' : '1px solid #334155'}}>
            <div style={styles.avatar}>{userProfile.full_name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <p style={styles.profileName}>{userProfile.full_name}</p>
              <p style={styles.profileRole}>{userProfile.role}</p>
             <button className="pro-btn-subtle" onClick={() => handleTabChange('profile')} style={styles.viewProfileBtn}>
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
              <div onClick={() => handleTabChange('feed')} className="nav-item" style={activeTab === 'feed' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <span>Job Feed</span>
                </div>
              </div>
              <div onClick={() => setActiveTab('matches')} className="nav-item" style={activeTab === 'matches' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  <span>Resume Matches</span>
                </div>
              </div>
              <div onClick={() => handleTabChange('saved')} className="nav-item" style={activeTab === 'saved' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  <span>Saved & Applied</span>
                </div>
              </div>
              <div onClick={() => handleTabChange('ats')} className="nav-item" style={activeTab === 'ats' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>ATS Score Check</span>
                </div>
              </div>
              <div onClick={() => handleTabChange('notifications')} className="nav-item" style={activeTab === 'notifications' ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </div>
            </nav>

      </aside>


        {/* Main Content */}
        <main style={{ ...styles.mainContent, marginLeft: isSidebarOpen ? '260px' : '0' }}>
         <header style={styles.topbar}>
            <div style={styles.topbarLeft}>
              
              {/* CHANGED: The button now only renders if the sidebar is closed */}
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
                 activeTab === 'matches' ? 'Resume Matches' :
                 activeTab === 'ats' ? 'ATS Score Checker' :
                 activeTab === 'notifications' ? 'Notifications' :
                 activeTab === 'saved' ? 'My Pipeline' : 'Profile Settings'}
              </h3>

            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
          </header>


          
          <div style={styles.contentArea}>
            
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                  <h1 style={styles.welcomeHeading}>Welcome back, {userProfile.full_name ? userProfile.full_name.split(' ')[0] : 'User'}!</h1>
                  <p style={styles.welcomeText}>Here's an overview of your job search progress and latest matches.</p>
                </div>
                
                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                  <div onClick={() => handleTabChange('saved')} className="stat-card-hover" style={styles.statCard}>
                    <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div style={styles.statInfo}>
                      <h3 style={styles.statValue}>{appliedList.length}</h3>
                      <p style={styles.statLabel}>Applications</p>
                    </div>
                  </div>
                  
                  <div onClick={() => { handleTabChange('saved'); setPipelineSubTab('saved'); }} className="stat-card-hover" style={styles.statCard}>
                    <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div style={styles.statInfo}>
                      <h3 style={styles.statValue}>{savedList.length}</h3>
                      <p style={styles.statLabel}>Saved Jobs</p>
                    </div>
                  </div>

                  <div onClick={() => handleTabChange('notifications')} className="stat-card-hover" style={styles.statCard}>
                    <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <div style={styles.statInfo}>
                      <h3 style={styles.statValue}>{unreadCount}</h3>
                      <p style={styles.statLabel}>Notifications</p>
                    </div>
                  </div>

                  <div onClick={() => handleTabChange('ats')} className="stat-card-hover" style={styles.statCard}>
                    <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    </div>
                    <div style={styles.statInfo}>
                      <h3 style={styles.statValue}>{atsResult ? `${atsResult.score}%` : 'N/A'}</h3>
                      <p style={styles.statLabel}>Latest ATS Score</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 style={styles.sectionTitle}>Quick Actions</h3>
                  <div style={styles.quickActionsGrid}>
                    <button onClick={() => handleTabChange('feed')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Start Swiping Jobs
                    </button>
                    <button onClick={() => handleTabChange('ats')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                      Run ATS Compatibility Check
                    </button>
                    <button onClick={() => handleTabChange('profile')} className="quick-action-hover" style={{...styles.quickActionBtn, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Update Resume / Profile
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 style={styles.sectionTitle}>Recent Notifications</h3>
                  <div style={styles.recentActivityList}>
                    {notifications.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, padding: '16px', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '8px' }}>No recent notifications.</p>
                    ) : (
                      notifications.slice(0, 3).map(notif => (
                        <div key={notif.id} onClick={() => handleTabChange('notifications')} className="activity-item-hover" style={styles.recentActivityItem}>
                          <div style={styles.activityDot} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: '#f8fafc', fontSize: '14px', fontWeight: '500' }}>{notif.message}</p>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                          </div>
                          <span style={{ color: '#3b82f6', fontSize: '12px' }}>View ➔</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}


          

          {/* Profile Settings View */}
  {activeTab === 'profile' && (
    <div style={styles.formContainer}>
      <h2 style={styles.formHeading}>Complete Your Profile</h2>
      <p style={styles.formSubText}>Update your account details and professional information.</p>
      {successMsg && <div style={styles.successMessage}>{successMsg}</div>}
      <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Info */}
        <div>
          <div style={styles.sectionHeader}>Account Information</div>
          <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input className="pro-input" type="text" name="full_name" value={formData.full_name} onChange={handleProfileChange} style={styles.input} required /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Email Address</label><input className="pro-input" type="email" name="email" value={formData.email} onChange={handleProfileChange} style={styles.input} required /></div>
        </div>

        {/* Dynamic Education Section */}
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px', marginTop: '16px'}}>
            <div style={{fontSize: '14px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Education Track</div>
            <button type="button" onClick={addEducation} style={{padding: '4px 12px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'}}>+ Add Education</button>
          </div>
          
          {educationList.map((edu, index) => (
            <div key={index} style={{backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <select className="pro-input" value={edu.type} onChange={(e) => updateEducation(index, 'type', e.target.value)} style={{...styles.input, width: '48%'}}>
                  <option value="High School">High School</option>
                  <option value="12th/Diploma">12th/Diploma</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                </select>
                <button type="button" onClick={() => removeEducation(index)} style={{color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer'}}>✕ Remove</button>
              </div>
              <input className="pro-input" type="text" placeholder="Institution Name" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} style={styles.input} />
              <div style={{display: 'flex', gap: '12px'}}>
                <input className="pro-input" type="text" placeholder="Group/Major (e.g., CSE)" value={edu.group} onChange={(e) => updateEducation(index, 'group', e.target.value)} style={{...styles.input, flex: 1}} />
                <input className="pro-input" type="text" placeholder="Score/Percentage (e.g., 8.23 CPI)" value={edu.score} onChange={(e) => updateEducation(index, 'score', e.target.value)} style={{...styles.input, flex: 1}} />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Achievements Section */}
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px', marginTop: '16px'}}>
            <div style={{fontSize: '14px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Achievements</div>
            <button type="button" onClick={addAchievement} style={{padding: '4px 12px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'}}>+ Add</button>
          </div>
          {achievementsList.map((ach, index) => (
            <div key={index} style={{display: 'flex', gap: '12px', marginTop: '12px'}}>
              <input className="pro-input" type="text" placeholder="e.g., Hackathon Winner, Certifications..." value={ach} onChange={(e) => updateAchievement(index, e.target.value)} style={{...styles.input, flex: 1}} />
              <button type="button" onClick={() => removeAchievement(index)} style={{color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer'}}>✕</button>
            </div>
          ))}
        </div>

        {/* Skills, Links & Resume */}
        <div>
          <div style={styles.sectionHeader}>Professional Background</div>
          <div style={{...styles.inputGroup, marginTop: '12px'}}><label style={styles.label}>Technical Skills (comma separated)</label><input className="pro-input" type="text" name="skills" value={formData.skills} onChange={handleProfileChange} style={styles.input} /></div>
          <div style={{...styles.inputGroup, marginTop: '12px'}}><label style={styles.label}>Portfolio / GitHub URL</label><input className="pro-input" type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleProfileChange} style={styles.input} /></div>
          <div style={{...styles.inputGroup, marginTop: '12px'}}>
            <label style={styles.label}>Master Resume (PDF)</label>
            <div style={{...styles.inputGroup, marginTop: '12px'}}>
          <label style={styles.label}>Master Resume (PDF)</label>
          
          {/* Show the currently saved resume if it exists */}
          {existingResumePath && !profileResumeFile && (
            <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓ Currently uploaded:</span>
              <a 
                href={`http://localhost:8000/${existingResumePath.replace(/\\/g, '/')}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#3b82f6', textDecoration: 'underline' }}
              >
                View Saved Resume
              </a>
            </div>
          )}

          {/* Show the name of the newly selected file before they hit save */}
          {profileResumeFile && (
            <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '8px' }}>
              ✦ Ready to upload: {profileResumeFile.name} (Will replace current resume)
            </div>
          )}

          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => {
              setProfileResumeFile(e.target.files[0]);
              setHasUnsavedChanges(true); // Triggers the unsaved changes warning
            }} 
            style={{...styles.input, padding: '10px'}} 
          />
        </div>
          </div>
        </div>
        
        <button type="submit" style={styles.primaryButton}>Save Profile Configurations</button>
      </form>
    </div>
  )}



            {/* ATS Score Checker View */}
            {activeTab === 'ats' && (
              <div style={styles.formContainer}>
                <h2 style={styles.formHeading}>ATS Score Checker</h2>
                <p style={styles.formSubText}>Paste your resume and the target job description to see how well you match the keywords.</p>
                
                {errorMessage && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' }}>
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleAtsCheck} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Job Description</label>
                    <textarea 
                      className="pro-input" 
                      placeholder="Paste the target job description here..." 
                      value={atsJd} 
                      onChange={(e) => setAtsJd(e.target.value)} 
                      style={styles.textarea} 
                      required 
                    />
                  </div>
                  
                 <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={useProfileResume} 
                                onChange={(e) => setUseProfileResume(e.target.checked)} 
                            />
                            Use saved resume from my Profile
                        </label>
                        
                        {/* Only show the file upload input if they uncheck the box above */}
                        {!useProfileResume && (
                            <div style={{ marginTop: '10px' }}>
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={(e) => setResumeFile(e.target.files[0])} 
                                    style={{ padding: '8px', backgroundColor: '#1e293b', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                        )}
                    </div>
                  <button type="submit" disabled={isAtsLoading} style={{...styles.primaryButton, opacity: isAtsLoading ? 0.7 : 1}}>
                    {isAtsLoading ? 'AI is scanning your document...' : 'Calculate Match Score'}
                  </button>
                </form>


                {atsResult && (
                  <div style={styles.atsResultContainer}>
                    <div style={styles.atsScoreHeader}>
                      <div style={{...styles.atsScoreCircle, borderColor: atsResult.score >= 70 ? '#10b981' : atsResult.score >= 40 ? '#f59e0b' : '#ef4444'}}>
                        <span style={{fontSize: '28px', fontWeight: '700', color: '#ffffff'}}>{atsResult.score}%</span>
                      </div>
                      <div>
                        <h3 style={{margin: '0 0 8px 0', color: '#ffffff', fontSize: '18px'}}>Match Result</h3>
                        <p style={{margin: 0, color: '#94a3b8', fontSize: '14px'}}>
                          {atsResult.score >= 70 ? 'Great match! Your resume is highly optimized for this role.' : 
                           atsResult.score >= 40 ? 'Fair match. Consider adding some of the missing keywords below.' : 
                           'Low match. You should significantly tailor your resume for this specific job.'}
                        </p>
                      </div>
                    </div>

                    <div style={{marginTop: '24px', display: 'flex', gap: '24px'}}>
                      <div style={{flex: 1}}>
                        <h4 style={{color: '#10b981', margin: '0 0 12px 0', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px'}}>Matched Keywords</h4>
                        <div style={styles.tagContainer}>
                          {atsResult.matched.length > 0 ? atsResult.matched.map(word => (
                            <span key={word} style={{...styles.tag, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)'}}>{word}</span>
                          )) : <span style={{color: '#94a3b8', fontSize: '13px'}}>None found</span>}
                        </div>
                      </div>
                      
                      <div style={{flex: 1}}>
                        <h4 style={{color: '#ef4444', margin: '0 0 12px 0', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '8px'}}>Missing Keywords</h4>
                        <div style={styles.tagContainer}>
                          {atsResult.missing.length > 0 ? atsResult.missing.map(word => (
                            <span key={word} style={{...styles.tag, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)'}}>{word}</span>
                          )) : <span style={{color: '#94a3b8', fontSize: '13px'}}>None missing!</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Saved & Applied Jobs View */}
            {activeTab === 'saved' && (
              <div style={styles.savedContainer}>
                <div style={styles.pipelineNav}>
                  <button onClick={() => setPipelineSubTab('applied')} style={pipelineSubTab === 'applied' ? {...styles.pipelineTab, ...styles.pipelineTabActive} : styles.pipelineTab}>
                    Applied ({appliedList.length})
                  </button>
                  <button onClick={() => setPipelineSubTab('saved')} style={pipelineSubTab === 'saved' ? {...styles.pipelineTab, ...styles.pipelineTabActive} : styles.pipelineTab}>
                    Saved Jobs ({savedList.length})
                  </button>
                </div>

                {pipelineSubTab === 'applied' && (
                  <div style={styles.savedGrid}>
                   {appliedList.length === 0 ? (
                      <div style={styles.emptyState}><h3>No active applications.</h3><p>Swipe right on the feed to apply to jobs instantly.</p></div>
                    ) : (
                      appliedList.map((job, index) => (
                        <div key={index} className="saved-card-hover" style={styles.savedCard}>
                          <div style={styles.savedCardTop}>
                            <div>
                              <h3 style={styles.savedJobTitle}>{job.title}</h3>
                              <p style={styles.savedJobCompany}>{job.company} • {job.location}</p>
                              
                              {/* NEW: Dynamic Verdict Badge displaying just below the title */}
                              <div style={{ marginTop: '12px' }}>
                                {job.verdict === 'accepted' ? (
                                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.3)'}}>🎉 Congratulations! You have been accepted!</span>
                                ) : job.verdict === 'rejected' ? (
                                  <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)'}}>✕ Not selected by recruiter</span>
                                ) : (
                                  <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.2)'}}>⏳ In Review</span>
                                )}
                              </div>
                              
                            </div>
                            {/* Original Status Badge */}
                            <span style={styles.appliedBadge}>✓ Applied</span>
                          </div>
                          
                          <div style={styles.savedCardBottom}>
                            <span style={styles.savedJobSalary}>{job.salary}</span>
                            <div style={{display: 'flex', gap: '12px'}}>
                              <button onClick={() => handleWithdrawApplication(job)} className="pro-btn-subtle" style={{...styles.viewDetailsBtn, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)'}}>Withdraw</button>
                              <button onClick={() => handleViewJobDetails(job.id)} className="pro-btn-subtle" style={styles.viewDetailsBtn}>View Details</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {pipelineSubTab === 'saved' && (
                  <div style={styles.savedGrid}>
                    {savedList.length === 0 ? (
                      <div style={styles.emptyState}><h3>No saved jobs.</h3><p>Use the Save button on the feed to bookmark jobs for later.</p></div>
                    ) : (
                      savedList.map((job, index) => (
                        <div key={index} className="saved-card-hover" style={styles.savedCard}>
                          <div style={styles.savedCardTop}>
                            <div>
                              <h3 style={styles.savedJobTitle}>{job.title}</h3>
                              <p style={styles.savedJobCompany}>{job.company} • {job.location}</p>
                              
                              {/* NEW: Dynamic Verdict Badge displaying just below the title */}
                              {job.status && job.status.includes('applied') && (
                                <div style={{ marginTop: '12px' }}>
                                  {job.verdict === 'accepted' ? (
                                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.3)'}}>🎉 Congratulations! You have been accepted!</span>
                                  ) : job.verdict === 'rejected' ? (
                                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)'}}>✕ Not selected by recruiter</span>
                                  ) : (
                                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.2)'}}>⏳ In Review</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span style={styles.savedBadge}>★ Saved</span>
                          </div>
                          <div style={styles.savedCardBottom}>
                            <span style={styles.savedJobSalary}>{job.salary}</span>
                            <div style={{display: 'flex', gap: '12px'}}>
                              {job.status && job.status.includes('applied') ? (
                                <button 
                                  disabled
                                  className="pro-btn-subtle" 
                                  style={{...styles.viewDetailsBtn, backgroundColor: '#10b981', color: '#ffffff', borderColor: '#10b981', fontWeight: '600', cursor: 'default', opacity: 0.9}}
                                >
                                  ✓ Already Applied
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleApplyFromSaved(job)} 
                                  className="pro-btn-subtle" 
                                  style={{...styles.viewDetailsBtn, backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: '600'}}
                                >
                                  Apply Now
                                </button>
                              )}
                              <button onClick={() => handleViewJobDetails(job.id)} className="pro-btn-subtle" style={styles.viewDetailsBtn}>View Details</button>
                              <button onClick={() => handleRemoveSaved(job)} className="pro-btn-subtle" style={styles.viewDetailsBtn}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
              </div>
            )}
          </div>
        )}



            {activeTab === 'notifications' && (
              <div style={styles.savedContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
                  <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: '600' }}>Your Notifications</h2>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} style={styles.markAllReadBtn}>
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={styles.savedGrid}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>
                      <h3>All caught up!</h3>
                      <p>You have no notifications at the moment.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const typeLabel = 
                        notif.notification_type === 'startup' ? '🚀 Startup' :
                        notif.notification_type === 'match' ? '🎯 High Match' :
                        notif.notification_type === 'openings' ? '🔥 Many Openings' :
                        notif.notification_type === 'competition' ? '⚡ Low Competition' : 
                        notif.notification_type === 'verdict' ? '✨ Status Update' : 'Notice';
                        
                      const badgeStyle = 
                        notif.notification_type === 'startup' ? styles.startupBadge :
                        notif.notification_type === 'match' ? styles.matchBadge :
                        notif.notification_type === 'openings' ? styles.openingsBadge :
                        notif.notification_type === 'competition' ? styles.competitionBadge :
                        notif.notification_type === 'verdict' ? styles.competitionBadge : styles.savedBadge;


                      return (
                        <div key={notif.id} className="saved-card-hover" style={{...styles.savedCard, borderLeft: notif.is_read ? '1px solid #334155' : '4px solid #3b82f6', opacity: notif.is_read ? 0.8 : 1}}>
                          <div style={styles.savedCardTop}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={badgeStyle}>{typeLabel}</span>
                                {!notif.is_read && <span style={styles.unreadDot} />}
                              </div>
                              <p style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: notif.is_read ? '400' : '500' }}>
                                {notif.message}
                              </p>
                              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                                {new Date(notif.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ ...styles.savedCardBottom, borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            {notif.job_id && (
                              <button onClick={() => handleViewJobDetails(notif.job_id)} className="pro-btn-subtle" style={styles.viewDetailsBtn}>
                                View Job
                              </button>
                            )}
                            {!notif.is_read && (
                              <button onClick={() => handleMarkAsRead(notif.id)} className="pro-btn-subtle" style={{ ...styles.viewDetailsBtn, color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                                Mark as Read
                              </button>
                            )}
                            <button onClick={() => handleDeleteNotification(notif.id)} className="pro-btn-subtle" style={{ ...styles.viewDetailsBtn, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                              Dismiss
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected Job Modal */}
            {isJobModalOpen && selectedJob && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                  <div style={styles.modalHeader}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff' }}>{selectedJob.title}</h2>
                    <button onClick={() => { setIsJobModalOpen(false); setSelectedJob(null); }} style={styles.closeModalBtn}>×</button>
                  </div>
                  <div style={styles.modalBody}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#cbd5e1', fontSize: '14px' }}>
                      <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Company:</strong> {selectedJob.company}</p>
                      <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Location:</strong> {selectedJob.location}</p>
                      {selectedJob.salary && <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Salary:</strong> {selectedJob.salary}</p>}
                      <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Job Type:</strong> {selectedJob.work_type} ({selectedJob.work_mode})</p>
                      {selectedJob.experience && <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Experience:</strong> {selectedJob.experience}</p>}
                      {selectedJob.openings && <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Openings:</strong> {selectedJob.openings}</p>}
                      {selectedJob.duration && <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Duration:</strong> {selectedJob.duration}</p>}
                      {selectedJob.contact && <p style={{ margin: 0 }}><strong style={{ color: '#ffffff' }}>Contact:</strong> {selectedJob.contact}</p>}
                      
                      <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', marginTop: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Job Description</h4>
                        <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
                      </div>

                      {selectedJob.tags && selectedJob.tags.length > 0 && (
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', marginTop: '6px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Skills / Tags</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {selectedJob.tags.map((tag, i) => (
                              <span key={i} style={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


        {/* Job Discovery Feed View */}
         {/* 👇 PASTE THIS NEW BLOCK TO REPLACE THE OLD FEED VIEW 👇 */}
         {(activeTab === 'feed' || activeTab === 'matches') && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: 'calc(100vh - 120px)' }}>
              
              {/* Search & Filter Top Bar */}
              <div style={styles.searchContainer}>
                <div style={styles.searchRow}>
                  <input 
                    type="text" 
                    placeholder="Search roles, companies, or skills..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFeed()}
                    style={styles.searchInput} 
                  />
                  <button onClick={() => fetchFeed()} style={styles.primaryButtonSearch}>Search</button>
                  <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} style={styles.filterToggleBtn}>
                    {isFilterExpanded ? '▲ Hide Filters' : '▼ Filters'}
                  </button>
                </div>
                
               {isFilterExpanded && (
                  <div style={styles.filterPanel}>
                    <div style={styles.filterGrid}>
                      <input 
                        type="text" placeholder="Location (e.g., Remote)" 
                        value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchFeed()} style={styles.searchInput} 
                      />
                      <input 
                        type="text" placeholder="Company Name" 
                        value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchFeed()} style={styles.searchInput} 
                      />
                      <input 
                        type="text" placeholder="Salary (e.g., 120k)" 
                        value={filterSalary} onChange={(e) => setFilterSalary(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchFeed()} style={styles.searchInput} 
                      />
                      <input 
                        type="text" placeholder="Skill / Tech (e.g., React)" 
                        value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchFeed()} style={styles.searchInput} 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                      <button onClick={handleResetFilters} style={styles.resetFilterBtn}>Clear All</button>
                      <button onClick={() => fetchFeed()} style={styles.applyFilterBtn}>Apply Filters</button>
                    </div>
                  </div>
                )}
                </div>

              {/* 3D FEED CONTAINER */}
              <div style={{ 
                ...styles.feedContainer, 
                perspective: '1200px', 
                position: 'relative',
                flex: 1 
              }}>
                
                {successMsg && (
                   <div style={{...styles.successMessage, position: 'absolute', top: '20px', zIndex: 50}}>
                     {successMsg}
                   </div>
                )}

                {isFeedLoading ? (
                  <div style={styles.skeletonContainer}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        ...styles.jobCard,
                        ...styles.skeletonCard,
                        position: 'absolute',
                        top: '10%',
                        zIndex: 10 - i,
                        transform: `translateY(${i * 15}px) scale(${1 - (i * 0.05)})`,
                        opacity: 1 - i * 0.15,
                        pointerEvents: 'none'
                      }}>
                        <div style={styles.skeletonHeader}>
                          <div style={styles.skeletonCircle} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={styles.skeletonLineShort} />
                            <div style={styles.skeletonLineTiny} />
                          </div>
                        </div>
                        <div style={styles.skeletonBody}>
                          <div style={styles.skeletonLineLong} />
                          <div style={styles.skeletonLineLong} />
                          <div style={styles.skeletonLineLong} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentJobIndex < jobs.length ? (
                  jobs.slice(currentJobIndex, currentJobIndex + 3).map((job, sliceIndex) => {
                    const isFrontCard = sliceIndex === 0;
                    
                    const stackScale = 1 - (sliceIndex * 0.05); 
                    const stackTranslateY = sliceIndex * 15;    
                    const stackZIndex = 10 - sliceIndex;        
                    
                    let currentTransform = `translateY(${stackTranslateY}px) scale(${stackScale})`;
                    let currentTransition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

                    if (isFrontCard) {
                      if (swipeDirection === 'left') {
                        currentTransform = 'translateX(-150%) translateY(20%) rotateZ(-15deg) rotateY(-40deg) scale(0.8)';
                        currentTransition = 'transform 0.5s ease-out, opacity 0.4s ease-out';
                      } else if (swipeDirection === 'right') {
                        currentTransform = 'translateX(150%) translateY(20%) rotateZ(15deg) rotateY(40deg) scale(0.8)';
                        currentTransition = 'transform 0.5s ease-out, opacity 0.4s ease-out';
                      } else if (swipeDirection === 'save') {
                        currentTransform = 'translateY(-150%) rotateX(30deg) scale(0.8)'; 
                        currentTransition = 'transform 0.5s ease-out, opacity 0.4s ease-out';
                      } else if (isDragging) {
                        currentTransform = `translateX(${dragOffsetX}px) translateY(${Math.abs(dragOffsetX) * 0.1}px) rotateZ(${dragOffsetX * 0.04}deg) rotateY(${dragOffsetX * 0.06}deg)`;
                        currentTransition = 'none'; 
                      }
                    }

return (
                      <div 
                        key={job.id || `${currentJobIndex}-${sliceIndex}`}
                        style={{
                          ...styles.jobCard,
                          position: 'absolute',
                          top: '10%',           
                          zIndex: stackZIndex,
                          transform: currentTransform,
                          transition: currentTransition,
                          opacity: (isFrontCard && swipeDirection) ? 0 : (1 - sliceIndex * 0.15),
                          cursor: isFrontCard ? (isDragging ? 'grabbing' : 'grab') : 'default',
                          pointerEvents: isFrontCard ? 'auto' : 'none', 
                          boxShadow: isFrontCard ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
                        }}
                        onMouseDown={isFrontCard ? handleDragStart : null} 
                        onMouseMove={isFrontCard ? handleDragMove : null} 
                        onMouseUp={isFrontCard ? handleDragEnd : null} 
                        onMouseLeave={isFrontCard ? handleDragEnd : null}
                        onTouchStart={isFrontCard ? handleDragStart : null} 
                        onTouchMove={isFrontCard ? handleDragMove : null} 
                        onTouchEnd={isFrontCard ? handleDragEnd : null}
                      >
                        {/* Drag Swiping overlay stamp */}
                        {isFrontCard && isDragging && Math.abs(dragOffsetX) > 25 && (
                          <div style={{
                            position: 'absolute',
                            top: '30px',
                            left: dragOffsetX > 0 ? '30px' : 'auto',
                            right: dragOffsetX < 0 ? '30px' : 'auto',
                            transform: dragOffsetX > 0 ? 'rotate(-12deg)' : 'rotate(12deg)',
                            border: `4px solid ${dragOffsetX > 0 ? '#10b981' : '#ef4444'}`,
                            color: dragOffsetX > 0 ? '#10b981' : '#ef4444',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '24px',
                            fontWeight: '800',
                            letterSpacing: '2px',
                            zIndex: 100,
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            opacity: Math.min(Math.abs(dragOffsetX) / 80, 1),
                            pointerEvents: 'none',
                            transition: 'opacity 0.1s ease'
                          }}>
                            {dragOffsetX > 0 ? 'APPLY' : 'SKIP'}
                          </div>
                        )}

                        <div style={styles.jobHeader}>
                          <div>
                            {/* ✨ NEW: DYNAMIC MATCH PERCENTAGE BADGE ✨ */}
                            {activeTab === 'matches' && job.match_score && (
                              <div style={{
                                display: 'inline-block',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '700',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                marginBottom: '10px'
                              }}>
                                ✨ {job.match_score}% Resume Match
                              </div>
                            )}
                            
                            {activeTab === 'feed' && job.rec_score && (
                              <div style={{
                                display: 'inline-block',
                                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                color: '#8b5cf6',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '700',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                marginBottom: '10px'
                              }}>
                                ⚡ {job.rec_score}% Match (based on history)
                              </div>
                            )}
                            
                            <h2 style={styles.jobTitle}>{job.title}</h2>
                            <h4 style={styles.jobCompany}>{job.company}</h4>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                              {job.location && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                  {job.location}
                                </span>
                              )}
                              {job.work_mode && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                  {job.work_mode}
                                </span>
                              )}
                              {job.work_type && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                  {job.work_type}
                                </span>
                              )}
                              {job.experience && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                  {job.experience}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={styles.salaryBadge}>{job.salary || 'Salary N/A'}</div>
                        </div>

                        <div style={styles.jobBody}>
                          {/* RESTORED: Logistics Badges */}
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #334155'}}>
                            {job.work_mode && <span style={styles.logisticBadge}>📍 {job.work_mode}</span>}
                            
                            {job.work_type && (
                              <span style={styles.logisticBadge}>
                                💼 {job.work_type} {job.work_type === 'Internship' && job.duration ? `(${job.duration})` : ''}
                              </span>
                            )}
                            
                            {job.experience && <span style={styles.logisticBadge}>⭐ Exp: {job.experience}</span>}
                            {job.openings && <span style={styles.logisticBadge}>👥 {job.openings} Opening{job.openings > 1 ? 's' : ''}</span>}
                          </div>

                          <p style={styles.jobDesc}>{job.description}</p>
                          
                          <div style={styles.tagContainer}>
                            {job.tags && job.tags.map(tag => (
                              <span key={tag} style={styles.tag}>{tag}</span>
                            ))}
                          </div>

                          {/* RESTORED: Contact Info Box */}
                          {job.contact && (
                            <div style={{marginTop: '20px', fontSize: '13px', color: '#94a3b8', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', border: '1px dashed #334155'}}>
                              <span style={{color: '#3b82f6', fontWeight: '600'}}>HR Contact: </span> {job.contact}
                            </div>
                          )}
                        </div>

                        <div style={styles.swipeControls}>
                          <button className="action-btn skip" onClick={(e) => { e.stopPropagation(); handleAction('left'); }} style={{...styles.controlBtn, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)'}}>
                            ✕ Skip
                          </button>
                          
                          <button 
                            className="action-btn save-action" 
                            onClick={(e) => { e.stopPropagation(); handleAction('save', false); }} 
                            style={{...styles.controlBtn, color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)'}}
                          >
                            {job.application_status && job.application_status.includes('saved') ? '★ Already Saved' : '★ Save'}
                          </button>
                          
                          <button 
                            className="action-btn apply-action" 
                            onClick={(e) => { e.stopPropagation(); handleAction('right', false); }} 
                            style={{
                              ...styles.controlBtn, 
                              color: job.application_status && job.application_status.includes('applied') ? (
                                job.verdict === 'accepted' ? '#10b981' :
                                job.verdict === 'rejected' ? '#ef4444' : '#f59e0b'
                              ) : '#10b981',
                              borderColor: job.application_status && job.application_status.includes('applied') ? (
                                job.verdict === 'accepted' ? 'rgba(16, 185, 129, 0.4)' :
                                job.verdict === 'rejected' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                              ) : 'rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            {job.application_status && job.application_status.includes('applied') ? (
                              job.verdict === 'accepted' ? '🎉 Accepted!' :
                              job.verdict === 'rejected' ? '✕ Rejected' : '⏳ In Review'
                            ) : '✓ Apply'}
                          </button>
                        </div>
                      </div>
                    );
                  })
             ) : (
                  <div style={styles.emptyState}>
                    {activeTab === 'matches' ? (
                      <>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Matches Found</h3>
                        <p>We couldn't find any active postings that strongly match your resume keywords. Try expanding your skills or updating your profile resume!</p>
                      </>
                    ) : (searchQuery || filterLocation || filterCompany || filterSalary || filterSkill) && jobs.length === 0 ? (
                      <>
                        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No results found.</h3>
                        <p>We couldn't find any opportunities matching your specific search criteria.</p>
                        <button onClick={handleResetFilters} style={styles.primaryButton}>
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>You're all caught up!</h3>
                        <p>You have seen all available jobs. Want to review your skipped and saved jobs?</p>
                        <button onClick={() => fetchFeed()} style={styles.primaryButton}>
                          Loop Feed Again
                        </button>
                      </>
                    )}
                  </div>
                )}
                
                </div>
            </div>
          )}



          {/* 👆 ---------------------------------------------------------------------- 👆 */}
          </div>        </main>
      </div>
    </>
  );
};




// Paste the EXACT `styles` object from the original code here
const styles = {


  // 👇 PASTE THESE NEW STYLES AT THE END 👇
  atsResultContainer: { marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #334155', animation: 'fadeIn 0.3s ease' },
  atsScoreHeader: { display: 'flex', alignItems: 'center', gap: '24px' },
  atsScoreCircle: { width: '80px', height: '80px', borderRadius: '50%', border: '4px solid', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  viewProfileBtn: { marginTop: '10px', padding: '6px 0', width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
  // ... append these inside the styles object
  // Add these alongside your other search styles at the bottom
  filterPanel: { padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', animation: 'fadeIn 0.2s ease-out' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%' },
  searchContainer: { width: '100%', maxWidth: '600px', margin: '0 auto 24px auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  searchRow: { display: 'flex', gap: '12px', width: '100%' },
  filterRow: { display: 'flex', gap: '12px', width: '100%', padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', animation: 'fadeIn 0.2s ease-out' },
  searchInput: { flex: 1, padding: '12px 16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#f8fafc', outline: 'none', transition: 'border-color 0.2s' },
  primaryButtonSearch: { padding: '0 20px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  filterToggleBtn: { padding: '0 16px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  applyFilterBtn: { padding: '10px 16px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  resetFilterBtn: { padding: '10px 16px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
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
  badge: { backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' },
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
  primaryButton: { padding: '12px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  successMessage: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' },
  savedContainer: { width: '100%', maxWidth: '800px' },
  pipelineNav: { display: 'flex', gap: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' },
  pipelineTab: { backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '15px', fontWeight: '500', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'background-color 0.2s, color 0.2s' },
  pipelineTabActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: '600' },
  savedGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  savedCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  savedCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  savedJobTitle: { margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: '600' },
  savedJobCompany: { margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' },
  appliedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' },
  savedBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' },
  savedCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '16px' },
  savedJobSalary: { color: '#cbd5e1', fontSize: '14px', fontWeight: '500' },
  viewDetailsBtn: { padding: '8px 16px', backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  feedContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'calc(100vh - 200px)' },
  jobCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '24px', userSelect: 'none', WebkitUserSelect: 'none' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle: { margin: 0, fontSize: '22px', color: '#ffffff', fontWeight: '700' },
  jobCompany: { margin: '6px 0 0 0', fontSize: '15px', color: '#94a3b8', fontWeight: '500' },
  salaryBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)', whiteSpace: 'nowrap' },
  jobBody: { flex: 1 },
  jobDesc: { fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 20px 0' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' },
  swipeControls: { display: 'flex', gap: '12px', marginTop: '16px' },
  controlBtn: { flex: 1, padding: '16px 8px', backgroundColor: 'transparent', borderRadius: '12px', border: '2px solid', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' },
  emptyState: { textAlign: 'center', color: '#94a3b8', padding: '40px' },

  // Notification Styles
  markAllReadBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' },
  startupBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.2)' },
  matchBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' },
  openingsBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' },
  competitionBadge: { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(139, 92, 246, 0.2)' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'scaleUp 0.2s ease-out' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #334155' },
  modalBody: { padding: '24px', overflowY: 'auto', flex: 1 },
  closeModalBtn: { backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },

  // Redesigned Dashboard Styles
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', width: '100%' },
  statCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  statIconContainer: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#ffffff' },
  statLabel: { margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '500' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '18px', color: '#ffffff', fontWeight: '600' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' },
  quickActionBtn: { padding: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' },
  recentActivityList: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
  recentActivityItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer' },
  activityDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' },

  // Toast Style
  toast: { position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', zIndex: 1100, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },

  // Skeleton Loader Styles
  skeletonContainer: { position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' },
  skeletonCard: { backgroundColor: '#1e293b', border: '1px solid #334155', opacity: 0.7 },
  skeletonHeader: { display: 'flex', gap: '16px', marginBottom: '20px' },
  skeletonCircle: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#334155', animation: 'shimmer 1.5s infinite ease-in-out' },
  skeletonBody: { display: 'flex', flexDirection: 'column', gap: '12px' },
  skeletonLineShort: { width: '120px', height: '16px', borderRadius: '4px', backgroundColor: '#334155', animation: 'shimmer 1.5s infinite ease-in-out' },
  skeletonLineTiny: { width: '80px', height: '12px', borderRadius: '4px', backgroundColor: '#334155', animation: 'shimmer 1.5s infinite ease-in-out' },
  skeletonLineLong: { width: '100%', height: '14px', borderRadius: '4px', backgroundColor: '#334155', animation: 'shimmer 1.5s infinite ease-in-out' }


  
};

export default JobSeekerHome;