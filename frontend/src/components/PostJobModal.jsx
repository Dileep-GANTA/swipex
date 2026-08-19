import React, { useState, useEffect } from 'react';
import { jobsApi } from '../services/jobsApi';
import { X, Plus, Building2, Briefcase, DollarSign, MapPin, Award, Code, CheckCircle, AlertCircle } from 'lucide-react';

const PostJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const [companies, setCompanies] = useState([]);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New Company form fields
  const [newCompany, setNewCompany] = useState({
    name: '',
    type: 'startup',
    website: '',
    location: '',
    description: '',
  });

  // Job form fields
  const [jobData, setJobData] = useState({
    company_id: '',
    title: '',
    description: '',
    job_type: 'full_time',
    salary_min: '',
    salary_max: '',
    location: '',
    experience_level: 'fresher',
    skills: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      setError('');
      setSuccess(false);
      setIsCreatingCompany(false);
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    try {
      const list = await jobsApi.getCompanies();
      setCompanies(list || []);
      if (list && list.length > 0 && !jobData.company_id) {
        setJobData((prev) => ({ ...prev, company_id: list[0].id }));
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      setError('Please enter a company name.');
      return;
    }
    setCompanyLoading(true);
    setError('');
    try {
      const created = await jobsApi.createCompany({
        name: newCompany.name.trim(),
        type: newCompany.type,
        website: newCompany.website ? newCompany.website.trim() : null,
        location: newCompany.location ? newCompany.location.trim() : null,
        description: newCompany.description ? newCompany.description.trim() : null,
      });
      setCompanies((prev) => [...prev, created]);
      setJobData((prev) => ({ ...prev, company_id: created.id }));
      setIsCreatingCompany(false);
      setNewCompany({ name: '', type: 'startup', website: '', location: '', description: '' });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create company. Ensure you are signed in as a Recruiter.';
      setError(msg);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (!jobData.company_id) {
      setError('Please select or create a company first.');
      return;
    }
    if (!jobData.title.trim()) {
      setError('Please provide a job title.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const skillsArray = jobData.skills
        ? jobData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        company_id: jobData.company_id,
        title: jobData.title.trim(),
        description: jobData.description ? jobData.description.trim() : null,
        job_type: jobData.job_type,
        salary_min: jobData.salary_min ? parseInt(jobData.salary_min, 10) : null,
        salary_max: jobData.salary_max ? parseInt(jobData.salary_max, 10) : null,
        location: jobData.location ? jobData.location.trim() : null,
        experience_level: jobData.experience_level,
        skills_required: skillsArray,
        is_active: true,
      };

      await jobsApi.createJob(payload);
      setSuccess(true);
      if (onJobCreated) onJobCreated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to publish job posting.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 sm:p-8 my-8 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-700">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Post a New Job</h2>
            <p className="text-xs text-slate-500">Reach top talent with SwipeX job discovery</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Job posted successfully! It is now live in the discovery feed.</span>
          </div>
        )}

        {/* Inline Create Company Toggle Form */}
        {isCreatingCompany ? (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create Company Profile</h3>
              <button
                type="button"
                onClick={() => setIsCreatingCompany(false)}
                className="text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme AI Technologies"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Type</label>
                <select
                  value={newCompany.type}
                  onChange={(e) => setNewCompany({ ...newCompany, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="mnc">MNC Enterprise</option>
                  <option value="startup">Startup</option>
                  <option value="newly_founded">Newly Founded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://company.com"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateCompany}
              disabled={companyLoading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {companyLoading ? 'Saving Company Profile...' : 'Save & Select Company'}
            </button>
          </div>
        ) : null}

        {/* Main Job Post Form */}
        <form onSubmit={handleSubmitJob} className="space-y-4">
          
          {/* Company Selection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Select Company *</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                className="text-xs font-semibold text-teal-600 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingCompany ? 'Hide Form' : 'Add New Company'}</span>
              </button>
            </div>
            <select
              required
              value={jobData.company_id}
              onChange={(e) => setJobData({ ...jobData, company_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
            >
              <option value="" disabled>Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type ? c.type.replace('_', ' ') : 'company'})
                </option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Fullstack Engineer"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          {/* Job Type & Experience Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                <span>Job Type</span>
              </label>
              <select
                value={jobData.job_type}
                onChange={(e) => setJobData({ ...jobData, job_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="full_time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>Experience Level</span>
              </label>
              <select
                value={jobData.experience_level}
                onChange={(e) => setJobData({ ...jobData, experience_level: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="fresher">Fresher</option>
                <option value="1-3yrs">1-3 Years</option>
                <option value="3-5yrs">3-5 Years</option>
                <option value="5+yrs">5+ Years Senior</option>
              </select>
            </div>
          </div>

          {/* Salary Min & Max */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                <span>Salary Min ($)</span>
              </label>
              <input
                type="number"
                placeholder="100000"
                value={jobData.salary_min}
                onChange={(e) => setJobData({ ...jobData, salary_min: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                <span>Salary Max ($)</span>
              </label>
              <input
                type="number"
                placeholder="150000"
                value={jobData.salary_max}
                onChange={(e) => setJobData({ ...jobData, salary_max: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Location & Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Remote / New York"
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Code className="w-3.5 h-3.5 text-teal-600" />
                <span>Skills (comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="React, Python, AWS"
                value={jobData.skills}
                onChange={(e) => setJobData({ ...jobData, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Description</label>
            <textarea
              rows={3}
              placeholder="Describe the job duties, requirements, and tech stack..."
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/30 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Publishing Job...' : 'Publish Job Posting'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default PostJobModal;
