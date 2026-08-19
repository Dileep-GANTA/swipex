import React, { useState, useEffect } from 'react';
import { jobsApi } from '../services/jobsApi';
import { X, Sparkles, Copy, Check, FileText, Loader2 } from 'lucide-react';

const AICoverLetterModal = ({ isOpen, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && job && job.id) {
      fetchCoverLetter();
    }
  }, [isOpen, job]);

  const fetchCoverLetter = async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    setCoverLetter('');
    try {
      const res = await jobsApi.generateCoverLetter(job.id);
      setCoverLetter(res.cover_letter);
    } catch (err) {
      console.error('Failed to generate cover letter:', err);
      setError(err.response?.data?.error?.message || 'Failed to generate cover letter. Please ensure you are signed in.');
    } finally {
      setLoading(false);
    }
  };


  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900">AI Cover Letter Generator</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700 uppercase tracking-wider">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tailored application cover letter for {job ? job.title : 'target role'}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center animate-spin mb-3">
              <Loader2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Generating Personalized Cover Letter...</p>
            <p className="text-xs text-slate-400">Aligning candidate skills with job description requirements.</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
              {coverLetter}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Cover Letter'}</span>
              </button>

              <button
                onClick={fetchCoverLetter}
                className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AICoverLetterModal;
