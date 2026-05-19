import React, { useState } from 'react';
import { getTimeline } from '../api';

const MemoryTimeline = () => {
  const [prospectName, setProspectName] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospectName.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await getTimeline(prospectName);
      setTimeline(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (outcome) => {
    switch (outcome) {
      case 'first_contact': return 'bg-gray-100 text-slate-300';
      case 'objection_logged': return 'bg-amber-100 text-amber-700';
      case 'positive_signal': return 'bg-blue-100 text-cyan-200';
      case 'deal_progressed': return 'bg-green-100 text-emerald-200';
      default: return 'bg-gray-100 text-slate-300';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900/70 p-6 rounded-lg shadow-sm mb-8 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">View History</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            placeholder="Enter prospect name"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 text-white px-6 py-2 rounded-md hover:bg-cyan-400 transition-colors disabled:bg-cyan-800"
          >
            {loading ? 'Loading...' : 'Load timeline'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {timeline && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-100">Timeline for {timeline.prospect_name}</h3>
            <span className="text-sm text-slate-400">{timeline.total_interactions} interactions found</span>
          </div>

          {timeline.interactions.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No memory found for this prospect yet.</p>
          ) : (
            <div className="relative border-l-2 border-white/15 ml-4 pl-8 space-y-8">
              {timeline.interactions.map((interaction, i) => (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[41px] top-0 w-6 h-6 bg-slate-900/70 border-2 border-blue-600 rounded-full z-10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  
                  <div className="bg-slate-900/70 p-5 rounded-lg border border-white/10 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-400">{new Date(interaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getBadgeColor(interaction.outcome)}`}>
                        {interaction.outcome.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-sm">{interaction.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryTimeline;
