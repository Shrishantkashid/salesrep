import React, { useState } from 'react';
import { getBrief } from '../api';
import DealHealthCard from './DealHealthCard';

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const PreCallBrief = ({ useMemory, setUseMemory }) => {
  const [prospectName, setProspectName] = useState('');
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospectName.trim()) return;
    setLoading(true);
    setError('');
    try {
      setBrief(await getBrief(prospectName, useMemory));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Prepare for call</h2>
          <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1">
            <button onClick={() => setUseMemory(false)} className={`px-3 py-1 rounded-full text-[12px] ${!useMemory ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>OFF</button>
            <button onClick={() => setUseMemory(true)} className={`px-3 py-1 rounded-full text-[12px] ${useMemory ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>ON</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input value={prospectName} onChange={(e) => setProspectName(e.target.value)} placeholder="Enter prospect name" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          <button type="submit" disabled={loading} className="min-w-[100px] bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2">{loading ? <>{spinner}Loading...</> : 'Brief me'}</button>
        </form>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>

      {brief && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{brief.prospect_name}</h3>
              <p className="text-[12px] text-gray-500">{brief.last_contacted ? `Last contacted ${brief.last_contacted}` : 'First interaction'}</p>
            </div>
          </div>
          {brief.memory_backed && brief.deal_health && <DealHealthCard dealHealth={brief.deal_health} />}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">What to focus on today</h4>
            <p className="text-[13px] text-gray-600 leading-relaxed">{brief.focus_today || 'No focus generated yet.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreCallBrief;
