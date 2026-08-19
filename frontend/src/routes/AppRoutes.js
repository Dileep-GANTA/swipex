import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Discover from '../pages/Discover';
import Companies from '../pages/Companies';
import CompanyDetail from '../pages/CompanyDetail';
import SavedJobs from '../pages/SavedJobs';
import Inbox from '../pages/Inbox';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';


const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/discover" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/discover" replace /> : <Register />} 
      />
      <Route 
        path="/discover" 
        element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/companies" 
        element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/companies/:id" 
        element={
          <ProtectedRoute>
            <CompanyDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/saved" 
        element={
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inbox" 
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to={user ? "/discover" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
