import React, { useState, useEffect } from 'react';
import PreCallBrief from './components/PreCallBrief';
import PostCallLogger from './components/PostCallLogger';
import MemoryTimeline from './components/MemoryTimeline';
import WeeklyDigest from './components/WeeklyDigest';
import { checkHealth } from './api';

function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-hidden flex items-center justify-center px-6">
      <div className="aurora-bg"></div>
      <section className="relative z-10 max-w-5xl w-full rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl shadow-violet-950/40 p-8 md:p-14 fade-up">
        <p className="text-cyan-300 text-xs tracking-[0.26em] uppercase font-semibold mb-5">SalesMemory Platform</p>
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl">
          Build context before every sales conversation.
        </h1>
        <p className="mt-6 max-w-2xl text-slate-300 leading-relaxed text-base md:text-lg">
          Launch your AI-powered workspace to prepare pre-call briefs, log outcomes, and explore timeline memory for every prospect.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            onClick={onEnter}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:from-cyan-400 hover:to-violet-400 transition-all shadow-lg shadow-cyan-900/40"
          >
            Enter Workspace
          </button>
          <span className="text-slate-400 text-sm">Takes you to the Pre-call brief home tab.</span>
        </div>
      </section>
    </div>
  );
}

function AppHome() {
  const [activeTab, setActiveTab] = useState('brief');
  const [useMemory, setUseMemory] = useState(true);
  const [health, setHealth] = useState({ status: 'loading', hindsight: 'unknown' });

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkHealth();
      setHealth(data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'brief', label: 'Pre-call brief' },
    { id: 'logger', label: 'Log call' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'week', label: 'My week' }
  ];

  return (
    <div className="min-h-screen text-gray-900 font-sans bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="h-14 md:h-16 px-4 md:px-6 max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-[15px] font-bold tracking-tight text-gray-900">SalesMemory</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              !useMemory ? 'bg-slate-500' :
              health.status === 'ok' ? 'bg-emerald-400 animate-pulse' :
              health.status === 'loading' ? 'bg-slate-400' : 'bg-rose-500'
            }`} />
            <span className="text-[12px] text-gray-500">
              {!useMemory ? 'Memory Offline' :
               health.status === 'ok' ? 'Hindsight connected' :
               health.status === 'loading' ? 'Connecting...' : 'Connection Error'}
            </span>
          </div>
        </div>

        <nav className="overflow-x-auto border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 md:px-6 flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 text-[13px] border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-900 font-semibold border-gray-900'
                    : 'text-gray-400 font-medium border-transparent hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="px-4 py-5 md:px-6 md:py-6 max-w-5xl mx-auto w-full">
        {activeTab === 'brief' && <PreCallBrief useMemory={useMemory} setUseMemory={setUseMemory} />}
        {activeTab === 'logger' && <PostCallLogger />}
        {activeTab === 'timeline' && <MemoryTimeline />}
        {activeTab === 'week' && <WeeklyDigest />}
      </main>
    </div>
  );
}

function App() {
  const [inWorkspace, setInWorkspace] = useState(false);

  if (!inWorkspace) {
    return <LandingPage onEnter={() => setInWorkspace(true)} />;
  }

  return <AppHome />;
}

export default App;
