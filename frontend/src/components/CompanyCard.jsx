import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ExternalLink, Briefcase, Sparkles, ChevronRight } from 'lucide-react';

const CompanyCard = ({ company }) => {
  if (!company) return null;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'mnc':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            MNC
          </span>
        );
      case 'newly_founded':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Newly Founded
          </span>
        );
      case 'startup':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Startup
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-teal-900 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            {company.name ? company.name.charAt(0) : 'C'}
          </div>
          {getTypeBadge(company.type)}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
          {company.name}
        </h3>

        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 mb-3">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {company.location || 'Global'}
          </span>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-teal-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Website
            </a>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {company.description || 'Leading innovation and hiring talented engineering and product professionals.'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
          <Briefcase className="w-4 h-4 text-teal-600" />
          <span>{company.open_jobs_count || 0} Open Roles</span>
        </div>

        <Link
          to={`/companies/${company.id}`}
          className="flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700 hover:translate-x-0.5 transition-transform"
        >
          <span>View Company</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
