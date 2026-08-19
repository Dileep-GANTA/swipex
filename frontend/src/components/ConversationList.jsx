import React from 'react';
import { MessageSquare, User, Building2, Briefcase } from 'lucide-react';

const ConversationList = ({ conversations, activeId, onSelectConversation, loading }) => {
  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-100 animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-xs font-bold text-slate-700">No Conversations Yet</p>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
          Apply to jobs by swiping right to start direct messaging with hiring recruiters!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
      {conversations.map((conv) => {
        const isActive = activeId === conv.id;
        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`w-full p-4 text-left transition-colors flex items-start space-x-3 relative ${
              isActive ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              {conv.other_party_name ? conv.other_party_name[0].toUpperCase() : 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">
                  {conv.other_party_name}
                </h4>
                {conv.unread_count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs">
                    {conv.unread_count} new
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium truncate mb-1">
                <Briefcase className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="truncate">{conv.job_title}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 truncate">{conv.company_name}</span>
              </div>

              <p className="text-[11px] text-slate-400 truncate">
                {conv.last_message || 'Start typing a message...'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
