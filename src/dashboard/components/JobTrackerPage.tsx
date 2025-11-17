import { useState } from "react";
import { ChevronLeft, Plus, Briefcase, Eye, Calendar, Gift, Search, Filter, MoreVertical, Building2, DollarSign, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useApplications } from "../../hooks/useApplications";
import { toast } from "sonner";

interface JobTrackerPageProps {
  isDark: boolean;
  onBack: () => void;
}

export function JobTrackerPage({ isDark, onBack }: JobTrackerPageProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const { applications, loading, createApplication, updateApplication, deleteApplication } = useApplications();

  // Convert database applications to component format
  const jobs = applications.map(app => ({
    id: app.id,
    company: app.company,
    position: app.job_title,
    salary: undefined, // Not in database schema
    location: undefined, // Not in database schema
    appliedDate: app.application_date,
    status: app.status === 'screening' ? 'reviewing' : app.status as 'applied' | 'reviewing' | 'interview' | 'offer',
    notes: app.notes,
    nextInterviewDate: app.next_interview_date,
  }));

  const columns = [
    { id: 'applied', title: 'Applied', icon: Briefcase, color: 'from-teal-500 to-cyan-500', count: jobs.filter(j => j.status === 'applied').length },
    { id: 'reviewing', title: 'Under Review', icon: Eye, color: 'from-purple-500 to-pink-500', count: jobs.filter(j => j.status === 'reviewing' || j.status === 'screening').length },
    { id: 'interview', title: 'Interview', icon: Calendar, color: 'from-blue-500 to-indigo-500', count: jobs.filter(j => j.status === 'interview').length },
    { id: 'offer', title: 'Offer Received', icon: Gift, color: 'from-emerald-500 to-teal-500', count: jobs.filter(j => j.status === 'offer').length },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
      }`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="size-8 animate-spin text-teal-500 mx-auto mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading applications...
            </p>
          </div>
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
      <header className={`border-b transition-colors duration-500 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <div>
                <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Job Application Tracker
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your job applications from start to finish
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                <Plus className="size-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-gray-200'
              }`}>
                <Search className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className={`bg-transparent border-0 outline-none text-sm ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}>
                <Filter className="size-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-gray-100 border-gray-200'
            }`}>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <div
                key={column.id}
                className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${column.color}`}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <span className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {column.count}
                  </span>
                </div>
                <h3 className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {column.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-4 gap-6">
            {columns.map((column) => {
              const Icon = column.icon;
              // Map database statuses to UI statuses
              const columnJobs = jobs.filter(job => {
                if (column.id === 'reviewing') {
                  // Include both 'reviewing' (mapped from screening) and 'screening' status
                  const app = applications.find(a => a.id === job.id);
                  return app?.status === 'screening' || job.status === 'reviewing';
                }
                return job.status === column.id;
              });
              
              return (
                <div
                  key={column.id}
                  className={`rounded-2xl border backdrop-blur-sm ${
                    isDark
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white border-gray-200'
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
                  <div className="p-4 space-y-3 min-h-[600px] max-h-[600px] overflow-y-auto">
                    {columnJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] group ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {job.company}
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {job.position}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add edit/delete menu
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className={`size-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {job.salary}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className={`size-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {job.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className={`size-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Applied {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {job.notes && (
                          <p className={`text-xs p-2 rounded-lg ${
                            isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {job.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Button */}
                  <div className="p-4 border-t border-white/10">
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
        )}
      </main>
    </div>
  );
}
