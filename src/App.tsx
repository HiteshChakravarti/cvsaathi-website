import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { SignUpPage } from "./pages/SignUpPage";
import { SignInPage } from "./pages/SignInPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardRoutes } from "./dashboard/DashboardRoutes";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { OverviewPage } from "./pages/cvsaathi/OverviewPage";
import { FeaturesPage } from "./pages/cvsaathi/FeaturesPage";
import { EstelPage } from "./pages/cvsaathi/EstelPage";
import { ResumeBuilderPage } from "./pages/cvsaathi/ResumeBuilderPage";
import { InterviewPrepPage } from "./pages/cvsaathi/InterviewPrepPage";
import { SkillGapAnalysisPage } from "./pages/cvsaathi/SkillGapAnalysisPage";
import { ATSCheckerPage } from "./pages/cvsaathi/ATSCheckerPage";
import { DownloadAppPage } from "./pages/cvsaathi/DownloadAppPage";
import { StudentsFreshersPage } from "./pages/candidates/StudentsFreshersPage";
import { Tier2ProfessionalsPage } from "./pages/candidates/Tier2ProfessionalsPage";
import { CareerSwitchPage } from "./pages/candidates/CareerSwitchPage";
import { BackToWorkPage } from "./pages/candidates/BackToWorkPage";
import { GovtPSUPage } from "./pages/candidates/GovtPSUPage";
import { PrivacyPolicyPage } from "./pages/support/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/support/TermsOfServicePage";
import { CookiePolicyPage } from "./pages/support/CookiePolicyPage";
import { RefundsPage } from "./pages/support/RefundsPage";
import { GrievanceOfficerPage } from "./pages/support/GrievanceOfficerPage";
import { HelpCenterPage } from "./pages/support/HelpCenterPage";
import { IndianCompliancePage } from "./pages/support/IndianCompliancePage";
import { GlobalCompliancePage } from "./pages/support/GlobalCompliancePage";
import { DataProtectionPage } from "./pages/support/DataProtectionPage";
import { DataRetentionPage } from "./pages/support/DataRetentionPage";
import { DataRightsPage } from "./pages/support/DataRightsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Footer Pages */}
          <Route path="/company/about" element={<AboutPage />} />
          <Route path="/company/story-mission" element={<PlaceholderPage title="Our Story & Mission" description="Learn about CVSaathi's journey and vision for empowering Tier-2 India professionals." />} />
          <Route path="/company/careers" element={<PlaceholderPage title="Join as Mentor / Career Coach" description="Become part of the CVSaathi team and help professionals achieve their career goals." />} />
          <Route path="/company/partners" element={<PlaceholderPage title="Partners & Colleges" description="Coming soon - Partner with CVSaathi to empower your students and alumni." />} />
          <Route path="/company/contact" element={<ContactPage />} />
          
          {/* CVSaathi Pages */}
          <Route path="/cvsaathi/overview" element={<OverviewPage />} />
          <Route path="/cvsaathi/features" element={<FeaturesPage />} />
          <Route path="/cvsaathi/estel" element={<EstelPage />} />
          <Route path="/cvsaathi/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/cvsaathi/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/cvsaathi/skill-gap-analysis" element={<SkillGapAnalysisPage />} />
          <Route path="/cvsaathi/ats-checker" element={<ATSCheckerPage />} />
          <Route path="/cvsaathi/download-app" element={<DownloadAppPage />} />
          
          {/* Candidate Pages */}
          <Route path="/candidates/students-freshers" element={<StudentsFreshersPage />} />
          <Route path="/candidates/tier2-professionals" element={<Tier2ProfessionalsPage />} />
          <Route path="/candidates/career-switch" element={<CareerSwitchPage />} />
          <Route path="/candidates/back-to-work" element={<BackToWorkPage />} />
          <Route path="/candidates/govt-psu" element={<GovtPSUPage />} />
          
          {/* Support & Legal Pages */}
          <Route path="/support/help-center" element={<HelpCenterPage />} />
          <Route path="/support/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/support/terms-of-use" element={<TermsOfServicePage />} />
          <Route path="/support/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/support/refunds" element={<RefundsPage />} />
          <Route path="/support/grievance-officer" element={<GrievanceOfficerPage />} />
          
          {/* Additional Regulatory Pages */}
          <Route path="/support/indian-compliance" element={<IndianCompliancePage />} />
          <Route path="/support/global-compliance" element={<GlobalCompliancePage />} />
          <Route path="/support/data-protection" element={<DataProtectionPage />} />
          <Route path="/support/data-retention" element={<DataRetentionPage />} />
          <Route path="/support/data-rights" element={<DataRightsPage />} />
          
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DashboardRoutes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}