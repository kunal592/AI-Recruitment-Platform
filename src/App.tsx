import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import { restoreSession } from './redux/slices/authSlice';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // While restoring session, show nothing (avoids flash-redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Restore user session on page reload if token exists but user is null
  useEffect(() => {
    if (token && !user) {
      dispatch(restoreSession());
    }
  }, [dispatch, token, user]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/resume/upload" element={<ResumeUploadPage />} />
        <Route path="/mock-interview" element={<MockInterviewPage />} />
        <Route path="/study-plan" element={<StudyPlanPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
