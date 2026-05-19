import React, { useState } from 'react';
import { getTimeline } from '../api';

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const MemoryTimeline = () => {
  const [prospectName, setProspectName] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospectName.trim()) return;
    setLoading(true);
    try { setTimeline(await getTimeline(prospectName)); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Memory timeline</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input value={prospectName} onChange={(e) => setProspectName(e.target.value)} placeholder="Enter prospect name" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          <button type="submit" disabled={loading} className="min-w-[100px] bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2">{loading ? <>{spinner}Loading...</> : 'Load timeline'}</button>
        </form>
      </div>
      {timeline && <div className="space-y-3">{timeline.interactions.map((it, i) => <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3"><p className="text-[12px] text-gray-500">{new Date(it.date).toLocaleDateString()}</p><p className="text-[13px] text-gray-600 leading-relaxed">{it.summary}</p></div>)}</div>}
    </div>
  );
};

export default MemoryTimeline;
