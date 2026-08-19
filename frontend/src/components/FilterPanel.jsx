import React from 'react';
import { Filter, X, RotateCcw, Building2, MapPin, DollarSign, Briefcase, Award, Search, Laptop } from 'lucide-react';

const FilterPanel = ({ filters, onChange, onReset, onClose }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Smart Job Filters</h3>
            <p className="text-xs text-slate-400">Tailor your discovery feed</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="space-y-5">
        
        {/* Company Classification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Company Type</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '', label: 'All Companies' },
              { id: 'mnc', label: 'MNC Enterprise' },
              { id: 'startup', label: 'Startup' },
              { id: 'newly_founded', label: 'Newly Founded' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChange('company_type', option.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                  (filters.company_type || '') === option.id
                    ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Remote Quick Toggle */}
        <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Remote Only Jobs</p>
              <p className="text-[11px] text-slate-500">Filter work-from-anywhere roles</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={filters.remote === true || filters.remote === 'true'}
            onChange={(e) => handleChange('remote', e.target.checked ? 'true' : '')}
            className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
            <span>Job Type</span>
          </label>
          <select
            value={filters.job_type || ''}
            onChange={(e) => handleChange('job_type', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Job Types</option>
            <option value="full_time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Experience Level</span>
          </label>
          <select
            value={filters.experience_level || ''}
            onChange={(e) => handleChange('experience_level', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Experience Levels</option>
            <option value="fresher">Fresher / Entry Level</option>
            <option value="1-3yrs">1 - 3 Years</option>
            <option value="3-5yrs">3 - 5 Years</option>
            <option value="5+yrs">5+ Years Senior</option>
          </select>
        </div>

        {/* Minimum Salary */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
            <span>Minimum Annual Salary ($k)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 100000"
            value={filters.salary_min || ''}
            onChange={(e) => handleChange('salary_min', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Skills & Technologies */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-teal-600" />
            <span>Required Skills</span>
          </label>
          <input
            type="text"
            placeholder="e.g. React, Python, PostgreSQL"
            value={filters.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Location</span>
          </label>
          <input
            type="text"
            placeholder="e.g. San Francisco, Austin"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

      </div>

    </div>
  );
};

export default FilterPanel;
