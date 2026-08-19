import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

export default function Slide3SearchFilter({ jobs, onView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    salary: '',
    experience: '',
    jobType: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = (jobs || []).filter(job => {
    const term = searchTerm.toLowerCase();
    const companyName = (job.company?.name || job.companyName || '').toLowerCase();
    const matchSearch = !term || [job.title, companyName, job.location, job.salary, job.experience, job.job_type, (job.required_skills || []).join(' ')].join(' ').toLowerCase().includes(term);
    const matchLocation = !filters.location || (job.location || '').toLowerCase().includes(filters.location.toLowerCase());
    const matchSalary = !filters.salary || (job.salary || '').includes(filters.salary);
    const matchExperience = !filters.experience || (job.experience || '').includes(filters.experience);
    const matchJobType = !filters.jobType || (job.job_type || job.jobType) === filters.jobType;

    return matchSearch && matchLocation && matchSalary && matchExperience && matchJobType;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ location: '', salary: '', experience: '', jobType: '' });
    setSearchTerm('');
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Search & Filter Jobs</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Find your perfect role with advanced filters</p>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
          <FiSearch color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by job title, company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', padding: '12px', outline: 'none', fontSize: '14px' }}
          />
        </div>
        <button
          className="action-link-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter size={18} /> Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="swipex-premium-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Filter Options</h3>
            <button
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: 'var(--theme-blue)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
              Clear All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Location Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="">All Locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* Salary Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Salary Range</label>
              <select
                value={filters.salary}
                onChange={(e) => handleFilterChange('salary', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="">All Ranges</option>
                <option value="₹5">₹5 - 10 LPA</option>
                <option value="₹8">₹8 - 14 LPA</option>
                <option value="₹7">₹7 - 12 LPA</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="">All Experience</option>
                <option value="1-3">1-3 Years</option>
                <option value="2-4">2-4 Years</option>
                <option value="3-5">3-5 Years</option>
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results Grid */}
      {filteredJobs.length > 0 ? (
        <div className="standard-card-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="swipex-premium-card" style={{ cursor: 'pointer' }} onClick={() => onView(8, job.id)}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#F3F6F8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {job.company?.logo || '💼'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{job.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{job.company?.name || job.companyName}</p>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                📍 {job.location} • 💰 {job.salary}
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {(job.required_skills || job.skills || []).slice(0, 2).map((s, idx) => (
                  <span key={idx} className="pill-badge">{s}</span>
                ))}
              </div>
              <button className="action-link-btn" style={{ width: '100%', fontSize: '12px', padding: '6px 0' }} onClick={() => onView(8, job.id)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="swipex-premium-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No jobs found matching your criteria.</p>
          <button
            onClick={clearFilters}
            style={{ background: 'none', border: 'none', color: 'var(--theme-blue)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginTop: '8px' }}
          >
            Clear filters and try again
          </button>
        </div>
      )}
    </div>
  );
}
