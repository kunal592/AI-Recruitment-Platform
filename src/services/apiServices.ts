import api from './api';

// ── Auth ────────────────────────────────────────────────────────────────────
// Backend: POST /auth/register  → RegisterRequest { full_name, email, password }
// Backend: POST /auth/login     → LoginRequest    { email, password }
// Backend: GET  /auth/me        → UserResponse

export const authService = {
  register: (data: { full_name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),
};

// ── Resume ──────────────────────────────────────────────────────────────────
// Backend: POST /resume/upload → multipart file upload
// Backend: GET  /resume/:id   → ResumeResponse

export const resumeService = {
  upload: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onUploadProgress) {
          onUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },
  getResume: (id: string) => api.get(`/resume/${id}`),
};

// ── Jobs ────────────────────────────────────────────────────────────────────
// Backend: GET  /jobs                → List[JobResponse]
// Backend: GET  /jobs/search?q=...   → List[JobResponse]
// Backend: GET  /jobs/recommendations → RecommendationResponse { recommendations, total }
// Backend: POST /jobs/save           → SaveJobRequest { job_data: dict, notes?: string }
// Backend: GET  /jobs/saved          → { saved_jobs, total }

export const jobService = {
  getJobs: (limit: number = 20) => api.get(`/jobs?limit=${limit}`),
  getJobById: (id: string) => api.get(`/jobs/${id}`),

  searchJobs: (query: string, location?: string, page: number = 1) => {
    const params = new URLSearchParams({ q: query, page: String(page) });
    if (location) params.append('location', location);
    return api.get(`/jobs/search?${params.toString()}`);
  },

  getRecommendations: (limit: number = 10) =>
    api.get(`/jobs/recommendations?limit=${limit}`),

  saveJob: (jobData: Record<string, any>, notes?: string) =>
    api.post('/jobs/save', { job_data: jobData, notes }),

  getSavedJobs: () => api.get('/jobs/saved'),
  getStats: () => api.get('/jobs/stats'),

  addManualApplication: (data: {
    title: string;
    company: string;
    location?: string;
    status: string;
    notes?: string;
  }) => api.post('/jobs/manual-application', data),
};

// ── AI Features ─────────────────────────────────────────────────────────────
// Backend schemas are in schemas/ai.py

export const aiService = {
  /** POST /ai/customize-resume → CustomizeResumeRequest */
  customizeResume: (data: {
    job_description: string;
    resume_id?: string;
    resume_text?: string;
  }) => api.post('/ai/customize-resume', data),

  /** POST /ai/generate-email → GenerateEmailRequest */
  generateEmail: (data: {
    email_type: 'application' | 'follow_up' | 'hr_outreach';
    job_title: string;
    company_name: string;
    job_description?: string;
    candidate_name?: string;
    extra_context?: string;
  }) => api.post('/ai/generate-email', data),

  /** POST /ai/study-plan → StudyPlanRequest */
  getStudyPlan: (data: {
    target_role: string;
    current_skills?: string[];
    duration_days?: number;
  }) => api.post('/ai/study-plan', data),

  /** GET /ai/latest-study-plan */
  getLatestStudyPlan: () => api.get('/ai/latest-study-plan'),
};

// ── Automation ──────────────────────────────────────────────────────────────
// Backend: POST /automation/auto-apply → AutoApplyRequest

export const automationService = {
  autoApply: (data: {
    job_url: string;
    resume_id?: string;
    cover_letter?: string;
    extra_fields?: Record<string, string>;
  }, submit: boolean = false) =>
    api.post(`/automation/auto-apply?submit=${submit}`, data),
};

// ── Interview ───────────────────────────────────────────────────────────────
// Backend: POST /interview/questions → InterviewQuestionsRequest
// Backend: POST /interview/evaluate  → EvaluateAnswerRequest

export const interviewService = {
  startSession: (data: {
    job_title: string;
    job_description?: string;
    interview_type?: 'technical' | 'hr' | 'mixed';
    num_questions?: number;
  }) => api.post('/interview/questions', data),

  evaluateAnswer: (data: {
    session_id: string;
    question_index: number;
    answer: string;
  }) => api.post('/interview/evaluate', data),
};

// ── Scheduler ───────────────────────────────────────────────────────────────

export const schedulerService = {
  addReminder: (data: {
    title: string;
    message: string;
    reminder_type?: string;
    scheduled_at: string;
  }) => api.post('/scheduler/reminder', data),

  listReminders: () => api.get('/scheduler/reminders'),

  deleteReminder: (id: string) => api.delete(`/scheduler/reminder/${id}`),
};

// ── Profile ─────────────────────────────────────────────────────────────────
// Backend: GET  /profile        → ProfileResponse
// Backend: PUT  /profile        → ProfileUpdateRequest (partial)
// Backend: POST /profile/skills → SkillsUpdateRequest { skills: string[] }

export const profileService = {
  getProfile: () => api.get('/profile'),

  updateProfile: (data: Record<string, any>) => api.put('/profile', data),

  updateSkills: (skills: string[]) => api.post('/profile/skills', { skills }),

  syncResumeToProfile: (parsedData: Record<string, any>) => 
    api.post('/profile/sync-resume', parsedData),

  updateAIPreferences: (data: { auto_apply: boolean; optimization_level: string; match_threshold: number }) =>
    api.put('/profile/ai-preferences', data),
};

export const settingsService = {
  updatePassword: (data: any) => api.put('/auth/password', data),
};
