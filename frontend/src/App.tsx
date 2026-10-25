import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { DashboardLayout } from './components/common/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadResumePage } from './pages/UploadResumePage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { MyResumesPage } from './pages/MyResumesPage';
import { ResumeComparePage } from './pages/ResumeComparePage';
import { JobRecommendationsPage } from './pages/JobRecommendationsPage';
import { JobSearchPage } from './pages/JobSearchPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { JobDescriptionAnalyzerPage } from './pages/JobDescriptionAnalyzerPage';
import { ResumeImprovementPage } from './pages/ResumeImprovementPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs-explore" element={<JobSearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadResumePage />} />
                <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
                <Route path="/my-resumes" element={<MyResumesPage />} />
                <Route path="/compare" element={<ResumeComparePage />} />
                <Route path="/recommendations" element={<JobRecommendationsPage />} />
                <Route path="/jobs" element={<JobSearchPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/jd-analyzer" element={<JobDescriptionAnalyzerPage />} />
                <Route path="/suggestions" element={<ResumeImprovementPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
