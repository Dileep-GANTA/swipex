import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecruiterHome from './RecruiterHome';
import JobSeekerHome from './JobSeekerHome';

const Home = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data);
      } catch (error) {
        sessionStorage.removeItem('token');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  const userRole = userProfile?.role?.toLowerCase().trim() || '';

  if (userRole.includes('recruiter')) {
    return <RecruiterHome userProfile={userProfile} setUserProfile={setUserProfile} />;
  } else if (userRole.includes('seeker')) {
    return <JobSeekerHome userProfile={userProfile} setUserProfile={setUserProfile} />;
  } else {
    return (
      <div style={{ padding: '40px', backgroundColor: '#0f172a', color: '#f8fafc', height: '100vh' }}>
        <h2>Error: Invalid User Role</h2>
        <button onClick={() => { sessionStorage.removeItem('token'); navigate('/'); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Return to Login
        </button>
      </div>
    );
  }
};

export default Home;