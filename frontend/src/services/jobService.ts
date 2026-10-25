import api from './api';
import {
  Job,
  JobMatchCard,
  JobApplication,
  SkillGapData,
  CustomJDAnalysisResult,
  DashboardStats,
  User,
  LiveJobProvider,
  SyncLiveJobsResponse,
} from '../types';

export const jobService = {
  async searchJobs(params: {
    q?: string;
    location?: string;
    remote_status?: string;
    job_type?: string;
    min_exp?: number;
    source?: string;
    is_realtime?: boolean;
    india_only?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: Job[]; total: number; page: number; pages: number }> {
    const res = await api.get('/jobs', { params });
    return res.data;
  },

  async syncLiveJobs(limitPerSource = 15): Promise<SyncLiveJobsResponse> {
    const res = await api.post('/jobs/sync-live', null, {
      params: { limit_per_source: limitPerSource },
    });
    return res.data;
  },

  async syncIndiaJobs(limit = 25): Promise<SyncLiveJobsResponse> {
    const res = await api.post('/jobs/sync-india', null, {
      params: { limit },
    });
    return res.data;
  },

  async getLiveProviders(): Promise<LiveJobProvider[]> {
    const res = await api.get('/jobs/live-providers');
    return res.data;
  },

  async getJobDetail(jobId: number): Promise<Job> {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  },

  async getRecommendations(resumeId: number, limit = 20): Promise<JobMatchCard[]> {
    const res = await api.get(`/jobs/recommendations/${resumeId}`, { params: { limit } });
    return res.data;
  },

  async saveJob(jobId: number): Promise<{ message: string }> {
    const res = await api.post(`/jobs/${jobId}/save`);
    return res.data;
  },

  async unsaveJob(jobId: number): Promise<{ message: string }> {
    const res = await api.delete(`/jobs/${jobId}/save`);
    return res.data;
  },

  async getSavedJobs(): Promise<Job[]> {
    const res = await api.get('/jobs/saved/all');
    return res.data;
  },

  async applyJob(jobId: number, resumeId?: number): Promise<JobApplication> {
    const res = await api.post(`/jobs/${jobId}/apply`, { resume_id: resumeId });
    return res.data;
  },

  async getApplications(): Promise<JobApplication[]> {
    const res = await api.get('/jobs/applications/all');
    return res.data;
  },

  async analyzeCustomJD(
    resumeId: number,
    jobDescription: string,
    jobTitle = 'Target Role'
  ): Promise<CustomJDAnalysisResult> {
    const res = await api.post('/jobs/analyze-jd', {
      resume_id: resumeId,
      job_description: jobDescription,
      job_title: jobTitle,
    });
    return res.data;
  },

  async getSkillGap(resumeId: number, jobId: number): Promise<SkillGapData> {
    const res = await api.post('/skills/gap-analysis', {
      resume_id: resumeId,
      job_id: jobId,
    });
    return res.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  async getInDemandSkills(): Promise<Array<{ skill: string; count: number }>> {
    const res = await api.get('/analytics/in-demand-skills');
    return res.data;
  },

  // Admin APIs
  async getAdminStats(): Promise<{
    total_users: number;
    total_resumes: number;
    total_analyses: number;
    total_jobs: number;
    average_resume_score: number;
    average_ats_score: number;
  }> {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getAllUsers(): Promise<User[]> {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async createJob(jobData: any): Promise<Job> {
    const res = await api.post('/admin/jobs', jobData);
    return res.data;
  },

  async updateJob(jobId: number, jobData: any): Promise<Job> {
    const res = await api.put(`/admin/jobs/${jobId}`, jobData);
    return res.data;
  },

  async deleteJob(jobId: number): Promise<{ message: string }> {
    const res = await api.delete(`/admin/jobs/${jobId}`);
    return res.data;
  },
};
