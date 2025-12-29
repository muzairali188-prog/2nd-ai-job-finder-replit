import React, { useState, useEffect } from 'react';
import { Job, SearchQuery, AIAnalysis } from './types';
import { searchRealJobs, getJobInsights, isApiConfigured } from './geminiService';
import { sounds } from './soundService';
import JobCard from './components/JobCard';
import AIAssistantModal from './components/AIAssistantModal';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Singapore", "United Arab Emirates", "Japan",
  "Argentina", "Austria", "Belgium", "Brazil", "China", "Denmark", "Egypt", "Finland", "Hong Kong", "Indonesia", "Ireland", "Israel", "Italy", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Norway", "Philippines", "Poland", "Portugal", "Qatar", "Saudi Arabia", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Vietnam"
].sort();

const App: React.FC = () => {
  const [query, setQuery] = useState<SearchQuery>({ title: '', country: 'United States' });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedJobs, setSavedJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem('saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [view, setView] = useState<'search' | 'saved'>('search');
  const [selectedJobForAI, setSelectedJobForAI] = useState<Job | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const apiReady = isApiConfigured();

  useEffect(() => {
    localStorage.setItem('saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.title.trim()) return;

    sounds.playAction();
    setLoading(true);
    setError(null);
    setView('search');

    try {
      const results = await searchRealJobs(query.title, query.country);
      setJobs(results);
      if (results.length === 0) {
        setError("No verified listings found for this search.");
      } else {
        sounds.playSuccess();
      }
    } catch (err: any) {
      sounds.playError();
      setError("Failed to connect to search service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (job: Job) => {
    sounds.playTap();
    setSavedJobs(prev => {
      const isSaved = prev.some(sj => sj.id === job.id);
      if (isSaved) return prev.filter(sj => sj.id !== job.id);
      return [job, ...prev];
    });
  };

  const handleAskAI = async (job: Job) => {
    sounds.playAction();
    setSelectedJobForAI(job);
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const insights = await getJobInsights(job.title, query.country);
      setAiAnalysis(insights);
    } catch (e) {
      // Handled by modal UI
    } finally {
      setAiLoading(false);
    }
  };

  if (!apiReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0e14] text-center">
        <div className="glass-card p-8 rounded-3xl max-w-sm">
          <i className="fa-solid fa-key text-indigo-500 text-3xl mb-4"></i>
          <h1 className="text-xl font-bold mb-2">Setup API Key</h1>
          <p className="text-gray-400 text-sm mb-4">Add your Gemini API Key to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto">
      <header className="p-6 pt-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <i className="fa-solid fa-magnifying-glass text-white"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Job Finder</h1>
        </div>
        <button className="text-gray-500 text-lg">
          <i className="fa-solid fa-gear"></i>
        </button>
      </header>

      <main className="px-6 space-y-6">
        <section className="glass-card p-5 rounded-2xl">
          <form onSubmit={handleSearch} className="space-y-3">
            <input 
              type="text" 
              placeholder="Job title..."
              value={query.title}
              onChange={e => setQuery(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <select 
              value={query.country}
              onChange={e => setQuery(prev => ({ ...prev, country: e.target.value }))}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white appearance-none"
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  Searching...
                </div>
              ) : 'Search Jobs'}
            </button>
          </form>
        </section>

        <div className="flex space-x-2">
          <button 
            onClick={() => { sounds.playTap(); setView('search'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${view === 'search' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            Listings
          </button>
          <button 
            onClick={() => { sounds.playTap(); setView('saved'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${view === 'saved' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            Saved ({savedJobs.length})
          </button>
        </div>

        <section>
          {error && view === 'search' && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {view === 'search' && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isSaved={savedJobs.some(sj => sj.id === job.id)} 
                  onToggleSave={toggleSaveJob}
                  onAskAI={handleAskAI}
                />
              ))}
            </div>
          )}

          {view === 'saved' && (
            <div className="space-y-4">
              {savedJobs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <i className="fa-regular fa-bookmark text-2xl mb-3 block"></i>
                  <p className="text-sm">No saved jobs yet.</p>
                </div>
              ) : (
                savedJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isSaved={true} 
                    onToggleSave={toggleSaveJob}
                    onAskAI={handleAskAI}
                  />
                ))
              )}
            </div>
          )}

          {!loading && jobs.length === 0 && view === 'search' && !error && (
            <div className="text-center py-20 opacity-40">
              <i className="fa-solid fa-briefcase text-4xl mb-4"></i>
              <p className="text-sm font-medium">Find your next opportunity</p>
            </div>
          )}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-bottom p-4 flex justify-around">
        <button 
          onClick={() => { sounds.playTap(); setView('search'); }} 
          className={`flex flex-col items-center space-y-1 ${view === 'search' ? 'text-indigo-500' : 'text-gray-600'}`}
        >
          <i className="fa-solid fa-magnifying-glass text-lg"></i>
          <span className="text-[10px] font-bold">Search</span>
        </button>
        <button 
          onClick={() => { sounds.playTap(); setView('saved'); }} 
          className={`flex flex-col items-center space-y-1 ${view === 'saved' ? 'text-indigo-500' : 'text-gray-600'}`}
        >
          <i className="fa-solid fa-bookmark text-lg"></i>
          <span className="text-[10px] font-bold">Saved</span>
        </button>
      </nav>

      {selectedJobForAI && (
        <AIAssistantModal 
          job={selectedJobForAI}
          country={query.country}
          loading={aiLoading}
          analysis={aiAnalysis}
          onClose={() => setSelectedJobForAI(null)}
        />
      )}
    </div>
  );
};

export default App;