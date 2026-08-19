import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { FaPaperPlane } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/welcome');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={user ? "/dashboard" : "/welcome"} className="nav-logo">
          <FaPaperPlane className="logo-icon" /> SwipeX
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-user-greeting">Hi, {user.full_name}</span>
              <button onClick={handleLogout} className="btn-nav-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-item">Login</Link>
              <Link to="/register" className="nav-link-item btn-nav-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar