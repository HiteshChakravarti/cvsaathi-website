import { CircularProgressCard } from "./CircularProgressCard";
import { ActivityWidget } from "./ActivityWidget";
import { MiniCalendar } from "./MiniCalendar";

interface RightRailProps {
  isDark: boolean;
  statsLoading: boolean;
  stats: {
    resumesCreated: number;
    aiSessionsCompleted: number;
    interviewsCompleted: number;
    profileCompleteness: number;
    totalTimeSpent: number;
    applicationsSubmitted: number;
  };
  activitiesLoading: boolean;
  recentActivities: Array<{
    id: string;
    name: string;
    formattedTime: string;
    avatar?: string;
    type: string;
  }>;
  profileLoading: boolean;
  userProfile: { first_name?: string; last_name?: string; full_name?: string } | null;
  subscriptionLoading: boolean;
  currentPlan: { displayName: string };
  userEmail?: string;
  onFeatureClick: (section: string) => void;
  onMetricClick: (metric: string) => void;
}

export function RightRail({
  isDark,
  statsLoading,
  stats,
  activitiesLoading,
  recentActivities,
  profileLoading,
  userProfile,
  subscriptionLoading,
  currentPlan,
  userEmail,
  onFeatureClick,
  onMetricClick,
}: RightRailProps) {
  const profileName =
    userProfile?.full_name ||
    (userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userEmail?.split("@")[0] || "User");

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => onFeatureClick("profile")}
        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500" />
        <div className="text-left">
          <p className={`text-sm font-semibold break-words ${isDark ? "text-white" : "text-gray-900"}`}>
            {profileLoading ? "Loading..." : profileName}
          </p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {subscriptionLoading ? "Loading..." : currentPlan.displayName} Plan
          </p>
        </div>
      </button>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Performance</h3>
          <button onClick={() => onFeatureClick("performance-metrics")} className="text-xs text-teal-500 hover:text-teal-600">
            View all
          </button>
        </div>
        <div className="space-y-4">
          <CircularProgressCard
            value={statsLoading ? 0 : stats.resumesCreated}
            maxValue={5}
            label="Resumes Created"
            subtext={statsLoading ? "Loading..." : `${stats.resumesCreated} total`}
            gradient="from-teal-500 to-cyan-400"
            isDark={isDark}
            onClick={() => onMetricClick("resumes")}
          />
          <CircularProgressCard
            value={statsLoading ? 0 : stats.aiSessionsCompleted}
            maxValue={10}
            label="AI Sessions"
            subtext={statsLoading ? "Loading..." : `${Math.floor(stats.totalTimeSpent / 60)}h ${stats.totalTimeSpent % 60}m total`}
            gradient="from-purple-500 to-pink-400"
            isDark={isDark}
            onClick={() => onMetricClick("ai sessions")}
          />
          <CircularProgressCard
            value={statsLoading ? 0 : stats.interviewsCompleted}
            maxValue={5}
            label="Interview Prep"
            subtext={statsLoading ? "Loading..." : `${stats.interviewsCompleted} completed`}
            gradient="from-blue-500 to-indigo-500"
            isDark={isDark}
            onClick={() => onMetricClick("interview prep")}
          />
          <CircularProgressCard
            value={statsLoading ? 0 : stats.profileCompleteness}
            maxValue={100}
            label="Profile Complete"
            subtext={statsLoading ? "Loading..." : `${stats.profileCompleteness}% complete`}
            gradient="from-emerald-500 to-teal-500"
            isDark={isDark}
            onClick={() => onMetricClick("profile complete")}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Recent Activity</h3>
          <button className="text-xs text-teal-500 hover:text-teal-600">See all</button>
        </div>
        <div className="space-y-3">
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <ActivityWidget
                key={activity.id}
                name={activity.name}
                id={activity.formattedTime}
                avatar={activity.avatar}
                isDark={isDark}
                isOnline={["resume", "ai_session", "ats_check", "skill_gap"].includes(activity.type)}
              />
            ))
          ) : (
            <p className={`text-xs text-center py-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>No recent activity</p>
          )}
        </div>
      </section>

      <MiniCalendar isDark={isDark} onViewFull={() => onFeatureClick("calendar")} />
    </div>
  );
}


