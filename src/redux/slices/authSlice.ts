import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/apiServices';

// ── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  is_active?: boolean;
  is_verified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ── Async Thunks ────────────────────────────────────────────────────────────

/** POST /auth/login → TokenResponse { access_token, user_id, full_name, email } */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      const data = res.data;
      // Store token
      localStorage.setItem('token', data.access_token);
      return {
        user: {
          id: data.user_id,
          email: data.email,
          name: data.full_name,
          full_name: data.full_name,
        },
        token: data.access_token,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.detail || 'Login failed'
      );
    }
  }
);

/** POST /auth/register → TokenResponse { access_token, user_id, full_name, email } */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: { full_name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authService.register(payload);
      const data = res.data;
      localStorage.setItem('token', data.access_token);
      return {
        user: {
          id: data.user_id,
          email: data.email,
          name: data.full_name,
          full_name: data.full_name,
        },
        token: data.access_token,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.detail || 'Registration failed'
      );
    }
  }
);

/** GET /auth/me — restore session on page reload */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getMe();
      const data = res.data;
      return {
        id: data.id,
        email: data.email,
        name: data.full_name,
        full_name: data.full_name,
        is_active: data.is_active,
        is_verified: data.is_verified,
      } as User;
    } catch (err: any) {
      // Token is invalid/expired — clear it
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Kept for backward compatibility — manual login dispatch */
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── loginUser ──────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // ── registerUser ──────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── restoreSession ────────────────────────────────────────────────────
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, setUser, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
