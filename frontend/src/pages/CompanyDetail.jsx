import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import PostJobModal from '../components/PostJobModal';
import { jobsApi } from '../services/jobsApi';
import { Building2, MapPin, ExternalLink, ArrowLeft, Briefcase, Sparkles } from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    loadCompanyAndJobs();
  }, [id]);

  const loadCompanyAndJobs = async () => {
    setLoading(true);
    try {
      const compData = await jobsApi.getCompanyById(id);
      setCompany(compData);
      const jobsData = await jobsApi.getJobs();
      // Filter jobs belonging to this company
      const companyJobs = (jobsData || []).filter((j) => j.company_id === id);
      setJobs(companyJobs);
    } catch (err) {
      console.error('Failed to load company detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (jobId, direction) => {
    try {
      await jobsApi.recordSwipe(jobId, direction);
      alert(`Job recorded as ${direction === 'right' ? 'Applied/Saved' : 'Skipped'}!`);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center text-center p-6">
          <Building2 className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Company Not Found</h2>
          <Link to="/companies" className="text-sm font-semibold text-teal-600 hover:underline">
            &larr; Back to Companies Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenPostJob={() => setIsPostModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link
          to="/companies"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Companies</span>
        </Link>

        {/* Company Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-900 to-teal-900 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg">
              {company.name ? company.name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{company.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                  {company.type ? company.type.replace('_', ' ') : 'Startup'}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 mt-2">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  {company.location || 'Global'}
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-teal-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Official Website
                  </a>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 max-w-2xl leading-relaxed">
                {company.description || 'Leading tech innovator building cutting-edge software products.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
            <Briefcase className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Roles</p>
              <p className="text-sm font-extrabold text-slate-900">{jobs.length} Positions</p>
            </div>
          </div>
        </div>

        {/* Open Roles Section */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Active Open Roles at {company.name}</span>
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto">
              <p className="text-xs text-slate-500">No active job postings found for this company currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="flex justify-center">
                  <JobCard
                    job={{ ...job, company }}
                    onSwipeLeft={() => handleSwipe(job.id, 'left')}
                    onSwipeRight={() => handleSwipe(job.id, 'right')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onJobCreated={loadCompanyAndJobs}
      />
    </div>
  );
};

export default CompanyDetail;
