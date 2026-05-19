import React, { useState } from 'react';
import { logCall } from '../api';

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const PostCallLogger = () => {
  const [prospectName, setProspectName] = useState('');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('first_contact');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospectName.trim() || !summary.trim()) return;
    setLoading(true);
    try {
      const data = await logCall(prospectName, summary, outcome);
      setMessage(data.message);
      setSummary('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Log interaction</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={prospectName} onChange={(e) => setProspectName(e.target.value)} placeholder="Prospect name" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Call notes" className="w-full min-h-[96px] resize-none border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
        <div className="relative">
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
            <option value="first_contact">First contact</option><option value="objection_logged">Objection logged</option><option value="positive_signal">Positive signal</option><option value="deal_progressed">Deal progressed</option>
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
        </div>
        <button type="submit" disabled={loading} className="min-w-[100px] bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {loading ? <>{spinner}Loading...</> : 'Save to memory'}
        </button>
      </form>
      {message && <p className="text-[12px] text-gray-500">{message}</p>}
    </div>
  );
};

export default PostCallLogger;
