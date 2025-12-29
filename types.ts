
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  postedAt?: string;
  description?: string;
}

export interface SearchQuery {
  title: string;
  country: string;
}

export interface AIAnalysis {
  requirements: string[];
  skills: string[];
  salaryRange: string;
  interviewTips: string[];
}

export interface AppState {
  recentSearches: SearchQuery[];
  savedJobs: Job[];
}
