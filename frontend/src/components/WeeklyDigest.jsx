import React, { useState } from 'react';

const WeeklyDigest = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Weekly digest</h2>
        <p className="text-[13px] text-gray-600 leading-relaxed">Generate a summary for this week.</p>
        <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }} disabled={loading} className="min-w-[100px] bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-2">{loading ? 'Loading...' : 'Generate my week'}</button>
      </div>
    </div>
  );
};

export default WeeklyDigest;
