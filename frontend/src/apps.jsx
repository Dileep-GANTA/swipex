import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobFeedPage from './pages/JobFeedPage';
import SavedJobsPage from './pages/SavedJobsPage';
import CompanyListingPage from './pages/CompanyListingPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import EditProfilePage from './pages/EditProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<JobFeedPage />} />
        <Route path="/saved" element={<SavedJobsPage />} />
        <Route path="/companies" element={<CompanyListingPage />} />
        <Route path="/company/:id" element={<CompanyDetailsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
      </Routes>
    </Router>
  );
}
export default App;
