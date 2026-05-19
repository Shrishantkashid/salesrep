import React, { useState, useEffect } from 'react';
import PreCallBrief from './components/PreCallBrief';
import PostCallLogger from './components/PostCallLogger';
import MemoryTimeline from './components/MemoryTimeline';
import { checkHealth } from './api';

function App() {
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
    { id: 'logger', label: 'Post-call logger' },
    { id: 'timeline', label: 'Memory timeline' }
  ];

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-hidden">
      <div className="aurora-bg"></div>

      <header className="relative z-20 backdrop-blur-xl bg-slate-950/45 border-b border-white/10 py-4 px-6 md:px-10 flex justify-between items-center sticky top-0">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">SalesMemory</h1>
        <div className="flex items-center gap-2.5 rounded-full px-3 py-1.5 bg-white/5 border border-white/10">
          <div className={`w-2.5 h-2.5 rounded-full ${
            !useMemory ? 'bg-slate-500' :
            health.status === 'ok' ? 'bg-emerald-400 animate-pulse' :
            health.status === 'loading' ? 'bg-slate-400' : 'bg-rose-500'
          }`}></div>
          <span className="text-xs md:text-sm font-medium text-slate-200">
            {!useMemory ? 'Memory Offline' :
             health.status === 'ok' ? 'Hindsight connected' :
             health.status === 'loading' ? 'Connecting...' : 'Connection Error'}
          </span>
        </div>
      </header>

      <section className="relative z-10 px-6 md:px-10 pt-10 pb-8 fade-up">
        <div className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-violet-950/30 p-8 md:p-12">
          <p className="text-cyan-300 text-xs tracking-[0.22em] uppercase font-semibold mb-4">AI Sales Co-pilot</p>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight max-w-3xl text-balance">
            Turn every customer conversation into momentum.
          </h2>
          <p className="mt-5 max-w-2xl text-slate-300 leading-relaxed">
            Brief smarter, log faster, and unlock relationship memory with a cinematic workspace built for modern sales teams.
          </p>
        </div>
      </section>

      <nav className="relative z-20 flex justify-center px-6">
        <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 md:px-8 py-3 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="relative z-10 flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full fade-up animation-delay-200">
        {activeTab === 'brief' && <PreCallBrief useMemory={useMemory} setUseMemory={setUseMemory} />}
        {activeTab === 'logger' && <PostCallLogger />}
        {activeTab === 'timeline' && <MemoryTimeline />}
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-400 text-sm border-t border-white/10 bg-slate-950/30 backdrop-blur-md">
        Powered by Hindsight Agent Memory
      </footer>
    </div>
  );
}

export default App;
