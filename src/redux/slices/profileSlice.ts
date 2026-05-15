import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService } from '../../services/apiServices';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[];
  preferred_job_titles: string[];
  preferred_locations: string[];
  experience_years: number;
  experience: any[];
  education: any[];
  certifications: string[];
  projects: any[];
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileService.getProfile();
      return res.data as Profile;
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to load profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: Partial<Profile>, { rejectWithValue }) => {
    try {
      const res = await profileService.updateProfile(data);
      return res.data as Profile;
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to update profile');
    }
  }
);

export const updateSkills = createAsyncThunk(
  'profile/updateSkills',
  async (skills: string[], { rejectWithValue }) => {
    try {
      const res = await profileService.updateSkills(skills);
      return res.data as Profile;
    } catch (err: any) {
      return rejectWithValue(err.parsedMessage || 'Failed to update skills');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────────

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProfile
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.profile = action.payload; state.loading = false; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.profile = action.payload; state.loading = false; })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // updateSkills
    builder
      .addCase(updateSkills.pending, (state) => { state.loading = true; })
      .addCase(updateSkills.fulfilled, (state, action) => { state.profile = action.payload; state.loading = false; })
      .addCase(updateSkills.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
