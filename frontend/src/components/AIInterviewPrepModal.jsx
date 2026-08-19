import React, { useState, useEffect } from 'react';
import { jobsApi } from '../services/jobsApi';
import { X, Sparkles, HelpCircle, Lightbulb, Loader2 } from 'lucide-react';

const AIInterviewPrepModal = ({ isOpen, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeHintIndex, setActiveHintIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && job && job.id) {
      fetchInterviewPrep();
    }
  }, [isOpen, job]);

  const fetchInterviewPrep = async () => {
    setLoading(true);
    setError('');
    setActiveHintIndex(null);
    setQuestions([]);
    try {
      const res = await jobsApi.generateInterviewPrep(job.id);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Failed to generate interview prep:', err);
      setError(err.response?.data?.error?.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 my-8 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900">AI Mock Interview Questions</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                Prep Coach
              </span>
            </div>
            <p className="text-xs text-slate-500">
              5 tailored technical & behavioral interview questions for {job ? job.title : 'target role'}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center animate-spin mb-3">
              <Loader2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Analyzing Role & Resume Skill Gaps...</p>
            <p className="text-xs text-slate-400">Generating tailored interview questions & answer hints.</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {q.type || 'Question'} #{idx + 1}
                    </span>
                    <button
                      onClick={() => setActiveHintIndex(activeHintIndex === idx ? null : idx)}
                      className="text-xs font-semibold text-purple-600 hover:underline flex items-center space-x-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{activeHintIndex === idx ? 'Hide Hint' : 'Answer Hint'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </p>
                  {activeHintIndex === idx && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-in fade-in duration-200">
                      <strong>Tip / Hint:</strong> {q.hint}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={fetchInterviewPrep}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Regenerate Interview Questions</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIInterviewPrepModal;
