import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import VerifyEmail from '@/pages/auth/VerifyEmail'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import ApplicationList from '@/pages/applications/ApplicationList'
import ApplicationDetail from '@/pages/applications/ApplicationDetail'
import InterviewList from '@/pages/interviews/InterviewList'
import InterviewDetail from '@/pages/interviews/InterviewDetail'
import InterviewCalendar from '@/pages/interviews/InterviewCalendar'
import CompanyList from '@/pages/companies/CompanyList'
import CompanyDetail from '@/pages/companies/CompanyDetail'
import ResumeList from '@/pages/resumes/ResumeList'
import WebhookList from '@/pages/webhooks/WebhookList'
import ExportCenter from '@/pages/exports/ExportCenter'
import Notifications from '@/pages/Notifications'
import CoverLetterGenerator from '@/pages/ai/CoverLetterGenerator'
import JobMatchAnalyzer from '@/pages/ai/JobMatchAnalyzer'
import InterviewQuestions from '@/pages/ai/InterviewQuestions'
import AIHistory from '@/pages/ai/AIHistory'
import Settings from '@/pages/Settings'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import { ToastProvider } from '@/hooks/useToast'
import Features from '@/pages/Features'
import HowItWorks from '@/pages/HowItWorks'
import Pricing from '@/pages/Pricing'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App Shell */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<ApplicationList />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/resumes" element={<ResumeList />} />
            <Route path="/webhooks" element={<WebhookList />} />
            <Route path="/exports" element={<ExportCenter />} />
            <Route path="/interviews" element={<InterviewList />} />
            <Route path="/interviews/calendar" element={<InterviewCalendar />} />
            <Route path="/interviews/:id" element={<InterviewDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/ai/cover-letter" element={<CoverLetterGenerator />} />
            <Route path="/ai/job-match" element={<JobMatchAnalyzer />} />
            <Route path="/ai/interview-questions" element={<InterviewQuestions />} />
            <Route path="/ai/history" element={<AIHistory />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Root Landing Page & Marketing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
