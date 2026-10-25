import api from './api';
import { ResumeItem, ResumeAnalysis } from '../types';

export const resumeService = {
  async uploadResume(file: File, onUploadProgress?: (progressEvent: any) => void): Promise<ResumeAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },

  async listResumes(): Promise<ResumeItem[]> {
    const res = await api.get('/resumes');
    return res.data;
  },

  async getResumeAnalysis(resumeId: number): Promise<ResumeAnalysis> {
    const res = await api.get(`/resumes/${resumeId}`);
    return res.data;
  },

  async deleteResume(resumeId: number): Promise<{ message: string }> {
    const res = await api.delete(`/resumes/${resumeId}`);
    return res.data;
  },

  async updateExtractedInfo(resumeId: number, data: any): Promise<ResumeAnalysis> {
    const res = await api.put(`/resumes/${resumeId}/info`, data);
    return res.data;
  },

  async reanalyzeResume(resumeId: number): Promise<ResumeAnalysis> {
    const res = await api.post(`/resumes/${resumeId}/analyze`);
    return res.data;
  },

  async compareResumes(resumeAId: number, resumeBId: number): Promise<any> {
    const res = await api.post('/resumes/compare', {
      resume_a_id: resumeAId,
      resume_b_id: resumeBId,
    });
    return res.data;
  },
};
