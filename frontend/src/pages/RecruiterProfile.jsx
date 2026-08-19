import React, { useState } from 'react';

function RecruiterProfile() {
  const [form, setForm] = useState({ company_name: '', company_location: '', company_description: '', company_website: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert('Profile updated'); };

  return (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '18px' }}>Recruiter Profile</h2>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '22px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(15,23,42,0.06)', display: 'grid', gap: '12px' }}>
        <input name="company_name" placeholder="Company Name" onChange={handleChange} style={inputStyle} />
        <input name="company_location" placeholder="Location" onChange={handleChange} style={inputStyle} />
        <input name="company_website" placeholder="Website" onChange={handleChange} style={inputStyle} />
        <textarea name="company_description" placeholder="Company Description" onChange={handleChange} style={{ ...inputStyle, minHeight: '100px' }} />
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 16px', fontWeight: 700 }}>Save</button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' };

export default RecruiterProfile;
