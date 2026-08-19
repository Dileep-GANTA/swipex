import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setError(null);
    } catch (err) {
      setUser(null);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Fetch user profile immediately
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      return userRes.data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error?.message || (err.code === 'ERR_NETWORK' || !err.response ? 'Unable to connect to backend server. Please ensure FastAPI server is running on port 8000.' : 'Login failed. Please check your credentials.');
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await api.post('/auth/register', userData);
      // Automatically login user after registration
      return await login(userData.email, userData.password);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error?.message || (err.code === 'ERR_NETWORK' || !err.response ? 'Unable to connect to backend server. Please ensure FastAPI server is running on port 8000.' : 'Registration failed.');
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setLoading(false);
    }
  };

  const token = localStorage.getItem('access_token');

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, getMe, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
