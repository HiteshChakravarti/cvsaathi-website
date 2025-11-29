import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, MoreVertical, Edit, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useCalendarEvents, CalendarEvent as CalendarEventType } from "../../hooks/useCalendarEvents";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CalendarPageProps {
  isDark: boolean;
  onBack: () => void;
}

interface EventFormData {
  title: string;
  date: string;
  time: string;
  type: 'interview' | 'deadline' | 'followup' | 'networking';
  company: string;
  location: string;
  notes: string;
}

export function CalendarPage({ isDark, onBack }: CalendarPageProps) {
  const { t } = useTranslation();
  const { events, loading, createEvent, updateEvent, deleteEvent, getEventsForDate, getUpcomingEvents } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventType | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'interview',
    company: '',
    location: '',
    notes: ''
  });

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Format date to YYYY-MM-DD
  const formatDateForEvent = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get events for a specific day
  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = formatDateForEvent(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getEventsForDate(dateStr);
  };

  // Check if a day is today
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Format time from HH:MM:SS to HH:MM AM/PM
  const formatTime = (time: string | null): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format time from HH:MM AM/PM to HH:MM:SS
  const parseTime = (timeStr: string): string | null => {
    if (!timeStr.trim()) return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  };

  // Handle add event
  const handleAddEvent = () => {
    if (selectedDate) {
      const dateStr = formatDateForEvent(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
    setEditingEvent(null);
    setShowAddModal(true);
  };

  // Handle edit event
  const handleEditEvent = (event: CalendarEventType) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time ? formatTime(event.time) : '',
      type: event.type,
      company: event.company || '',
      location: event.location || '',
      notes: event.notes || ''
    });
    setShowAddModal(true);
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm(t('dashboard.calendar.confirmDelete'))) return;
    
    try {
      await deleteEvent(eventId);
      toast.success(t('dashboard.calendar.eventDeleted'));
    } catch (error: any) {
      toast.error(t('dashboard.calendar.deleteFailed', { error: error.message }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const timeValue = parseTime(formData.time);
      
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: formData.title,
          date: formData.date,
          time: timeValue,
          type: formData.type,
          company: formData.company || null,
          location: formData.location || null,
          notes: formData.notes || null
        });
        toast.success(t('dashboard.calendar.eventUpdated'));
      } else {
        await createEvent({
          title: formData.title,
          date: formData.date,
          time: timeValue,
          type: formData.type,
          company: formData.company || null,
          location: formData.location || null,
          notes: formData.notes || null
        });
        toast.success(t('dashboard.calendar.eventCreated'));
      }
      
      setShowAddModal(false);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'interview',
        company: '',
        location: '',
        notes: ''
      });
      setEditingEvent(null);
    } catch (error: any) {
      toast.error(t('dashboard.calendar.saveFailed', { error: error.message }));
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const selectedDateStr = selectedDate 
    ? formatDateForEvent(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    : null;
  const selectedDateEvents = selectedDateStr ? getEventsForDate(selectedDateStr) : [];
  
  const upcomingEvents = getUpcomingEvents(5);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'from-blue-500 to-indigo-500';
      case 'deadline':
        return 'from-red-500 to-pink-500';
      case 'followup':
        return 'from-teal-500 to-cyan-500';
      case 'networking':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'deadline':
        return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
      case 'followup':
        return isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700';
      case 'networking':
        return isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

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
          <div className="flex items-center justify-between">
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
                  {t('dashboard.calendar.pageTitle')}
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('dashboard.calendar.pageDescription')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddEvent}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
            >
              <Plus className="size-4 mr-2" />
              {t('dashboard.calendar.addEvent')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {/* Calendar */}
            <div className={`col-span-2 rounded-2xl border p-8 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={goToPreviousMonth}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
                <div className="flex items-center gap-4">
                  <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {monthName}
                  </h2>
                  <Button
                    onClick={goToToday}
                    variant="outline"
                    size="sm"
                    className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}
                  >
                    {t('dashboard.calendar.today')}
                  </Button>
                </div>
                <button 
                  onClick={goToNextMonth}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-4">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  const hasEvents = dayEvents.length > 0;
                  const isSelected = selectedDate && day && 
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear();
                  
                  return (
                    <div
                      key={index}
                      onClick={() => day && handleDayClick(day)}
                      className={`min-h-24 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        day === null
                          ? ''
                          : isSelected
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white scale-105'
                          : isToday(day)
                          ? isDark
                            ? 'bg-white/10 hover:bg-white/20 border-2 border-teal-400'
                            : 'bg-teal-50 hover:bg-teal-100 border-2 border-teal-400'
                          : hasEvents
                          ? isDark
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-gray-50 hover:bg-gray-100'
                          : isDark
                          ? 'hover:bg-white/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm mb-2 ${
                            isSelected
                              ? 'text-white font-medium'
                              : isDark
                              ? 'text-gray-400'
                              : 'text-gray-700'
                          }`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : getEventBadgeColor(event.type)
                                } truncate`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className={`text-xs ${
                                isSelected
                                  ? 'text-white/70'
                                  : isDark
                                  ? 'text-gray-500'
                                  : 'text-gray-600'
                              }`}>
                                +{dayEvents.length - 2} {t('dashboard.calendar.more')}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Events */}
              <div className={`rounded-2xl border p-6 ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDate 
                    ? t('dashboard.calendar.eventsOnDate', { 
                        date: selectedDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      })
                    : t('dashboard.calendar.todaysEvents')
                  }
                </h3>
                
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`px-2 py-1 rounded text-xs ${getEventBadgeColor(event.type)}`}>
                            {t(`dashboard.calendar.eventTypes.${event.type}`)}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className={`p-1 rounded hover:bg-white/10 ${
                                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Edit className="size-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className={`p-1 rounded hover:bg-red-500/20 ${
                                isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {event.title}
                        </h4>
                        
                        {event.company && (
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.company}
                          </p>
                        )}
                        
                        <div className="space-y-1">
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className={`size-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatTime(event.time)}
                              </span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className={`size-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {event.notes && (
                          <p className={`text-xs mt-3 p-2 rounded-lg ${
                            isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {event.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('dashboard.calendar.noEventsScheduled')}
                  </p>
                )}
              </div>

              {/* Upcoming Events */}
              <div className={`rounded-2xl border p-6 ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('dashboard.calendar.upcomingEvents')}
                </h3>
                
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          const eventDate = new Date(event.date);
                          setCurrentDate(eventDate);
                          setSelectedDate(eventDate);
                        }}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getEventColor(event.type)}`}>
                            <CalendarIcon className="size-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {event.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                weekday: 'short'
                              })} {event.time && `• ${formatTime(event.time)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('dashboard.calendar.noUpcomingEvents')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto ${
            isDark
              ? 'bg-slate-800 border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingEvent ? t('dashboard.calendar.editEvent') : t('dashboard.calendar.addEvent')}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      date: new Date().toISOString().split('T')[0],
                      time: '',
                      type: 'interview',
                      company: '',
                      location: '',
                      notes: ''
                    });
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.calendar.eventTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder={t('dashboard.calendar.eventTitlePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.calendar.date')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('dashboard.calendar.time')}
                    </label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="10:00 AM"
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.calendar.eventType')} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <option value="interview">{t('dashboard.calendar.eventTypes.interview')}</option>
                    <option value="deadline">{t('dashboard.calendar.eventTypes.deadline')}</option>
                    <option value="followup">{t('dashboard.calendar.eventTypes.followup')}</option>
                    <option value="networking">{t('dashboard.calendar.eventTypes.networking')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.calendar.company')}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder={t('dashboard.calendar.companyPlaceholder')}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.calendar.location')}
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
                    placeholder={t('dashboard.calendar.locationPlaceholder')}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('dashboard.calendar.notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder={t('dashboard.calendar.notesPlaceholder')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEvent(null);
                      setFormData({
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        time: '',
                        type: 'interview',
                        company: '',
                        location: '',
                        notes: ''
                      });
                    }}
                    className="flex-1"
                  >
                    {t('dashboard.calendar.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    {editingEvent ? t('dashboard.calendar.update') : t('dashboard.calendar.create')}
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
