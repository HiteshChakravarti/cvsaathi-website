import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useUserStats } from "../hooks/useUserStats";
import { useSubscription } from "../hooks/useSubscription";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { supabase } from "../lib/supabaseClient";
import "./dashboard.css";
import {
  Bell,
  Search,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Bot,
  FileText,
  FileCheck,
  Briefcase,
  BarChart3,
  Command,
  Menu,
} from "lucide-react";

import { CommandPalette } from "./components/CommandPalette";
import { SidebarContent } from "./components/SidebarContent";
import { RightRail } from "./components/RightRail";
import { MobileDrawer } from "./components/MobileDrawer";
import { FeatureCardLarge } from "./components/FeatureCardLarge";
import { JobTrackerSection } from "./components/JobTrackerSection";
import { AICoachPage } from "./components/AICoachPage";
import { ATSCheckerPage } from "./components/ATSCheckerPage";
import { SkillGapAnalysisPage } from "./components/SkillGapAnalysisPage";
import { ResumeBuilderPage } from "./components/ResumeBuilderPage";
import { AIInterviewPrepPage } from "./components/AIInterviewPrepPage";
import { ProfilePage } from "./components/ProfilePage";
import { PerformanceMetricsPage } from "./components/PerformanceMetricsPage";
import { SettingsPage } from "./components/SettingsPage";
import { PricingPage } from "./components/PricingPage";
import { JobTrackerPage } from "./components/JobTrackerPage";
import { CalendarPage } from "./components/CalendarPage";
import { TemplatesGalleryPage } from "./components/TemplatesGalleryPage";
import { EdgeFunctionTest } from "../components/EdgeFunctionTest";
import { AIServicesTest } from "../components/AIServicesTest";
import { DashboardShell } from "./DashboardShell";

// Using assets from public folder
const estelCoach = "/AI Career Coch.png";
const estelATS = "/ATS Checker.png";
const estelSkillGap = "/Skill Gap analysis.png";
const estelResume = "/Resume Builder.png";
const estelInterview = "/AI interview Prep.png";

const sectionToPath: Record<string, string> = {
  dashboard: "/app",
  "ai-coach": "/app/ai-coach",
  "resume-builder": "/app/resume-builder",
  "ats-checker": "/app/ats-checker",
  "interview-prep": "/app/interview-prep",
  "skill-gap": "/app/skill-gap",
  pricing: "/app/pricing",
  settings: "/app/settings",
  help: "/app/help",
  profile: "/app/profile",
  "performance-metrics": "/app/performance-metrics",
  "job-tracker": "/app/job-tracker",
  calendar: "/app/calendar",
  "templates": "/app/templates",
};

const pathToSection: Record<string, string> = Object.entries(sectionToPath).reduce(
  (acc, [section, path]) => {
    acc[path] = section;
    if (path.endsWith("/") && path.length > 1) {
      acc[path.slice(0, -1)] = section;
    }
    return acc;
  },
  {} as Record<string, string>
);

const formatSection = (section: string) =>
  section
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const resolveSection = (section: string) => {
  if (section === "analytics") return "performance-metrics";
  return section;
};

export function DashboardRoutes() {
  const [isDark, setIsDark] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string; full_name?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user } = useAuth();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { currentPlan, loading: subscriptionLoading } = useSubscription();
  const { activities: recentActivities, loading: activitiesLoading } = useRecentActivities(4);

  const location = useLocation();
  const navigate = useNavigate();

  const normalizedPath = useMemo(() => {
    if (location.pathname === "/app/") return "/app";
    if (location.pathname.endsWith("/") && location.pathname.length > 1) {
      return location.pathname.slice(0, -1);
    }
    return location.pathname;
  }, [location.pathname]);

  const activeSection = pathToSection[normalizedPath] ?? "dashboard";

  // Fetch user profile
  useEffect(() => {
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, full_name')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateToSection = (section: string, shouldToast = false) => {
    const resolved = resolveSection(section);

    if (resolved === "help") {
      toast.info("Help & support is coming soon.");
      return;
    }

    const target = sectionToPath[resolved] ?? "/app";

    if (target === normalizedPath) {
      return;
    }

    if (shouldToast) {
      toast.success(`Opening ${formatSection(resolved)}`, { duration: 2000 });
    }

    navigate(target);
  };

  const handleFeatureClick = (section: string) => navigateToSection(section, true);

  const handleSectionChange = (section: string) => navigateToSection(section, false);

  const handleCommandNavigate = (section: string) => navigateToSection(section, true);

  const handleMetricClick = (metric: string) => {
    toast.info(`Viewing ${metric} details`, { duration: 2000 });
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

  const toaster = (
    <Toaster
      position="top-right"
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        style: isDark
          ? { background: "rgb(15 23 42)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }
          : { background: "white", color: "rgb(17 24 39)", border: "1px solid rgb(229 231 235)" },
      }}
    />
  );

  const navigateHome = () => navigateToSection("dashboard", false);

  if (activeSection === "ai-coach") {
    return (
      <>
        {toaster}
        <AICoachPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "ats-checker") {
    return (
      <>
        {toaster}
        <ATSCheckerPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "skill-gap") {
    return (
      <>
        {toaster}
        <SkillGapAnalysisPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "resume-builder") {
    return (
      <>
        {toaster}
        <ResumeBuilderPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "interview-prep") {
    return (
      <>
        {toaster}
        <AIInterviewPrepPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "profile") {
    return (
      <>
        {toaster}
        <ProfilePage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "performance-metrics") {
    return (
      <>
        {toaster}
        <PerformanceMetricsPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "settings") {
    return (
      <>
        {toaster}
        <SettingsPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "pricing") {
    return (
      <>
        {toaster}
        <PricingPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "job-tracker") {
    return (
      <>
        {toaster}
        <JobTrackerPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "calendar") {
    return (
      <>
        {toaster}
        <CalendarPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "templates") {
    return (
      <>
        {toaster}
        <TemplatesGalleryPage isDark={isDark} onBack={navigateHome} />
      </>
    );
  }

  if (activeSection === "help") {
    return (
      <>
        {toaster}
        <DashboardShell
          title="Help & Support"
          description="We are finishing up the help center experience. In the meantime, please reach out to support@cvsaathi.com for assistance."
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-slate-900" : "bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50"
      }`}
    >
      {toaster}

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        isDark={isDark}
        onNavigate={handleCommandNavigate}
      />

      {/* Desktop Sidebar (fixed, md+) */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen w-20 border-r transition-all duration-500 z-50 ${
          isDark
            ? "bg-slate-900 border-white/10"
            : "bg-gradient-to-b from-teal-600 to-teal-700 border-teal-800"
        }`}
      >
        <SidebarContent
          isDark={isDark}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          compact
        />
      </aside>

      {/* Right Rail (fixed, lg+) */}
      <aside
        className={`hidden lg:block fixed right-0 top-0 h-screen w-80 border-l transition-colors duration-500 overflow-y-auto z-40 ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <RightRail
          isDark={isDark}
          statsLoading={statsLoading}
          stats={stats}
          activitiesLoading={activitiesLoading}
          recentActivities={recentActivities}
          userProfile={userProfile}
          profileLoading={profileLoading}
          currentPlan={currentPlan}
          subscriptionLoading={subscriptionLoading}
          userEmail={user?.email}
          onFeatureClick={handleFeatureClick}
          onMetricClick={handleMetricClick}
        />
      </aside>

      {/* Header (sticky, mobile-friendly) */}
      <header
        className={`sticky top-0 z-30 border-b transition-colors duration-500 ${
          isDark
            ? "border-white/10 bg-slate-900/90 backdrop-blur-xl"
            : "border-gray-200 bg-white/90 backdrop-blur-xl"
        }`}
      >
            <div className="px-4 py-4 md:px-8 md:py-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className={`md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isDark
                        ? "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className={`text-2xl md:text-3xl ${isDark ? "text-white" : "text-gray-900"}`}>My Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className={`flex items-center gap-2 px-3 py-2 md:px-4 rounded-xl border transition-all duration-300 ${
                      isDark
                        ? "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Command className="size-4" />
                    <span className="hidden sm:inline text-sm">Quick Search</span>
                    <kbd
                      className={`hidden sm:inline text-xs px-2 py-0.5 rounded ${
                        isDark ? "bg-white/10" : "bg-gray-100"
                      }`}
                    >
                      ⌘K
                    </kbd>
                  </button>
                  <button
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
                    }`}
                  >
                    <Search className={`size-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                  </button>
                  <button
                    className={`p-2.5 rounded-xl transition-all duration-300 relative ${
                      isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
                    }`}
                  >
                    <Bell className={`size-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
                  </button>
                  <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
                    }`}
                  >
                    {isDark ? (
                      <Moon className="size-5 text-gray-400" />
                    ) : (
                      <Sun className="size-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

      {/* Main Content (padding-based layout) */}
      <main className="px-4 md:px-6 lg:px-8 md:pl-24 lg:pr-96 py-6 space-y-6">
        <div className="space-y-6 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 overflow-visible">
                <div className="animate-in slide-in-from-bottom duration-500 overflow-visible">
                  <FeatureCardLarge
                    icon={<Bot className="size-8" />}
                    title="AI Career Coach"
                    description="Get personalized career guidance powered by advanced AI. Receive expert advice on job search strategies, career transitions, and professional development tailored to your unique goals."
                    author="AI Team"
                    color="teal"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("ai-coach")}
                    mascotImage={estelCoach}
                  />
                </div>

                <div
                  className="animate-in slide-in-from-bottom duration-500 overflow-visible"
                  style={{ animationDelay: "100ms" }}
                >
                  <FeatureCardLarge
                    icon={<FileText className="size-8" />}
                    title="Resume Builder"
                    description="Create stunning, ATS-optimized resumes with smart templates and AI-powered content suggestions tailored for your industry."
                    author="CV Team"
                    color="purple"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("resume-builder")}
                    mascotImage={estelResume}
                  />
                </div>
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 overflow-visible">
                <div
                  className="animate-in slide-in-from-bottom duration-500 overflow-visible"
                  style={{ animationDelay: "200ms" }}
                >
                  <FeatureCardLarge
                    icon={<FileCheck className="size-8" />}
                    title="ATS Checker"
                    description="Analyze your resume against Applicant Tracking Systems and get instant feedback with optimization suggestions."
                    author="Tech Team"
                    color="pink"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("ats-checker")}
                    mascotImage={estelATS}
                  />
                </div>

                <div
                  className="animate-in slide-in-from-bottom duration-500 overflow-visible"
                  style={{ animationDelay: "300ms" }}
                >
                  <FeatureCardLarge
                    icon={<Briefcase className="size-8" />}
                    title="AI Interview Prep"
                    description="Practice with AI-powered mock interviews tailored to your target role and receive real-time feedback on your performance."
                    author="Interview Pro"
                    color="blue"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("interview-prep")}
                    mascotImage={estelInterview}
                  />
                </div>

                <div
                  className="animate-in slide-in-from-bottom duration-500 overflow-visible"
                  style={{ animationDelay: "400ms" }}
                >
                  <FeatureCardLarge
                    icon={<BarChart3 className="size-8" />}
                    title="Skill Gap Analysis"
                    description="Identify missing skills for your dream role and get personalized learning paths to bridge the gap and advance your career."
                    author="Skills Team"
                    color="emerald"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("skill-gap")}
                    mascotImage={estelSkillGap}
                  />
                </div>
              </div>
            </div>

        <JobTrackerSection isDark={isDark} onViewAll={() => handleFeatureClick("job-tracker")} />

        {/* Analytics Section */}
        <div
          className="pt-4 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "600ms" }}
        >
          <h2 className={`text-xl md:text-2xl mb-4 md:mb-6 break-words ${isDark ? "text-white" : "text-gray-900"}`}>
            Analytics Overview
          </h2>
          <div
            className={`rounded-2xl border p-4 md:p-6 ${
              isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div>
                <div className="text-2xl md:text-4xl mb-2 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent break-words">
                  {statsLoading ? "..." : stats.resumesCreated}
                </div>
                <div className={`text-xs md:text-sm break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Resumes Created
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent break-words">
                  {statsLoading ? "..." : stats.aiSessionsCompleted}
                </div>
                <div className={`text-xs md:text-sm break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  AI Sessions
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl mb-2 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent break-words">
                  {statsLoading ? "..." : stats.interviewsCompleted}
                </div>
                <div className={`text-xs md:text-sm break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Interviews Prepped
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent break-words">
                  {statsLoading ? "..." : stats.applicationsSubmitted}
                </div>
                <div className={`text-xs md:text-sm break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Applications Submitted
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Right Rail Content (lg:hidden) */}
        <section className="lg:hidden space-y-6">
          <RightRail
            isDark={isDark}
            statsLoading={statsLoading}
            stats={stats}
            activitiesLoading={activitiesLoading}
            recentActivities={recentActivities}
            userProfile={userProfile}
            profileLoading={profileLoading}
            currentPlan={currentPlan}
            subscriptionLoading={subscriptionLoading}
            userEmail={user?.email}
            onFeatureClick={handleFeatureClick}
            onMetricClick={handleMetricClick}
          />
        </section>
      </main>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div
          className={`h-full w-full ${
            isDark
              ? "bg-slate-900"
              : "bg-gradient-to-b from-teal-600 to-teal-700"
          }`}
        >
          <SidebarContent
            isDark={isDark}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      </MobileDrawer>
    </div>
  );
}
