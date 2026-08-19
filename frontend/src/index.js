import React from 'react';
import ReactDOM from 'react-dom/client';
import './config/api'; // Initialize API base URL and global Axios 404 error interceptor
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);