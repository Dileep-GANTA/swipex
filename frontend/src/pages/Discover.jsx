import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SwipeDeck from '../components/SwipeDeck';
import FilterPanel from '../components/FilterPanel';
import PostJobModal from '../components/PostJobModal';
import ResumeATSModal from '../components/ResumeATSModal';
import AICoverLetterModal from '../components/AICoverLetterModal';
import AIInterviewPrepModal from '../components/AIInterviewPrepModal';
import { jobsApi } from '../services/jobsApi';
import { Filter, Sparkles, RefreshCw, FileText, HelpCircle } from 'lucide-react';

const Discover = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    company_type: '',
    remote: '',
    job_type: '',
    salary_min: '',
    skills: '',
    location: '',
    experience_level: '',
  });

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsApi.getRecommendations(filters);
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to load recommendation feed:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSwipe = async (jobId, direction) => {
    try {
      await jobsApi.recordSwipe(jobId, direction);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      company_type: '',
      remote: '',
      job_type: '',
      salary_min: '',
      skills: '',
      location: '',
      experience_level: '',
    });
  };

  const handleResetSwipes = async () => {
    try {
      await jobsApi.resetSwipes();
      handleResetFilters();
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to reset swipes:', err);
    }
  };

  const handleOpenATS = (job = null) => {
    setSelectedJob(job);
    setIsATSModalOpen(true);
  };

  const handleOpenCoverLetter = (job) => {
    setSelectedJob(job);
    setIsCoverLetterOpen(true);
  };

  const handleOpenInterviewPrep = (job = null) => {
    if (job) setSelectedJob(job);
    setIsInterviewPrepOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenPostJob={() => setIsPostModalOpen(true)}
        onOpenResumeATS={() => handleOpenATS(null)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Job Discovery Feed
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Swipe right to apply / save, left to skip. Swiped roles will never re-appear in your feed.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenATS(null)}
              className="flex items-center space-x-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>AI Resume & ATS</span>
            </button>

            <button
              onClick={() => handleOpenInterviewPrep(jobs[0] || null)}
              className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Interview Prep</span>
            </button>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              <Filter className="w-4 h-4 text-teal-600" />
              <span>Filter Feed</span>
            </button>

            <button
              onClick={handleResetSwipes}
              title="Reset swipe history and reload all jobs"
              className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-teal-600 bg-slate-100 hover:bg-teal-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span>Reset & Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout: Desktop Sidebar Filters + Swipe Deck Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Filter Panel */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Swipe Deck Container (Center) */}
          <div className="lg:col-span-8 flex justify-center py-2">
            <SwipeDeck
              jobs={jobs}
              loading={loading}
              onSwipe={handleSwipe}
              onResetFilters={handleResetFilters}
              onResetSwipes={handleResetSwipes}
              onOpenATS={handleOpenATS}
              onOpenCoverLetter={handleOpenCoverLetter}
            />
          </div>

        </div>
      </main>

      {/* Mobile Drawer Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-4 shadow-2xl">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Recruiter Post Job Modal */}
      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onJobCreated={fetchRecommendations}
      />

      {/* Milestone 3 Resume & ATS Modal */}
      <ResumeATSModal
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
        job={selectedJob}
        onOpenInterviewPrep={() => {
          setIsATSModalOpen(false);
          setIsInterviewPrepOpen(true);
        }}
      />

      {/* AI Cover Letter Modal */}
      <AICoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        job={selectedJob}
      />

      {/* AI Mock Interview Prep Modal */}
      <AIInterviewPrepModal
        isOpen={isInterviewPrepOpen}
        onClose={() => setIsInterviewPrepOpen(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default Discover;

