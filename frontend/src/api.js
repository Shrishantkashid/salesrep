const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getBrief = async (prospectName, useMemory = true) => {
  const response = await fetch(`${BASE}/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prospect_name: prospectName, use_memory: useMemory })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch brief');
  }
  return response.json();
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${BASE}/health`);
    return await response.json();
  } catch (err) {
    return { status: 'error', hindsight: 'disconnected' };
  }
};

export async function logCall(prospectName, summary, outcome) {
  const res = await fetch(`${BASE}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prospect_name: prospectName, summary, outcome })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to log call');
  }
  return res.json();
}

export async function getTimeline(prospectName) {
  const res = await fetch(`${BASE}/timeline/${encodeURIComponent(prospectName)}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch timeline');
  }
  return res.json();
}
