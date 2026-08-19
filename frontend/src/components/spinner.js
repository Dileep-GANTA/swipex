import React from 'react';
import './Spinner.css';

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Spinner;