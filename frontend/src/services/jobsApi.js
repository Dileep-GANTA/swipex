import api from './api';

export const jobsApi = {
  // Recommendations feed (unswiped jobs with filters)
  getRecommendations: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/recommendations?${params.toString()}`);
    return response.data;
  },

  // All jobs listing
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Single job details
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Create job (Recruiter)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Record a swipe (direction: 'left' | 'right')
  recordSwipe: async (jobId, direction) => {
    const response = await api.post('/swipes', {
      job_id: jobId,
      direction: direction,
    });
    return response.data;
  },

  // Get user swipes (direction optional: 'left' | 'right')
  getSwipes: async (direction = null) => {
    const url = direction ? `/swipes?direction=${direction}` : '/swipes';
    const response = await api.get(url);
    return response.data;
  },

  // Reset/Clear user swipe history
  resetSwipes: async () => {
    const response = await api.delete('/swipes');
    return response.data;
  },


  // List companies
  getCompanies: async (type = null) => {
    const url = type ? `/companies?type=${type}` : '/companies';
    const response = await api.get(url);
    return response.data;
  },

  // Single company detail
  getCompanyById: async (companyId) => {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },

  // Create company (Recruiter)
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  // Milestone 3: Upload Resume PDF/DOCX
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Milestone 3: Get user's current uploaded resume
  getMyResume: async () => {
    const response = await api.get('/resumes/me');
    return response.data;
  },

  // Milestone 3: Analyze resume ATS compatibility against a job
  analyzeResumeForJob: async (jobId) => {
    const response = await api.post(`/resumes/analyze/${jobId}`);
    return response.data;
  },

  // Milestone 3 AI Tools: Generate AI Cover Letter
  generateCoverLetter: async (jobId) => {
    const response = await api.post(`/resumes/cover-letter/${jobId}`);
    return response.data;
  },

  // Milestone 3 AI Tools: Generate AI Mock Interview Prep
  generateInterviewPrep: async (jobId) => {
    const response = await api.post(`/resumes/interview-prep/${jobId}`);
    return response.data;
  },
};

