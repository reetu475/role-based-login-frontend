import axios from 'axios';
import type { User, LoginRequest, LoginResponse, Job, Application, HuggingFaceRankedApplication } from '../types';

// Configure base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:9090/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (user: User): Promise<{ message: string; email?: string; role?: string }> => {
    const response = await api.post('/auth/register', user);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<{ token: string; role: string; email: string }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// Job API
export const jobAPI = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  getAllJobsForAdmin: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs/all');
    return response.data;
  },

  getJobsByEmployee: async (email: string): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs/employee', {
      params: { email },
    });
    return response.data;
  },

  createJob: async (job: Job): Promise<Job> => {
    const response = await api.post('/jobs', job);
    return response.data;
  },

  getPendingJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs/pending');
    return response.data;
  },

  approveJob: async (jobId: number): Promise<Job> => {
    const response = await api.put(`/jobs/${jobId}/approve`);
    return response.data;
  },

  rejectJob: async (jobId: number): Promise<Job> => {
    const response = await api.put(`/jobs/${jobId}/reject`);
    return response.data;
  },

  searchJobs: async (keyword: string): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs/search', {
      params: { keyword },
    });
    return response.data;
  },

  createTestPendingJob: async (): Promise<Job> => {
    const response = await api.post('/jobs/test-pending');
    return response.data;
  },
};

// Application API
export const applicationAPI = {
  getApplicationsByStudent: async (email: string): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/student', {
      params: { email },
    });
    return response.data;
  },

  getApplicationsByEmployee: async (email: string): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/employee', {
      params: { email },
    });
    return response.data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/all');
    return response.data;
  },

  createApplication: async (formData: FormData): Promise<Application> => {
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateApplicationStatus: async (applicationId: number, status: string): Promise<Application> => {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data;
  },

  analyzeResume: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/applications/analyze-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Admin API endpoints
export const adminAPI = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/admin/jobs');
    return response.data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/admin/applications');
    return response.data;
  },

  approveJob: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/admin/approve-job/${id}`);
    return response.data;
  },

  rejectJob: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/admin/reject-job/${id}`);
    return response.data;
  },

  // Hugging Face AI Resume Ranking endpoints
  rankResumes: async (jobId: number, keywords?: string) => {
    const response = await api.post('/admin/rank-resumes', null, {
      params: { jobId, keywords }
    });
    return response.data;
  },

  rankResumesTop: async (jobId: number, keywords?: string, topN: number = 5) => {
    const response = await api.post('/admin/rank-resumes/top', null, {
      params: { jobId, keywords, topN }
    });
    return response.data;
  },

  getTop3Candidates: async (jobId: number, keywords?: string) => {
    const response = await api.post('/admin/rank-resumes/top3', null, {
      params: { jobId, keywords }
    });
    return response.data;
  },
};


export default api;
