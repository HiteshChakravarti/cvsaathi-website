import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useUserStats } from "../hooks/useUserStats";
import { useSubscription } from "../hooks/useSubscription";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";

import { CommandPalette } from "./components/CommandPalette";
import { ModernSidebar } from "./components/ModernSidebar";
import { FeatureCardLarge } from "./components/FeatureCardLarge";
import { JobTrackerSection } from "./components/JobTrackerSection";
import { CircularProgressCard } from "./components/CircularProgressCard";
import { ActivityWidget } from "./components/ActivityWidget";
import { MiniCalendar } from "./components/MiniCalendar";
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
import { FeedbackPage } from "./components/FeedbackPage";
import { FeedbackFloatingButton } from "./components/FeedbackFloatingButton";
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
  feedback: "/app/feedback",
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
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user } = useAuth();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { currentPlan, loading: subscriptionLoading } = useSubscription();
  const { activities: recentActivities, loading: activitiesLoading, error: activitiesError } = useRecentActivities(4);

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
          .select('first_name, last_name')
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
      toast.info(t('dashboard.help.comingSoon'));
      return;
    }

    const target = sectionToPath[resolved] ?? "/app";

    if (target === normalizedPath) {
      return;
    }

    if (shouldToast) {
      const sectionName = t(`dashboard.sidebar.menu.${resolved}`) || t(`dashboard.sidebar.bottom.${resolved}`) || formatSection(resolved);
      toast.success(t('dashboard.navigation.opening', { section: sectionName }), { duration: 2000 });
    }

    navigate(target);
  };

  const handleFeatureClick = (section: string) => navigateToSection(section, true);

  const handleSectionChange = (section: string) => navigateToSection(section, false);

  const handleCommandNavigate = (section: string) => navigateToSection(section, true);

  // Handle activity click navigation
  const handleActivityClick = (activity: { type: string; id: string }) => {
    switch (activity.type) {
      case 'resume':
        navigateToSection('resume-builder', true);
        // Could also navigate to specific resume if needed
        break;
      case 'ai_session':
        navigateToSection('ai-coach', true);
        break;
      case 'interview':
        navigateToSection('interview-prep', true);
        break;
      case 'ats_check':
        navigateToSection('ats-checker', true);
        break;
      case 'skill_gap':
        navigateToSection('skill-gap', true);
        break;
      default:
        break;
    }
  };

  // Handle "See all" button click
  const handleSeeAllActivities = () => {
    // Navigate to a full activity page or show more activities
    // For now, we'll navigate to performance metrics which could show full activity
    navigateToSection('performance-metrics', true);
  };

  const handleMetricClick = (metric: string) => {
    toast.info(t('dashboard.analytics.viewingDetails', { metric }), { duration: 2000 });
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
          title={t('dashboard.help.title')}
          description={t('dashboard.help.description')}
        />
      </>
    );
  }

  if (activeSection === "feedback") {
    return (
      <>
        {toaster}
        <FeedbackPage isDark={isDark} onBack={navigateHome} />
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
      <FeedbackFloatingButton isDark={isDark} />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        isDark={isDark}
        onNavigate={handleCommandNavigate}
      />

      <ModernSidebar isDark={isDark} activeSection={activeSection} onSectionChange={handleSectionChange} />

      <div className="ml-20 mr-80">
        <div className={`min-h-screen border-r ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <header
            className={`border-b transition-colors duration-500 ${
              isDark
                ? "border-white/10 bg-slate-900/80 backdrop-blur-xl"
                : "border-gray-200 bg-white/80 backdrop-blur-xl"
            }`}
          >
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className={`text-3xl ${isDark ? "text-white" : "text-gray-900"}`}>{t('dashboard.main.title')}</h1>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                      isDark
                        ? "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Command className="size-4" />
                    <span className="text-sm">{t('dashboard.main.quickSearch')}</span>
                    <kbd
                      className={`text-xs px-2 py-0.5 rounded ${
                        isDark ? "bg-white/10" : "bg-gray-100"
                      }`}
                    >
                      {t('dashboard.main.keyboardShortcut')}
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

          <main className="p-8 space-y-6">
            <div className="space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                <div className="animate-in slide-in-from-bottom duration-500 overflow-visible">
                  <FeatureCardLarge
                    icon={<Bot className="size-8" />}
                    title={t('dashboard.features.aiCoach.title')}
                    description={t('dashboard.features.aiCoach.description')}
                    author={t('dashboard.features.aiCoach.author')}
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
                    title={t('dashboard.features.resumeBuilder.title')}
                    description={t('dashboard.features.resumeBuilder.description')}
                    author={t('dashboard.features.resumeBuilder.author')}
                    color="purple"
                    isDark={isDark}
                    onClick={() => handleFeatureClick("resume-builder")}
                    mascotImage={estelResume}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible">
                <div
                  className="animate-in slide-in-from-bottom duration-500 overflow-visible"
                  style={{ animationDelay: "200ms" }}
                >
                  <FeatureCardLarge
                    icon={<FileCheck className="size-8" />}
                    title={t('dashboard.features.atsChecker.title')}
                    description={t('dashboard.features.atsChecker.description')}
                    author={t('dashboard.features.atsChecker.author')}
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
                    title={t('dashboard.features.interviewPrep.title')}
                    description={t('dashboard.features.interviewPrep.description')}
                    author={t('dashboard.features.interviewPrep.author')}
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
                    title={t('dashboard.features.skillGap.title')}
                    description={t('dashboard.features.skillGap.description')}
                    author={t('dashboard.features.skillGap.author')}
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
              <h2 className={`text-2xl mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                {t('dashboard.analytics.overview')}
              </h2>
              <div
                className={`rounded-2xl border p-6 ${
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                }`}
              >
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-4xl mb-2 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                      {statsLoading ? "..." : stats.resumesCreated}
                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t('dashboard.analytics.resumesCreated')}
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {statsLoading ? "..." : stats.aiSessionsCompleted}
                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t('dashboard.analytics.aiSessions')}
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                      {statsLoading ? "..." : stats.interviewsCompleted}
                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t('dashboard.analytics.interviewsPrepped')}
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      {statsLoading ? "..." : stats.applicationsSubmitted}
                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {t('dashboard.analytics.applicationsSubmitted')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <aside
        className={`fixed right-0 top-0 w-80 h-screen border-l transition-colors duration-500 overflow-y-auto ${
          isDark ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleFeatureClick("profile")}
              className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all hover:scale-[1.02] ${
                isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 cursor-pointer" />
              <div className="text-left">
                <p className={isDark ? "text-white" : "text-gray-900"}>
                  {profileLoading ? t('loading') : 
                   userProfile?.full_name || 
                   (userProfile?.first_name && userProfile?.last_name 
                     ? `${userProfile.first_name} ${userProfile.last_name}` 
                     : user?.email?.split('@')[0] || t('dashboard.profile.user'))}
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {subscriptionLoading 
                    ? t('loading') 
                    : `${t('dashboard.profile.currentPlan')}: ${currentPlan.displayName}`
                  }
                </p>
              </div>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.performance.title')}</h3>
              <button
                onClick={() => handleFeatureClick("performance-metrics")}
                className="text-sm text-teal-500 hover:text-teal-600"
              >
                {t('dashboard.performance.viewAll')}
              </button>
            </div>
            <div className="space-y-4">
              <CircularProgressCard
                value={statsLoading ? 0 : stats.resumesCreated}
                maxValue={5}
                label={t('dashboard.performance.resumesCreated')}
                subtext={statsLoading ? t('loading') : t('dashboard.performance.total', { count: stats.resumesCreated })}
                gradient="from-teal-500 to-cyan-400"
                isDark={isDark}
                onClick={() => handleMetricClick("resumes")}
              />
              <CircularProgressCard
                value={statsLoading ? 0 : stats.aiSessionsCompleted}
                maxValue={10}
                label={t('dashboard.performance.aiSessions')}
                subtext={statsLoading ? t('loading') : t('dashboard.performance.timeSpent', { hours: Math.floor(stats.totalTimeSpent / 60), minutes: stats.totalTimeSpent % 60 })}
                gradient="from-purple-500 to-pink-400"
                isDark={isDark}
                onClick={() => handleMetricClick("ai-sessions")}
              />
              <CircularProgressCard
                value={statsLoading ? 0 : stats.interviewsCompleted}
                maxValue={5}
                label={t('dashboard.performance.interviewPrep')}
                subtext={statsLoading ? t('loading') : t('dashboard.performance.completed', { count: stats.interviewsCompleted })}
                gradient="from-blue-500 to-indigo-500"
                isDark={isDark}
                onClick={() => handleMetricClick("interviews")}
              />
              <CircularProgressCard
                value={statsLoading ? 0 : stats.profileCompleteness}
                maxValue={100}
                label={t('dashboard.performance.profileComplete')}
                subtext={statsLoading ? t('loading') : t('dashboard.performance.percentComplete', { percent: stats.profileCompleteness })}
                gradient="from-emerald-500 to-teal-500"
                isDark={isDark}
                onClick={() => handleMetricClick("profile")}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={isDark ? "text-white" : "text-gray-900"}>{t('dashboard.recentActivity.title')}</h3>
              <button 
                onClick={handleSeeAllActivities}
                className="text-sm text-teal-500 hover:text-teal-600 transition-colors"
              >
                {t('dashboard.recentActivity.seeAll')}
              </button>
            </div>
            <div className="space-y-3">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                </div>
              ) : activitiesError ? (
                <div className={`text-sm text-center py-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  <p>{t('dashboard.recentActivity.error')}</p>
                  <p className="text-xs mt-1 opacity-75">{activitiesError}</p>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  // Get translated activity name
                  let activityName = activity.name;
                  if (activity.type === 'resume') {
                    activityName = activity.metadata?.resumeName 
                      ? t('dashboard.recentActivity.resumeUpdated', { name: activity.metadata.resumeName })
                      : t('dashboard.recentActivity.resumeUpdatedGeneric');
                  } else if (activity.type === 'ai_session') {
                    activityName = t('dashboard.recentActivity.aiSession');
                  } else if (activity.type === 'interview') {
                    activityName = t('dashboard.recentActivity.interviewPrep');
                  } else if (activity.type === 'ats_check') {
                    activityName = activity.metadata?.fileName
                      ? t('dashboard.recentActivity.atsCheck', { fileName: activity.metadata.fileName })
                      : t('dashboard.recentActivity.atsCheckGeneric');
                  } else if (activity.type === 'skill_gap') {
                    activityName = activity.metadata?.targetRole
                      ? t('dashboard.recentActivity.skillGapAnalysis', { role: activity.metadata.targetRole })
                      : t('dashboard.recentActivity.skillGapAnalysisGeneric');
                  }

                  return (
                    <ActivityWidget
                      key={activity.id}
                      name={activityName}
                      formattedTime={activity.formattedTime}
                      avatar={activity.avatar}
                      isDark={isDark}
                      isOnline={activity.type === 'resume' || activity.type === 'ai_session' || activity.type === 'ats_check' || activity.type === 'skill_gap'}
                      onClick={() => handleActivityClick(activity)}
                    />
                  );
                })
              ) : (
                <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('dashboard.recentActivity.noActivity')}
                </p>
              )}
            </div>
          </div>

          <MiniCalendar
            isDark={isDark}
            onViewFull={() => handleFeatureClick("calendar")}
          />
        </div>
      </aside>
    </div>
  );
}
