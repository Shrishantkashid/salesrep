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
    const interval = setInterval(fetchHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'brief', label: 'Pre-call brief' },
    { id: 'logger', label: 'Post-call logger' },
    { id: 'timeline', label: 'Memory timeline' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">SalesMemory</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            !useMemory ? 'bg-gray-400' :
            health.status === 'ok' ? 'bg-green-500 animate-pulse' : 
            health.status === 'loading' ? 'bg-gray-300' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-600">
            {!useMemory ? 'Memory Offline' :
             health.status === 'ok' ? 'Hindsight connected' : 
             health.status === 'loading' ? 'Connecting...' : 'Connection Error'}
          </span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 flex justify-center sticky top-[65px] z-40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {activeTab === 'brief' && <PreCallBrief useMemory={useMemory} setUseMemory={setUseMemory} />}
        {activeTab === 'logger' && <PostCallLogger />}
        {activeTab === 'timeline' && <MemoryTimeline />}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100 bg-white">
        Powered by Hindsight Agent Memory
      </footer>
    </div>
  );
}

export default App;
