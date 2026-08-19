import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Award, CheckCircle2, TrendingUp, Users, Briefcase, Zap, FileText, ArrowUpRight, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      try {
        setLoading(true);
        const endpoint = user?.role === 'recruiter' 
          ? `${API_BASE_URL}/api/analytics/recruiter`
          : `${API_BASE_URL}/api/analytics/seeker`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token, isRecruiter]);

  if (!user) return null;
  const profile = user.role === 'job_seeker' ? user.job_seeker_profile : user.recruiter_profile;
  const fullName = profile?.full_name || 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold uppercase tracking-wider mb-2 border border-teal-500/30">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>SwipeX Intelligence Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {fullName}!
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                {isRecruiter
                  ? 'Monitor your active job postings, candidate swipe funnels, and hiring pipeline metrics.'
                  : 'Track your job applications, ATS resume score performance, and skill recommendations.'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
              <span className="text-xs text-slate-400 font-medium block">Account Role</span>
              <span className="text-sm font-black text-teal-400 capitalize">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold">Loading dashboard metrics...</div>
        ) : !isRecruiter ? (
          /* JOB SEEKER ANALYTICS */
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics?.total_applications || 0}</p>
                  <p className="text-[11px] text-teal-600 font-semibold mt-2">Swiped Right & Applied</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average ATS Score</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{analytics?.average_ats_score || 82}%</p>
                  <p className="text-[11px] text-purple-600 font-semibold mt-2">Resume Compatibility</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{analytics?.shortlisted_count || 0}</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-2">Recruiter Interest</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{analytics?.interview_count || 0}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-2">Active Scheduled</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Skills & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Skills Parsed */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Parsed Skills Profile</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(analytics?.top_matching_skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Timeline */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Recent Applications Timeline</span>
                </h3>
                {(!analytics?.recent_activity || analytics.recent_activity.length === 0) ? (
                  <p className="text-xs text-slate-400 font-semibold py-8 text-center">No applications recorded yet. Start swiping right on jobs!</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {analytics.recent_activity.map((act, i) => (
                      <div key={i} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{act.job_title}</p>
                          <p className="text-xs text-slate-500">{act.company_name} • {act.date}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold capitalize bg-teal-50 text-teal-700 border border-teal-100">
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* RECRUITER ANALYTICS */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics?.total_active_jobs || 0}</p>
                  <p className="text-[11px] text-teal-600 font-semibold mt-2">Currently Hiring</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{analytics?.total_applicants || 0}</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-2">Right Swipes Received</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{analytics?.shortlisted_candidates || 0}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-2">In Pipeline</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Funnel Conversion Rate</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{analytics?.conversion_rate || 0}%</p>
                  <p className="text-[11px] text-purple-600 font-semibold mt-2">Shortlist Efficiency</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recruiter Recent Applicants */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Recent Candidate Applications</span>
              </h3>
              {(!analytics?.recent_applications || analytics.recent_applications.length === 0) ? (
                <p className="text-xs text-slate-400 font-semibold py-8 text-center">No candidate applications received yet for active postings.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {analytics.recent_applications.map((app, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{app.applicant_name}</p>
                        <p className="text-xs text-slate-500">Applied for {app.job_title} • {app.applied_at}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold capitalize bg-teal-50 text-teal-700 border border-teal-100">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
