import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import ReviewApplicants from './ReviewApplicants'; // <-- 1. Import the ReviewApplicants component

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          
          {/* <-- 2. Add this route so React knows where to send recruiters */}
          <Route path="/jobs/:jobId/applicants" element={<ReviewApplicants />} />
          
          {/* Catch-all route to redirect unknown URLs to login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;