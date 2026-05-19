import React, { useState } from 'react';
import { getBrief } from '../api';
import DealHealthCard from './DealHealthCard';

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
      const data = await getBrief(prospectName, useMemory);
      setBrief(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Search and Toggle Control Panel */}
      <div className="bg-slate-900/70 p-6 rounded-lg shadow-sm border border-white/15">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Prepare for Call</h2>
          </div>
          
          {/* Custom Dual-State Simple Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/70 p-1.5 rounded-full border border-white/15">
            <button 
              onClick={() => setUseMemory(false)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                !useMemory 
                  ? 'bg-slate-900/70 shadow-sm text-slate-100' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Memory OFF
            </button>
            <button 
              onClick={() => setUseMemory(true)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                useMemory 
                  ? 'bg-cyan-500 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Memory ON
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            placeholder="Enter prospect name (e.g. Priya Sharma)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-2.5 rounded-md text-sm transition-all disabled:bg-cyan-800"
          >
            {loading ? 'Briefing...' : 'Brief me'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Simple White Results Card */}
      {brief && (
        <div className="bg-slate-900/70 rounded-lg shadow-sm border border-white/10 overflow-hidden">
          
          {/* Header metadata row */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/70/50">
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{brief.prospect_name}</h3>
              <p className="text-slate-400 text-sm mt-0.5">
                {brief.last_contacted ? `Last contacted ${brief.last_contacted}` : 'First interaction'}
              </p>
            </div>
            <span className="bg-cyan-500/10 text-cyan-200 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-400/20">
              {brief.interaction_count} interaction{brief.interaction_count !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-6 space-y-6">
            
            {brief.memory_backed && brief.deal_health && (
              <DealHealthCard dealHealth={brief.deal_health} />
            )}

            {/* COMPARISON FLOW: Bypassed blind alert state */}
            {!brief.memory_backed && brief.memory_disabled && (
              <>
                <div className="bg-rose-500/10 p-4 rounded-md text-rose-200 text-sm flex items-start gap-2.5 border border-rose-400/20">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-semibold block text-gray-900 mb-0.5">Entering Blind — Memory Disabled</span>
                    No historic context could be recalled for this prospect because the Hindsight Memory layer is bypassed. You are running this call without memory.
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key objections (unknown)</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-800/70 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/15 border-dashed flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Objections Bypassed
                    </span>
                    <span className="bg-slate-800/70 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/15 border-dashed flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Budget Context Locked
                    </span>
                    <span className="bg-slate-800/70 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/15 border-dashed flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Competitor Intel Locked
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">What to focus on today (Generic discovery)</h4>
                  <p className="text-slate-400 italic bg-slate-800/70 p-4 rounded-md border border-white/10 leading-relaxed text-sm">
                    "Perform basic, non-targeted sales discovery: Introduce yourself, ask about their current pain points, ask what tools they currently use, and request stakeholder details from scratch. Watch out for repeating objections that might have been settled on past calls."
                  </p>
                </div>
              </>
            )}

            {/* COMPARISON FLOW: Active Fresh Lead (no memory recorded yet) */}
            {!brief.memory_backed && !brief.memory_disabled && (
              <div className="bg-slate-800/70 p-5 rounded-md text-slate-300 text-sm border border-white/15 border-dashed space-y-1">
                <span className="font-semibold block text-slate-200">First Interaction</span>
                <p className="text-sm">
                  No prior interactions were found in Hindsight for this prospect. This is your first touchpoint — start fresh!
                </p>
              </div>
            )}

            {/* COMPARISON FLOW: Persistent context recalled successfully */}
            {brief.memory_backed && (
              <>
                <div className="bg-cyan-500/10 p-4 rounded-md text-cyan-200 text-sm flex items-center gap-2 border border-cyan-400/20">
                  <svg className="w-5 h-5 text-cyan-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Hindsight recalled <strong className="text-blue-900">{brief.interaction_count} past interactions</strong> to generate this brief.
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key objections (remembered)</h4>
                  <div className="flex flex-wrap gap-2">
                    {brief.key_objections && brief.key_objections.length > 0 ? (
                      brief.key_objections.map((obj, i) => (
                        <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm border border-amber-100 font-semibold">
                          {obj}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm italic">None recorded</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">What to focus on today</h4>
                  <p className="text-slate-200 leading-relaxed text-sm">
                    {brief.focus_today}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreCallBrief;
