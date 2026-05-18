import React, { useState } from 'react';
import { logCall } from '../api';

const PostCallLogger = () => {
  const [prospectName, setProspectName] = useState('');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('first_contact');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospectName.trim() || !summary.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await logCall(prospectName, summary, outcome);
      setMessage(data.message);
      setSummary(''); // Clear summary after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6">Log Interaction</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prospect Name</label>
          <input
            type="text"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            placeholder="Priya Sharma"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Call Notes</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What happened? Objections raised, decisions made, next steps..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-gray-800 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="first_contact">First contact</option>
            <option value="objection_logged">Objection logged</option>
            <option value="positive_signal">Positive signal</option>
            <option value="deal_progressed">Deal progressed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Saving to Hindsight...' : 'Save to memory'}
        </button>
      </form>

      {message && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-100 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
};

export default PostCallLogger;
