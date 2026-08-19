import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CompanyCard from '../components/CompanyCard';
import PostJobModal from '../components/PostJobModal';
import { jobsApi } from '../services/jobsApi';
import { Building2, Search, Sparkles } from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [selectedType]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.getCompanies(selectedType || null);
      setCompanies(data || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenPostJob={() => setIsPostModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-teal-600 font-semibold text-xs uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Startup & MNC Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Explore Hiring Companies
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Browse verified tech enterprises, fast-growing startups, and newly founded companies actively recruiting on SwipeX.
          </p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* Tabs for Company Types */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
            {[
              { id: '', label: 'All' },
              { id: 'mnc', label: 'MNC Enterprises' },
              { id: 'startup', label: 'Startups' },
              { id: 'newly_founded', label: 'Newly Founded' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === tab.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Companies Found</h3>
            <p className="text-xs text-slate-500">Try clearing your search or switching company classification tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

      </main>

      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onJobCreated={fetchCompanies}
      />
    </div>
  );
};

export default Companies;
