import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobService } from '../../services/apiServices';

// ── Types ───────────────────────────────────────────────────────────────────

/** Normalised job shape used across the frontend. */
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  matchScore: number;
  skills: string[];
  type: string;
  tags: string[];
  apply_url?: string;
  source?: string;
  external_id?: string;
  posted_at?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
}

interface JobsState {
  list: Job[];
  recommendations: Job[];
  savedJobs: any[];
  stats: any | null;
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map backend JobResponse (snake_case, split salary fields)
 * into the frontend Job shape used by UI components.
 */
function normalizeJob(raw: any): Job {
  const salaryMin = raw.salary_min;
  const salaryMax = raw.salary_max;
  const currency = raw.currency || 'USD';
  let salary = 'Not specified';
  if (salaryMin && salaryMax) {
    salary = `${currency} ${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()}`;
  } else if (salaryMin) {
    salary = `${currency} ${salaryMin.toLocaleString()}+`;
  } else if (salaryMax) {
    salary = `Up to ${currency} ${salaryMax.toLocaleString()}`;
  }

  return {
    id: raw.id || raw.external_id || '',
    title: raw.title || '',
    company: raw.company || '',
    location: raw.location || 'Remote',
    description: raw.description || '',
    salary,
    matchScore: raw.match_percentage ?? raw.matchScore ?? 0,
    skills: raw.skills_required || raw.skills || [],
    type: raw.job_type || raw.type || 'Full-time',
    tags: raw.skills_required || [],
    apply_url: raw.apply_url,
    source: raw.source,
    external_id: raw.external_id,
    posted_at: raw.posted_at,
    matchingSkills: raw.matching_skills || [],
    missingSkills: raw.missing_skills || [],
  };
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const res = await jobService.getJobs();
    return (res.data as any[]).map(normalizeJob);
  } catch (err: any) {
    return rejectWithValue(err.parsedMessage || 'Failed to load jobs');
  }
});

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await jobService.getJobById(id);
      return normalizeJob(res.data);
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to load job details');
    }
  }
);

export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await jobService.searchJobs(query);
      return (res.data as any[]).map(normalizeJob);
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Search failed');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'jobs/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobService.getRecommendations();
      // Backend returns { recommendations: [{ job, match_score, match_percentage, ... }], total }
      const recs = res.data.recommendations || [];
      return recs.map((rec: any) => ({
        ...normalizeJob(rec.job),
        matchScore: rec.match_percentage ?? Math.round((rec.match_score ?? 0) * 100),
        missingSkills: rec.missing_skills || [],
        matchingSkills: rec.matching_skills || [],
      }));
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to load recommendations');
    }
  }
);

export const fetchSavedJobs = createAsyncThunk(
  'jobs/fetchSavedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobService.getSavedJobs();
      return res.data.saved_jobs || [];
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to load saved jobs');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'jobs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobService.getStats();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to load stats');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────────

const initialState: JobsState = {
  list: [],
  recommendations: [],
  savedJobs: [],
  stats: null,
  currentJob: null,
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    fetchJobsStart: (state) => {
      state.loading = true;
    },
    fetchJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    fetchJobDetailsSuccess: (state, action: PayloadAction<Job>) => {
      state.currentJob = action.payload;
      state.loading = false;
    },
    setJobsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchJobs
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.list = action.payload; state.loading = false; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // searchJobs
    builder
      .addCase(searchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchJobs.fulfilled, (state, action) => { state.list = action.payload; state.loading = false; })
      .addCase(searchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // fetchJobById
    builder
      .addCase(fetchJobById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobById.fulfilled, (state, action) => { state.currentJob = action.payload; state.loading = false; })
      .addCase(fetchJobById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // fetchRecommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => { state.loading = true; })
      .addCase(fetchRecommendations.fulfilled, (state, action) => { state.recommendations = action.payload; state.loading = false; })
      .addCase(fetchRecommendations.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // fetchSavedJobs
    builder
      .addCase(fetchSavedJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => { state.savedJobs = action.payload; state.loading = false; })
      .addCase(fetchSavedJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // fetchStats
    builder
      .addCase(fetchStats.pending, (state) => { state.loading = true; })
      .addCase(fetchStats.fulfilled, (state, action) => { state.stats = action.payload; state.loading = false; })
      .addCase(fetchStats.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { fetchJobsStart, fetchJobsSuccess, fetchJobDetailsSuccess, setJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;
