import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Award, Clock, FileText, Brain, Mic, BarChart3, Calendar, Download, Filter, Eye, Activity, Zap, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useUserStats } from "../../hooks/useUserStats";
import { useResumes } from "../../hooks/useResumes";
import { useInterviewSessions } from "../../hooks/useInterviewSessions";
import { useAIConversations } from "../../hooks/useAIConversations";
import { supabase } from "../../lib/supabaseClient";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { exportElementToPrint } from "../../services/exportService";

interface PerformanceMetricsPageProps {
  isDark: boolean;
  onBack: () => void;
}

export function PerformanceMetricsPage({ isDark, onBack }: PerformanceMetricsPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { resumes, loading: resumesLoading } = useResumes();
  const { sessions: interviewSessions, loading: sessionsLoading } = useInterviewSessions();
  const { conversations, loading: conversationsLoading } = useAIConversations();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const reportRef = useRef<HTMLDivElement>(null);


  // Fetch activity data
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Calculate date range
        const now = new Date();
        const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        // Fetch data for the time range
        const [resumesData, interviewsData, conversationsData] = await Promise.all([
          supabase
            .from('resumes')
            .select('created_at')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('interview_sessions')
            .select('created_at, completed_at')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('ai_chat_conversations')
            .select('session_id, created_at, response')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),
        ]);

        // Group by date
        const dateMap = new Map<string, { resumes: number; interviews: number; aiSessions: number }>();
        
        // Seed all dates in range to 0 for smoother charts
        for (let i = 0; i <= daysBack; i++) {
          const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dateMap.has(key)) {
            dateMap.set(key, { resumes: 0, interviews: 0, aiSessions: 0 });
          }
        }

        resumesData.data?.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const entry = dateMap.get(date);
          if (entry) entry.resumes++;
        });

        // Count interviews by creation (or use completed only if you prefer)
        interviewsData.data?.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const entry = dateMap.get(date);
          if (entry) entry.interviews++;
        });

        // Count unique AI sessions with a non-empty response per day
        const sessionsByDay = new Map<string, Set<string>>();
        (conversationsData.data || []).forEach((item: any) => {
          if (item?.response && String(item.response).trim().length > 0 && item?.session_id) {
            const day = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!sessionsByDay.has(day)) sessionsByDay.set(day, new Set<string>());
            sessionsByDay.get(day)!.add(item.session_id);
          }
        });
        sessionsByDay.forEach((set, day) => {
          const entry = dateMap.get(day);
          if (entry) entry.aiSessions += set.size;
        });

        const activity = Array.from(dateMap.entries())
          .map(([date, data]) => ({ date, ...data, atsChecks: 0 }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-Math.min(7, daysBack + 1)); // show up to last 7 points

        setActivityData(activity);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [user?.id, timeRange]);

  // Fetch applications data for success rate funnel
  const [applicationsData, setApplicationsData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchApplications = async () => {
      try {
        // Date filter based on selected range
        const now = new Date();
        const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .gte('application_date', startDate)
          .order('application_date', { ascending: false });
        
        if (!error && data) {
          setApplicationsData(data);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    
    fetchApplications();
  }, [user?.id, timeRange]);

  // Derived KPI values (frontend-only, live per-user)
  const totalApplications = useMemo(() => {
    return applicationsData.length;
  }, [applicationsData]);

  const interviewSuccessPct = useMemo(() => {
    if (!applicationsData.length) return 0;
    const isInterview = (s: string) => ['interview_scheduled', 'interview', 'interviewed', 'offer_made', 'accepted'].includes(String(s));
    const interviewed = applicationsData.filter(a => isInterview(a.status)).length;
    return Math.round((interviewed / applicationsData.length) * 100);
  }, [applicationsData]);

  const avgResponseDays = useMemo(() => {
    // Prefer next_interview_date if present; otherwise try to use updated_at when status moved beyond initial
    const diffs: number[] = [];
    for (const a of applicationsData) {
      const start = a?.application_date ? new Date(a.application_date).getTime() : NaN;
      const end =
        a?.next_interview_date ? new Date(a.next_interview_date).getTime() :
        (a?.updated_at && a?.status && a.status !== 'applied') ? new Date(a.updated_at).getTime() :
        NaN;
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        const days = (end - start) / (1000 * 60 * 60 * 24);
        if (Number.isFinite(days)) diffs.push(days);
      }
    }
    if (!diffs.length) return 0;
    const avg = diffs.reduce((s, v) => s + v, 0) / diffs.length;
    return Math.round(avg * 10) / 10; // one decimal
  }, [applicationsData]);

  // Calculate real data
  const successRateData = useMemo(() => {
    // Map statuses to funnel stages
    const isUnderReview = (s: string) => ['screening'].includes(s);
    const isInterview = (s: string) => ['interview_scheduled', 'interview', 'interviewed'].includes(s);
    const isOffer = (s: string) => ['offer_made', 'accepted'].includes(s);
    const isRejected = (s: string) => ['rejected', 'withdrawn'].includes(s);

    const applications = applicationsData.length;
    const responses = applicationsData.filter(a => isUnderReview(a.status) || isInterview(a.status) || isOffer(a.status)).length;
    const interviews = applicationsData.filter(a => isInterview(a.status) || isOffer(a.status)).length;

    return [{ week: "This period", applications, responses, interviews }];
  }, [applicationsData]);

  const goalProgress = useMemo(() => [
    { goal: "Create 5 Resumes", current: stats.resumesCreated || 0, target: 5, percentage: Math.min(100, ((stats.resumesCreated || 0) / 5) * 100), status: (stats.resumesCreated || 0) >= 5 ? "completed" : "in-progress" },
    { goal: "Complete 10 AI Sessions", current: stats.aiSessionsCompleted || 0, target: 10, percentage: Math.min(100, ((stats.aiSessionsCompleted || 0) / 10) * 100), status: (stats.aiSessionsCompleted || 0) >= 10 ? "completed" : "in-progress" },
    { goal: "Practice 5 Interviews", current: stats.interviewsCompleted || 0, target: 5, percentage: Math.min(100, ((stats.interviewsCompleted || 0) / 5) * 100), status: (stats.interviewsCompleted || 0) >= 5 ? "completed" : "in-progress" },
    { goal: "100% Profile Completion", current: stats.profileCompleteness || 0, target: 100, percentage: stats.profileCompleteness || 0, status: (stats.profileCompleteness || 0) >= 100 ? "completed" : "in-progress" },
  ], [stats]);

  const radarData = useMemo(() => [
    { skill: "Resume Quality", current: stats.resumesCreated > 0 ? 85 : 0, target: 95 },
    { skill: "Interview Skills", current: interviewSessions.length > 0 ? Math.round(interviewSessions.reduce((sum, s) => sum + (s.average_score || 0), 0) / interviewSessions.length) : 0, target: 95 },
    { skill: "AI Engagement", current: stats.aiSessionsCompleted > 0 ? Math.min(100, (stats.aiSessionsCompleted / 10) * 100) : 0, target: 90 },
    { skill: "Profile Complete", current: stats.profileCompleteness || 0, target: 100 },
  ], [stats, interviewSessions]);

  const weeklyActivity = useMemo(() => {
    // Generate activity heatmap from real data
    const weeks = 5;
    const days = 7;
    const activity: number[][] = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekData: number[] = [];
      for (let day = 0; day < days; day++) {
        // Count activities for this day
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - (weeks - week) * 7 - (days - day));
        const dayStr = dayDate.toISOString().split('T')[0];
        
        const dayResumes = resumes.filter(r => r.created_at.startsWith(dayStr)).length;
        const dayInterviews = interviewSessions.filter(s => s.created_at.startsWith(dayStr)).length;
        const dayConversations = conversations.filter(c => c.created_at.startsWith(dayStr)).length;
        
        weekData.push(Math.min(3, dayResumes + dayInterviews + dayConversations));
      }
      activity.push(weekData);
    }
    
    return activity;
  }, [resumes, interviewSessions, conversations]);

  const skillDistribution = useMemo(() => [
    { name: "Resumes", value: stats.resumesCreated || 0, color: "#14b8a6" },
    { name: "Interviews", value: stats.interviewsCompleted || 0, color: "#a855f7" },
    { name: "AI Sessions", value: stats.aiSessionsCompleted || 0, color: "#3b82f6" },
    { name: "Applications", value: stats.applicationsSubmitted || 0, color: "#ec4899" },
  ], [stats]);

  const recentAchievements = useMemo(() => {
    const achievements: any[] = [];
    
    if (stats.interviewsCompleted >= 3) {
      achievements.push({
        id: 1,
        title: "Interview Master",
        description: `Scored well in ${stats.interviewsCompleted} interviews`,
        date: "Recently",
        icon: Award,
        color: "from-yellow-500 to-orange-500"
      });
    }
    
    if (stats.resumesCreated >= 2) {
      achievements.push({
        id: 2,
        title: "Resume Pro",
        description: `Created ${stats.resumesCreated} ATS-optimized resumes`,
        date: "Recently",
        icon: FileText,
        color: "from-teal-500 to-cyan-500"
      });
    }
    
    if (stats.aiSessionsCompleted >= 5) {
      achievements.push({
        id: 3,
        title: "AI Explorer",
        description: `Completed ${stats.aiSessionsCompleted} AI coaching sessions`,
        date: "Recently",
        icon: Brain,
        color: "from-purple-500 to-pink-500"
      });
    }
    
    return achievements;
  }, [stats]);

  const exportReport = () => {
    exportElementToPrint(reportRef.current, { title: "Performance Report" });
  };

  const getHeatmapColor = (value: number) => {
    if (value === 0) return isDark ? "bg-white/5" : "bg-gray-100";
    if (value === 1) return "bg-teal-200";
    if (value === 2) return "bg-teal-400";
    return "bg-teal-600";
  };

  const isLoading = statsLoading || resumesLoading || sessionsLoading || conversationsLoading || loading;

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center ${
        isDark 
          ? 'bg-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
      }`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-50 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="size-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Performance Metrics
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your career development progress and achievements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setTimeRange("7d")}
                  variant={timeRange === "7d" ? "default" : "outline"}
                  size="sm"
                  className={timeRange === "7d" ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : ""}
                >
                  7 Days
                </Button>
                <Button
                  onClick={() => setTimeRange("30d")}
                  variant={timeRange === "30d" ? "default" : "outline"}
                  size="sm"
                  className={timeRange === "30d" ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : ""}
                >
                  30 Days
                </Button>
                <Button
                  onClick={() => setTimeRange("90d")}
                  variant={timeRange === "90d" ? "default" : "outline"}
                  size="sm"
                  className={timeRange === "90d" ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : ""}
                >
                  90 Days
                </Button>
                <Button
                  onClick={() => setTimeRange("all")}
                  variant={timeRange === "all" ? "default" : "outline"}
                  size="sm"
                  className={timeRange === "all" ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : ""}
                >
                  All Time
                </Button>
              </div>
              <Button
                onClick={exportReport}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Download className="size-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8" ref={reportRef}>
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl border p-6 transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                <TrendingUp className="size-6 text-white" />
              </div>
              {/* Growth badge reserved for future time-window comparison */}
            </div>
            <h3 className={`text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.profileCompleteness}%
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile Strength</p>
            <div className="mt-4 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.profileCompleteness))}%` }}
              />
            </div>
          </div>

          <div className={`rounded-2xl border p-6 transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Target className="size-6 text-white" />
              </div>
              {/* Growth badge reserved for future time-window comparison */}
            </div>
            <h3 className={`text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalApplications}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Applications</p>
            <div className="mt-4 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${Math.min(100, (totalApplications / 25) * 100)}%` }}
              />
            </div>
          </div>

          <div className={`rounded-2xl border p-6 transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                <Award className="size-6 text-white" />
              </div>
              {/* Growth badge reserved for future time-window comparison */}
            </div>
            <h3 className={`text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{interviewSuccessPct}%</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interview Success</p>
            <div className="mt-4 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${Math.min(100, Math.max(0, interviewSuccessPct))}%` }}
              />
            </div>
          </div>

          <div className={`rounded-2xl border p-6 transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Clock className="size-6 text-white" />
              </div>
              {/* Growth badge reserved for future time-window comparison */}
            </div>
            <h3 className={`text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgResponseDays}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response (days)</p>
            <div className="mt-4 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{
                  // Lower days = better; show fill inversely capped at 100%
                  width: `${Math.max(0, Math.min(100, 100 - Math.min(avgResponseDays, 14) / 14 * 100))}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Charts */}
          <div className="col-span-8 space-y-6">
            {/* Activity Trends */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Trends</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your daily engagement across all features
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Filter className="size-4 mr-2" />
                  Filter
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff20' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#ffffff20' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="resumes" stroke="#14b8a6" fillOpacity={1} fill="url(#colorResumes)" name="Resumes" />
                  <Area type="monotone" dataKey="interviews" stroke="#a855f7" fillOpacity={1} fill="url(#colorInterviews)" name="Interviews" />
                  <Area type="monotone" dataKey="aiSessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAI)" name="AI Sessions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Success Rate Funnel */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-6">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Application Success Funnel</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your conversion from applications to interviews
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff20' : '#e5e7eb'} />
                  <XAxis dataKey="week" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#ffffff20' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="applications" fill="#14b8a6" name="Applications" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="responses" fill="#a855f7" name="Responses" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="interviews" fill="#3b82f6" name="Interviews" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skills Radar Chart */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-6">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Skills Assessment</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current performance vs. target goals
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? '#ffffff20' : '#e5e7eb'} />
                  <PolarAngleAxis dataKey="skill" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <PolarRadiusAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Radar name="Current" dataKey="current" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.5} />
                  <Radar name="Target" dataKey="target" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Heatmap */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-6">
                <h3 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Heatmap</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your engagement pattern over the last 5 weeks
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 text-xs text-gray-500 mb-2">
                  <span className="w-12"></span>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className="w-8 text-center">{day}</span>
                  ))}
                </div>
                {weeklyActivity.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-2 items-center">
                    <span className={`text-xs w-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Week {weekIndex + 1}
                    </span>
                    {week.map((activity, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-8 h-8 rounded ${getHeatmapColor(activity)} transition-all hover:scale-110 cursor-pointer`}
                        title={`${activity} activities`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Less</span>
                <div className="flex gap-1">
                  <div className={`w-4 h-4 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}></div>
                  <div className="w-4 h-4 rounded bg-teal-200"></div>
                  <div className="w-4 h-4 rounded bg-teal-400"></div>
                  <div className="w-4 h-4 rounded bg-teal-600"></div>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>More</span>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Estel Progress Mascot */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
            }`}>
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-4xl">🐘</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                </div>
                <h3 className={`text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Keep Going!
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You're making great progress! Complete 2 more goals to reach your weekly target.
                </p>
              </div>
            </div>

            {/* Goal Progress */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Goal Progress</h3>
              <div className="space-y-4">
                {goalProgress.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {goal.status === "almost" && <AlertCircle className="size-4 text-yellow-500" />}
                        {goal.status === "in-progress" && <Activity className="size-4 text-blue-500" />}
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{goal.goal}</span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full ${
                          goal.status === "almost" 
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500" 
                            : "bg-gradient-to-r from-teal-500 to-cyan-500"
                        } transition-all duration-500`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Distribution Pie Chart */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Skill Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#ffffff20' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {skillDistribution.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }}></div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{skill.name}</span>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{skill.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Achievements</h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className={`p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{achievement.title}</h4>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.description}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{achievement.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
              <div className="space-y-2">
              <Button
                className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                onClick={() => navigate('/app/resume-builder')}
              >
                  <FileText className="size-4 mr-2" />
                  Create New Resume
                </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm"
                onClick={() => navigate('/app/interview-prep')}
              >
                <Mic className="size-4 mr-2" />
                Practice Interview
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/app/ai-coach')}
              >
                  <Brain className="size-4 mr-2" />
                  AI Coaching Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
