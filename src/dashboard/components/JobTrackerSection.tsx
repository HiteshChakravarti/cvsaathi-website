import { Plus, Briefcase, Eye, Calendar, Gift, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useApplications } from "../../hooks/useApplications";

interface JobTrackerSectionProps {
  isDark: boolean;
  onViewAll: () => void;
}

export function JobTrackerSection({ isDark, onViewAll }: JobTrackerSectionProps) {
  const { applications, loading } = useApplications();

  // Convert database applications to component format
  const jobs = applications.map(app => ({
    id: app.id,
    company: app.company,
    position: app.job_title,
    salary: undefined, // Not in database schema
    appliedDate: app.application_date,
    status: app.status === 'screening' ? 'reviewing' : app.status as 'applied' | 'reviewing' | 'interview' | 'offer',
  }));

  const columns = [
    { id: 'applied', title: 'Applied', icon: Briefcase, color: 'from-teal-500 to-cyan-500', count: jobs.filter(j => j.status === 'applied').length },
    { id: 'reviewing', title: 'Reviewing', icon: Eye, color: 'from-purple-500 to-pink-500', count: applications.filter(a => a.status === 'screening' || jobs.find(j => j.id === a.id)?.status === 'reviewing').length },
    { id: 'interview', title: 'Interview', icon: Calendar, color: 'from-blue-500 to-indigo-500', count: jobs.filter(j => j.status === 'interview').length },
    { id: 'offer', title: 'Offer', icon: Gift, color: 'from-emerald-500 to-teal-500', count: jobs.filter(j => j.status === 'offer').length },
  ];

  if (loading) {
    return (
      <div className="pt-8 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-teal-500" />
          <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading applications...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Application Tracker
        </h2>
        <Button
          onClick={onViewAll}
          variant="ghost"
          className={`gap-2 ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}
        >
          View All
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => {
              const Icon = column.icon;
              // Map database statuses to UI statuses
              const columnJobs = jobs.filter(job => {
                if (column.id === 'reviewing') {
                  const app = applications.find(a => a.id === job.id);
                  return app?.status === 'screening' || job.status === 'reviewing';
                }
                return job.status === column.id;
              });
          
          return (
            <div
              key={column.id}
              className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:shadow-lg'
              }`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${column.color}`}>
                    <Icon className="size-4 text-white" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {column.count}
                  </span>
                </div>
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {column.title}
                </h3>
              </div>

              {/* Job Cards */}
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {columnJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <h4 className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {job.company}
                    </h4>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {job.position}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                        {job.salary}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {columnJobs.length === 0 && (
                  <div className={`p-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-xs">No applications</p>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <div className="p-3 border-t border-white/10">
                <button
                  className={`w-full py-2 rounded-lg text-sm transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="size-4 inline mr-1" />
                  Add Job
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
