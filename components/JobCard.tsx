
import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onAskAI: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave, onAskAI }) => {
  return (
    <div className="glass-card rounded-2xl p-4 mb-4 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-white leading-tight mb-1">{job.title}</h3>
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <span className="font-medium text-indigo-400 mr-2">{job.company}</span>
            <span className="opacity-50">•</span>
            <span className="ml-2 flex items-center">
              <i className="fa-solid fa-location-dot mr-1 text-xs"></i>
              {job.location}
            </span>
          </div>
        </div>
        <button 
          onClick={() => onToggleSave(job)}
          className={`w-10 h-10 flex items-center justify-center rounded-full glass-card border-none transition-colors ${isSaved ? 'text-yellow-400' : 'text-gray-500'}`}
        >
          <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {job.source}
        </span>
        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-white/5 text-gray-400 border border-white/10">
          Real Listing
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onAskAI(job)}
          className="py-3 px-4 rounded-xl glass-card text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10 transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2 text-xs"></i>
          Ask AI
        </button>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="py-3 px-4 rounded-xl gradient-button text-sm font-bold text-white text-center hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          Apply Now
          <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-xs"></i>
        </a>
      </div>
    </div>
  );
};

export default JobCard;
