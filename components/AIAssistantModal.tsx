
import React from 'react';
import { Job, AIAnalysis } from '../types';

interface AIAssistantModalProps {
  job: Job;
  country: string;
  analysis: AIAnalysis | null;
  loading: boolean;
  onClose: () => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ job, country, analysis, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl bg-[#0f1218] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto border-t sm:border border-white/10 shadow-2xl relative">
        <div className="sticky top-0 bg-[#0f1218]/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold">AI Job Insights</h2>
            <p className="text-gray-400 text-sm">{job.title} • {country}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full glass-card">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 shimmer rounded"></div>
                  <div className="h-20 w-full shimmer rounded-xl"></div>
                </div>
              ))}
              <p className="text-center text-gray-500 text-sm animate-pulse">Gemini is analyzing market data...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8 pb-10">
              <section>
                <h3 className="flex items-center text-indigo-400 font-bold mb-3">
                  <i className="fa-solid fa-money-bill-wave mr-2"></i>
                  Estimated Salary
                </h3>
                <div className="glass-card p-4 rounded-2xl border-indigo-500/20">
                  <p className="text-2xl font-bold text-white">{analysis.salaryRange}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Market rate in {country}</p>
                </div>
              </section>

              <section>
                <h3 className="flex items-center text-purple-400 font-bold mb-3">
                  <i className="fa-solid fa-list-check mr-2"></i>
                  Typical Requirements
                </h3>
                <ul className="space-y-2">
                  {analysis.requirements.map((req, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <i className="fa-solid fa-circle-check mt-1 mr-3 text-purple-500 text-[10px]"></i>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="flex items-center text-blue-400 font-bold mb-3">
                  <i className="fa-solid fa-brain mr-2"></i>
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="flex items-center text-green-400 font-bold mb-3">
                  <i className="fa-solid fa-microphone-lines mr-2"></i>
                  Interview Prep
                </h3>
                <div className="space-y-3">
                  {analysis.interviewTips.map((tip, i) => (
                    <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-gray-400 italic">
                      "{tip}"
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Could not retrieve analysis. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
