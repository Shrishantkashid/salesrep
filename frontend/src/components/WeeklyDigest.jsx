import React, { useState } from 'react';
import { getDigest } from '../api';

const WeeklyDigest = () => {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setDigest(null);
    try {
      const data = await getDigest();
      setDigest(data);
    } catch (e) {
      if ((e.message || '').includes('malformed JSON')) {
        setError('Brief generation failed — try again in a moment.');
      } else {
        setError(e.message || 'Failed to generate digest. Check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Weekly digest</h2>
        <p className="text-[13px] text-gray-600 leading-relaxed">Generate a summary for this week.</p>
        <button onClick={handleGenerate} disabled={loading} aria-label="Generate weekly digest" className="min-w-[100px] bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2">{loading ? (<span className="flex items-center gap-2"><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Generating...</span>) : 'Generate my week'}</button>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>

      {digest && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-4">
          <div className="bg-gray-900 text-white rounded-lg p-3">
            <p className="text-[13px] font-medium">{digest.summary_line}</p>
            <p className="text-[11px] opacity-80 mt-1">{digest.total_prospects} prospects • {digest.generated_at}</p>
          </div>

          {digest.summary_line === 'No prospect memory found yet. Log some calls first.' && (
            <p className="text-[13px] text-gray-600">No prospect memory found yet. Log some calls first. <span className="underline">Go to Log call →</span></p>
          )}

          {digest.needs_attention?.length > 0 && <div><h3 className="text-sm font-semibold text-red-700">Needs attention</h3>{digest.needs_attention.map((i, idx) => <div key={idx} className="mt-2 border rounded-lg p-3"><p className="font-medium text-sm">{i.prospect_name} {i.company ? `(${i.company})` : ''}</p><p className="text-xs text-gray-600">{i.reason}</p><p className="text-xs mt-1">Action: {i.action} ({i.urgency})</p></div>)}</div>}
          {digest.follow_up_this_week?.length > 0 && <div><h3 className="text-sm font-semibold text-amber-700">Follow up this week</h3>{digest.follow_up_this_week.map((i, idx) => <div key={idx} className="mt-2 border rounded-lg p-3"><p className="font-medium text-sm">{i.prospect_name} {i.company ? `(${i.company})` : ''}</p><p className="text-xs text-gray-600">{i.reason}</p><p className="text-xs mt-1">Action: {i.action} (Health: {i.deal_health_score})</p></div>)}</div>}
          {digest.on_track?.length > 0 && <div><h3 className="text-sm font-semibold text-green-700">On track</h3>{digest.on_track.map((i, idx) => <div key={idx} className="mt-2 border rounded-lg p-3"><p className="font-medium text-sm">{i.prospect_name} {i.company ? `(${i.company})` : ''}</p><p className="text-xs text-gray-600">{i.status}</p><p className="text-xs mt-1">Next touchpoint: {i.next_touchpoint}</p></div>)}</div>}
        </div>
      )}
    </div>
  );
};

export default WeeklyDigest;
