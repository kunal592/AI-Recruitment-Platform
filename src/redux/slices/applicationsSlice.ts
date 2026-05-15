import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offer';
  appliedDate: string;
}

interface ApplicationsState {
  list: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  list: [],
  loading: false,
  error: null,
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    fetchApplicationsSuccess: (state, action: PayloadAction<Application[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    updateApplicationStatus: (state, action: PayloadAction<{ id: string; status: Application['status'] }>) => {
      const app = state.list.find((a) => a.id === action.payload.id);
      if (app) {
        app.status = action.payload.status;
      }
    },
  },
});

export const { fetchApplicationsSuccess, updateApplicationStatus } = applicationsSlice.actions;
export default applicationsSlice.reducer;
