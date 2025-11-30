import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, Plus, Briefcase, Eye, Calendar, Gift, Search, Filter, MoreVertical, Building2, DollarSign, CalendarDays, Loader2, Edit, Trash2, X, ExternalLink, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useApplications, ApplicationStatus } from "../../hooks/useApplications";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface JobTrackerPageProps {
  isDark: boolean;
  onBack: () => void;
}

interface ApplicationFormData {
  job_title: string;
  company: string;
  status: ApplicationStatus;
  application_date: string;
  next_interview_date: string;
  notes: string;
  job_url: string;
  salary: string;
  location: string;
}

export function JobTrackerPage({ isDark, onBack }: JobTrackerPageProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<string | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const { applications, loading, saving, createApplication, updateApplication, deleteApplication } = useApplications();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenus({});
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState<ApplicationFormData>({
    job_title: '',
    company: '',
    status: 'applied',
    application_date: new Date().toISOString().split('T')[0],
    next_interview_date: '',
    notes: '',
    job_url: '',
    salary: '',
    location: ''
  });

  // Convert database applications to component format
  const jobs = useMemo(() => applications.map(app => ({
    id: app.id,
    company: app.company,
    position: app.job_title,
    salary: app.salary || undefined,
    location: app.location || undefined,
    appliedDate: app.application_date,
    status: app.status === 'screening' ? 'reviewing' : app.status as 'applied' | 'reviewing' | 'interview' | 'offer',
    notes: app.notes || undefined,
    nextInterviewDate: app.next_interview_date || undefined,
    jobUrl: app.job_url || undefined,
    dbStatus: app.status
  })), [applications]);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.notes?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'screening') {
        filtered = filtered.filter(job => job.dbStatus === 'screening');
      } else {
        filtered = filtered.filter(job => job.status === statusFilter);
      }
    }

    return filtered;
  }, [jobs, searchQuery, statusFilter]);

  const columns = [
    { id: 'applied', title: t('dashboard.jobTracker.columns.applied'), icon: Briefcase, color: 'from-teal-500 to-cyan-500', count: filteredJobs.filter(j => j.status === 'applied').length },
    { id: 'reviewing', title: t('dashboard.jobTracker.columns.reviewing'), icon: Eye, color: 'from-purple-500 to-pink-500', count: filteredJobs.filter(j => j.status === 'reviewing' || j.dbStatus === 'screening').length },
    { id: 'interview', title: t('dashboard.jobTracker.columns.interview'), icon: Calendar, color: 'from-blue-500 to-indigo-500', count: filteredJobs.filter(j => j.status === 'interview').length },
    { id: 'offer', title: t('dashboard.jobTracker.columns.offer'), icon: Gift, color: 'from-emerald-500 to-teal-500', count: filteredJobs.filter(j => j.status === 'offer').length },
  ];

  // Handle add application
  const handleAddApplication = () => {
    setFormData({
      job_title: '',
      company: '',
      status: 'applied',
      application_date: new Date().toISOString().split('T')[0],
      next_interview_date: '',
      notes: '',
      job_url: '',
      salary: '',
      location: ''
    });
    setEditingApplication(null);
    setShowAddModal(true);
  };

  // Handle edit application
  const handleEditApplication = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    setFormData({
      job_title: app.job_title,
      company: app.company,
      status: app.status,
      application_date: app.application_date,
      next_interview_date: app.next_interview_date || '',
      notes: app.notes || '',
      job_url: app.job_url || '',
      salary: app.salary || '',
      location: app.location || ''
    });
    setEditingApplication(applicationId);
    setShowAddModal(true);
  };

  // Handle delete application
  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm(t('dashboard.jobTracker.confirmDelete'))) return;

    try {
      await deleteApplication(applicationId);
      toast.success(t('dashboard.jobTracker.deleteSuccess'));
      setDeletingApplication(null);
    } catch (error: any) {
      toast.error(t('dashboard.jobTracker.deleteFailed', { error: error.message }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.job_title.trim() || !formData.company.trim()) {
      toast.error(t('dashboard.jobTracker.formValidationError') || 'Please fill in all required fields');
      return;
    }

    try {
      const applicationData = {
        job_title: formData.job_title.trim(),
        company: formData.company.trim(),
        status: formData.status,
        application_date: formData.application_date || new Date().toISOString().split('T')[0],
        next_interview_date: formData.next_interview_date || null,
        notes: formData.notes?.trim() || null,
        job_url: formData.job_url?.trim() || null,
        salary: formData.salary?.trim() || null,
        location: formData.location?.trim() || null,
      };

      console.log('Submitting application:', applicationData);

      if (editingApplication) {
        await updateApplication(editingApplication, applicationData);
        toast.success(t('dashboard.jobTracker.updateSuccess'));
      } else {
        await createApplication(applicationData);
        toast.success(t('dashboard.jobTracker.createSuccess'));
      }

      setShowAddModal(false);
      setEditingApplication(null);
      setFormData({
        job_title: '',
        company: '',
        status: 'applied',
        application_date: new Date().toISOString().split('T')[0],
        next_interview_date: '',
        notes: '',
        job_url: '',
        salary: '',
        location: ''
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(t('dashboard.jobTracker.saveFailed', { error: errorMessage }) || `Failed to save: ${errorMessage}`);
    }
  };

  // Handle status change (drag & drop alternative - click to change)
  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplication(applicationId, { status: newStatus });
      toast.success(t('dashboard.jobTracker.statusUpdated'));
    } catch (error: any) {
      toast.error(t('dashboard.jobTracker.updateFailed', { error: error.message }));
    }
  };

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
              {t('dashboard.jobTracker.loading')}
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
                  {t('dashboard.jobTracker.title')}
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('dashboard.jobTracker.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddApplication}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                <Plus className="size-4 mr-2" />
                {t('dashboard.jobTracker.addApplication')}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashboard.jobTracker.searchPlaceholder')}
                  className={`bg-transparent border-0 outline-none text-sm flex-1 ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`size-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                  } ${statusFilter !== 'all' ? 'border-teal-500' : ''}`}
                >
                  <Filter className="size-4" />
                  <span className="text-sm">{t('dashboard.jobTracker.filter')}</span>
                  {statusFilter !== 'all' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {t(`dashboard.jobTracker.status.${statusFilter}`)}
                    </span>
                  )}
                </button>
                {showFilterMenu && (
                  <div className={`absolute top-full left-0 mt-2 rounded-xl border shadow-lg z-50 min-w-[200px] ${
                    isDark
                      ? 'bg-slate-800 border-white/10'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          statusFilter === 'all'
                            ? isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'
                            : isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('dashboard.jobTracker.filterAll')}
                      </button>
                      {(['applied', 'screening', 'interview', 'offer', 'rejected'] as ApplicationStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            statusFilter === status
                              ? isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'
                              : isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {t(`dashboard.jobTracker.status.${status}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                {t('dashboard.jobTracker.viewKanban')}
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
                {t('dashboard.jobTracker.viewList')}
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
              const columnJobs = filteredJobs.filter(job => {
                if (column.id === 'reviewing') {
                  return job.dbStatus === 'screening' || job.status === 'reviewing';
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
                        {columnJobs.length}
                      </span>
                    </div>
                    <h3 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {column.title}
                    </h3>
                  </div>

                  {/* Job Cards */}
                  <div className="p-4 space-y-3 min-h-[600px] max-h-[600px] overflow-y-auto">
                    {columnJobs.length > 0 ? (
                      columnJobs.map((job) => {
                        const showMenu = openMenus[job.id] || false;
                        return (
                        <div
                          key={job.id}
                          className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] group relative ${
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
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenus(prev => ({ ...prev, [job.id]: !prev[job.id] }));
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                              {showMenu && (
                                <div className={`absolute right-0 top-6 rounded-lg border shadow-lg z-50 min-w-[160px] ${
                                  isDark
                                    ? 'bg-slate-800 border-white/10'
                                    : 'bg-white border-gray-200'
                                }`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditApplication(job.id);
                                      setOpenMenus(prev => ({ ...prev, [job.id]: false }));
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                      isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    <Edit className="size-3" />
                                    {t('dashboard.jobTracker.edit')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteApplication(job.id);
                                      setOpenMenus(prev => ({ ...prev, [job.id]: false }));
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                      isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                                    }`}
                                  >
                                    <Trash2 className="size-3" />
                                    {t('dashboard.jobTracker.delete')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            {job.salary && (
                              <div className="flex items-center gap-2">
                                <DollarSign className={`size-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.salary}
                                </span>
                              </div>
                            )}
                            {job.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className={`size-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <CalendarDays className={`size-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {t('dashboard.jobTracker.appliedOn', { date: new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}
                              </span>
                            </div>
                            {job.nextInterviewDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className={`size-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {t('dashboard.jobTracker.nextInterview', { date: new Date(job.nextInterviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })}
                                </span>
                              </div>
                            )}
                          </div>

                          {job.notes && (
                            <p className={`text-xs p-2 rounded-lg mb-2 ${
                              isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {job.notes}
                            </p>
                          )}

                          {job.jobUrl && (
                            <a
                              href={job.jobUrl.startsWith('http') ? job.jobUrl : `https://${job.jobUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`text-xs flex items-center gap-1 ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                              <ExternalLink className="size-3" />
                              {t('dashboard.jobTracker.viewJobPosting')}
                            </a>
                          )}
                        </div>
                        );
                      })
                    ) : (
                      <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <p className="text-sm">{t('dashboard.jobTracker.noApplications')}</p>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <div className="p-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        // Map column IDs to database status values
                        let status: ApplicationStatus = 'applied';
                        if (column.id === 'reviewing') {
                          status = 'screening';
                        } else if (column.id === 'interview') {
                          status = 'interview';
                        } else if (column.id === 'offer') {
                          status = 'offer';
                        } else {
                          status = 'applied';
                        }
                        setFormData(prev => ({ ...prev, status }));
                        handleAddApplication();
                      }}
                      className={`w-full py-2 rounded-lg text-sm transition-all duration-300 ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Plus className="size-4 inline mr-1" />
                      {t('dashboard.jobTracker.addJob')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className={`rounded-2xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="space-y-3">
                {filteredJobs.length > 0 ? filteredJobs.map((job) => {
                  const showMenu = openMenus[job.id] || false;
                  return (
                    <div
                      key={job.id}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] group ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {job.position}
                              </h4>
                              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {job.company}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                {job.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className={`size-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{job.location}</span>
                                  </div>
                                )}
                                {job.salary && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className={`size-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{job.salary}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <CalendarDays className={`size-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    {t('dashboard.jobTracker.appliedOn', { date: new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}
                                  </span>
                                </div>
                                {job.nextInterviewDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className={`size-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                      {t('dashboard.jobTracker.nextInterview', { date: new Date(job.nextInterviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {job.notes && (
                                <p className={`text-sm mt-3 p-2 rounded-lg ${
                                  isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {job.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                job.status === 'applied' ? 'bg-teal-500/20 text-teal-500' :
                                job.status === 'reviewing' ? 'bg-purple-500/20 text-purple-500' :
                                job.status === 'interview' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-emerald-500/20 text-emerald-500'
                              }`}>
                                {t(`dashboard.jobTracker.status.${job.dbStatus}`)}
                              </span>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenus(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                                  }`}
                                >
                                  <MoreVertical className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </button>
                                {showMenu && (
                                  <div className={`absolute right-0 top-10 rounded-lg border shadow-lg z-50 min-w-[160px] ${
                                    isDark
                                      ? 'bg-slate-800 border-white/10'
                                      : 'bg-white border-gray-200'
                                  }`}>
                                    <button
                                      onClick={() => {
                                        handleEditApplication(job.id);
                                        setOpenMenus(prev => ({ ...prev, [job.id]: false }));
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                        isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      <Edit className="size-3" />
                                      {t('dashboard.jobTracker.edit')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteApplication(job.id);
                                        setOpenMenus(prev => ({ ...prev, [job.id]: false }));
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                        isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                                      }`}
                                    >
                                      <Trash2 className="size-3" />
                                      {t('dashboard.jobTracker.delete')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {job.jobUrl && (
                            <a
                              href={job.jobUrl.startsWith('http') ? job.jobUrl : `https://${job.jobUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm flex items-center gap-1 ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                              <ExternalLink className="size-3" />
                              {t('dashboard.jobTracker.viewJobPosting')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Briefcase className={`size-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className="text-sm">{t('dashboard.jobTracker.noApplications')}</p>
                    <Button
                      onClick={handleAddApplication}
                      className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    >
                      <Plus className="size-4 mr-2" />
                      {t('dashboard.jobTracker.addApplication')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDark
              ? 'bg-slate-800 border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingApplication ? t('dashboard.jobTracker.editApplication') : t('dashboard.jobTracker.addApplication')}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApplication(null);
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.jobTitle')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                      }`}
                      placeholder={t('dashboard.jobTracker.form.jobTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.company')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                      }`}
                      placeholder={t('dashboard.jobTracker.form.companyPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.status')} *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ApplicationStatus }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <option value="applied">{t('dashboard.jobTracker.status.applied')}</option>
                      <option value="screening">{t('dashboard.jobTracker.status.screening')}</option>
                      <option value="interview">{t('dashboard.jobTracker.status.interview')}</option>
                      <option value="offer">{t('dashboard.jobTracker.status.offer')}</option>
                      <option value="rejected">{t('dashboard.jobTracker.status.rejected')}</option>
                      <option value="withdrawn">{t('dashboard.jobTracker.status.withdrawn')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.applicationDate')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.application_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, application_date: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.location')}
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                      }`}
                      placeholder={t('dashboard.jobTracker.form.locationPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.jobTracker.form.salary')}
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                      }`}
                      placeholder={t('dashboard.jobTracker.form.salaryPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.jobTracker.form.jobUrl')}
                  </label>
                  <input
                    type="url"
                    value={formData.job_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_url: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder={t('dashboard.jobTracker.form.jobUrlPlaceholder')}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.jobTracker.form.nextInterviewDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.next_interview_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_interview_date: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.jobTracker.form.notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-xl border resize-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder={t('dashboard.jobTracker.form.notesPlaceholder')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingApplication(null);
                    }}
                    className="flex-1"
                  >
                    {t('dashboard.jobTracker.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t('dashboard.jobTracker.saving')}
                      </>
                    ) : editingApplication ? (
                      t('dashboard.jobTracker.update')
                    ) : (
                      t('dashboard.jobTracker.create')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
