import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiService, automationService } from '../../services/apiServices';

// ── Types ───────────────────────────────────────────────────────────────────

interface AIState {
  resumeOptimization: any;
  generatedEmail: { subject: string; body: string; email_type: string } | null;
  studyPlan: any;
  autoApplyResult: any;
  loading: boolean;
  error: string | null;
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const customizeResume = createAsyncThunk(
  'ai/customizeResume',
  async (
    data: { job_description: string; resume_id?: string; resume_text?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await aiService.customizeResume(data);
      return res.data; // CustomizeResumeResponse
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Resume customization failed');
    }
  }
);

export const generateEmail = createAsyncThunk(
  'ai/generateEmail',
  async (
    data: {
      email_type: 'application' | 'follow_up' | 'hr_outreach';
      job_title: string;
      company_name: string;
      job_description?: string;
      candidate_name?: string;
      extra_context?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await aiService.generateEmail(data);
      return res.data; // GenerateEmailResponse
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Email generation failed');
    }
  }
);

export const generateStudyPlan = createAsyncThunk(
  'ai/generateStudyPlan',
  async (
    data: { target_role: string; current_skills?: string[]; duration_days?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await aiService.getStudyPlan(data);
      return res.data; // StudyPlanResponse
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Study plan generation failed');
    }
  }
);

export const autoApply = createAsyncThunk(
  'ai/autoApply',
  async (
    data: {
      job_url: string;
      resume_id?: string;
      cover_letter?: string;
      extra_fields?: Record<string, string>;
      submit?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const { submit, ...payload } = data;
      const res = await automationService.autoApply(payload, submit);
      return res.data; // AutoApplyResponse
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Auto-apply failed');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────────

const initialState: AIState = {
  resumeOptimization: null,
  generatedEmail: null,
  studyPlan: null,
  autoApplyResult: null,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResumeOptimization: (state, action: PayloadAction<any>) => {
      state.resumeOptimization = action.payload;
    },
    setGeneratedEmail: (state, action: PayloadAction<string>) => {
      state.generatedEmail = action.payload as any;
    },
    setStudyPlan: (state, action: PayloadAction<any>) => {
      state.studyPlan = action.payload;
    },
    setAIError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearAIState: (state) => {
      state.resumeOptimization = null;
      state.generatedEmail = null;
      state.studyPlan = null;
      state.autoApplyResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // customizeResume
    builder
      .addCase(customizeResume.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(customizeResume.fulfilled, (state, action) => { state.resumeOptimization = action.payload; state.loading = false; })
      .addCase(customizeResume.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // generateEmail
    builder
      .addCase(generateEmail.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(generateEmail.fulfilled, (state, action) => { state.generatedEmail = action.payload; state.loading = false; })
      .addCase(generateEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // generateStudyPlan
    builder
      .addCase(generateStudyPlan.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(generateStudyPlan.fulfilled, (state, action) => { state.studyPlan = action.payload; state.loading = false; })
      .addCase(generateStudyPlan.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // autoApply
    builder
      .addCase(autoApply.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(autoApply.fulfilled, (state, action) => { state.autoApplyResult = action.payload; state.loading = false; })
      .addCase(autoApply.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { setLoading, setResumeOptimization, setGeneratedEmail, setStudyPlan, setAIError, clearAIState } = aiSlice.actions;
export default aiSlice.reducer;
