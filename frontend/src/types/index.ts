export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  target_role?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ScoreBreakdown {
  ats_compatibility: number;
  skills: number;
  experience: number;
  education: number;
  projects: number;
  formatting: number;
  keywords: number;
}

export interface ExtractedInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  total_experience_years: number;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  certifications: string[];
}

export interface SkillsDetected {
  technical: string[];
  soft: string[];
  tools: string[];
  all: string[];
}

export interface SuggestionItem {
  category: string;
  problem: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  overall_score: number;
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  extracted_info: ExtractedInfo;
  skills_detected: SkillsDetected;
  ats_warnings: string[];
  suggestions: SuggestionItem[];
  created_at: string;
}

export interface ResumeItem {
  id: number;
  user_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
  overall_score?: number;
  ats_score?: number;
  skills_count?: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  required_skills: string[];
  experience_required: number;
  salary_range?: string;
  job_type: string;
  remote_status: string;
  source?: string;
  external_url?: string;
  is_realtime?: boolean;
  created_at: string;
  is_saved?: boolean;
}

export interface JobMatchCard {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  job_type: string;
  remote_status: string;
  experience_required: number;
  required_skills: string[];
  source?: string;
  external_url?: string;
  is_realtime?: boolean;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  score_breakdown: {
    skills: number;
    tfidf: number;
    experience: number;
    education: number;
    keywords: number;
  };
  why_recommended: string;
  is_saved: boolean;
}

export interface LiveJobProvider {
  id: string;
  name: string;
  description: string;
  type: string;
  auth_required: boolean;
  status: string;
  category: string;
}

export interface SyncLiveJobsResponse {
  success: boolean;
  total_fetched: number;
  newly_added: number;
  updated: number;
  sources: string[];
  message: string;
}

export interface JobApplication {
  id: number;
  user_id: number;
  job_id: number;
  resume_id?: number;
  status: string;
  applied_at: string;
  job_title?: string;
  company?: string;
}

export interface LearningItem {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  estimated_weeks: number;
}

export interface SkillGapData {
  job_id: number;
  job_title: string;
  company: string;
  skills_you_have: string[];
  skills_you_need: string[];
  match_percentage: number;
  learning_path: LearningItem[];
}

export interface CustomJDAnalysisResult {
  match_percentage: number;
  skills_match_score: number;
  text_similarity_score: number;
  matching_skills: string[];
  missing_skills: string[];
  important_keywords: string[];
  experience_assessment: string;
  recommendations: Array<{ category: string; text: string }>;
}

export interface DashboardStats {
  has_resume: boolean;
  latest_resume_id?: number;
  latest_resume_filename?: string;
  resume_score: number;
  ats_score: number;
  best_score: number;
  jobs_matched: number;
  skills_count: number;
  missing_skills_count: number;
  score_breakdown?: ScoreBreakdown;
  score_history: Array<{ name: string; score: number; ats: number; date: string }>;
  skill_distribution: Array<{ name: string; value: number }>;
  top_recommended_jobs: Array<any>;
  top_missing_skills: string[];
  suggestions_count: number;
}
