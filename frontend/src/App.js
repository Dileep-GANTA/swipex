import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Splash & Welcome Pages
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout
import Layout from './components/Layout';

// Job Seeker Pages
import Home from './pages/Home';
import DiscoverJobs from './pages/DiscoverJobs';
import SwipeJobs from './pages/SwipeJobs';
import SavedJobs from './pages/SavedJobs';
import AppliedJobs from './pages/AppliedJobs';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeATS from './pages/ResumeATS';
import PersonalizedRecommendations from './pages/PersonalizedRecommendations';
import Notifications from './pages/Notifications';
import JobDetails from './pages/JobDetails';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterAddJob from './pages/RecruiterAddJob';
import RecruiterMyJobs from './pages/RecruiterMyJobs';
import RecruiterApplications from './pages/RecruiterApplications';
import RecruiterAnalytics from './pages/RecruiterAnalytics';
import RecruiterProfile from './pages/RecruiterProfile';

// CSS Imports
import './pages/login.css';
import './styles/SwipeXPremium.css';

function AppRoutes() {
  const { user, role, token } = useAuth();
  const isAuthenticated = Boolean(user && token);

  return (
    <Routes>
      {/* Root Route Redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={role === 'Recruiter' ? '/recruiter/dashboard' : '/jobseeker/home'} replace />
          ) : (
            <Navigate to="/splash" replace />
          )
        }
      />

      {/* Public Pre-Auth & Auth Routes */}
      <Route path="/splash" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected App Routes wrapped inside Layout (Fixed Sidebar + Dynamic Outlet) */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/welcome" replace />}>
        {/* Job Seeker Navigation Routes */}
        <Route
          path="/jobseeker/home"
          element={role === 'Job Seeker' ? <Home /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/discover"
          element={role === 'Job Seeker' ? <DiscoverJobs /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/swipe"
          element={role === 'Job Seeker' ? <SwipeJobs /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/recommended"
          element={role === 'Job Seeker' ? <PersonalizedRecommendations /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/saved"
          element={role === 'Job Seeker' ? <SavedJobs /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/applied"
          element={role === 'Job Seeker' ? <AppliedJobs /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/notifications"
          element={role === 'Job Seeker' ? <Notifications /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/job/:id"
          element={role === 'Job Seeker' ? <JobDetails /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/resume"
          element={role === 'Job Seeker' ? <ResumeATS /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/dashboard"
          element={role === 'Job Seeker' ? <Dashboard /> : <Navigate to="/recruiter/dashboard" replace />}
        />
        <Route
          path="/jobseeker/profile"
          element={role === 'Job Seeker' ? <Profile /> : <Navigate to="/recruiter/dashboard" replace />}
        />

        {/* Recruiter Navigation Routes */}
        <Route
          path="/recruiter/dashboard"
          element={role === 'Recruiter' ? <RecruiterDashboard /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/add-job"
          element={role === 'Recruiter' ? <RecruiterAddJob /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/my-jobs"
          element={role === 'Recruiter' ? <RecruiterMyJobs /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/applications"
          element={role === 'Recruiter' ? <RecruiterApplications /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/notifications"
          element={role === 'Recruiter' ? <Notifications /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/analytics"
          element={role === 'Recruiter' ? <RecruiterAnalytics /> : <Navigate to="/jobseeker/home" replace />}
        />
        <Route
          path="/recruiter/profile"
          element={role === 'Recruiter' ? <RecruiterProfile /> : <Navigate to="/jobseeker/home" replace />}
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
