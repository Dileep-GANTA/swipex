import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobCard from '../components/jobcard';
import { buildApiUrl } from '../config/api';

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [skills, setSkills] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const fetchJobs = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        search: filters.search ?? search,
        location: filters.location ?? location,
        job_type: filters.jobType ?? jobType,
        skills: filters.skills ?? skills,
        min_salary: filters.minSalary ?? minSalary || undefined,
        max_salary: filters.maxSalary ?? maxSalary || undefined,
      };
      const response = await axios.get(buildApiUrl('/api/jobs/'), { params });
      setJobs(response.data);
    } catch (err) {
      toast.error('Failed to load active pipelines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs({ search: '', location: '', jobType: '', skills: '' });
  }, []);

  const handleSwipe = async (action, jobId) => {
    try {
      await axios.post(buildApiUrl('/api/swipe/'), { job_id: jobId, action });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success(`Marked as ${action}`);
    } catch (err) {
      toast.error('Sync failed.');
    }
  };

  const handleSave = async (jobId) => {
    try {
      await axios.post(buildApiUrl('/api/save-job/'), { job_id: jobId });
      toast.success('Job saved successfully');
    } catch (err) {
      toast.error('Failed to save job.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchJobs({ search, location, jobType, skills, minSalary, maxSalary });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">SwipeX Job Discovery</h1>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, keywords, companies"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <input
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              placeholder="Job type (e.g. Full-time)"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <input
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="Min salary"
              type="number"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <input
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="Max salary"
              type="number"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (comma-separated)"
              className="rounded-2xl border border-slate-300 px-4 py-3"
            />
            <button
              type="submit"
              className="sm:col-span-2 lg:col-span-4 bg-blue-600 text-white rounded-2xl py-3 font-semibold hover:bg-blue-500"
            >
              Apply Filters
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {loading ? (
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : jobs.length > 0 ? (
            <div className="relative w-full max-w-4xl mx-auto h-[520px]">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSwipe={handleSwipe}
                  onSave={() => handleSave(job.id)}
                  onViewDetails={() => window.alert(`${job.title} at Company ${job.company_id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 font-medium">No jobs match the selected filters. Try a broader search.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobFeedPage;
