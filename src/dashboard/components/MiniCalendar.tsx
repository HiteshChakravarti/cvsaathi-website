import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";

interface MiniCalendarProps {
  isDark: boolean;
  onViewFull: () => void;
}

export function MiniCalendar({ isDark, onViewFull }: MiniCalendarProps) {
  const { t } = useTranslation();
  const { events, loading, getEventsForDate, getUpcomingEvents } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const hasEvent = (day: number | null) => {
    if (!day) return false;
    const dateStr = formatDateForEvent(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(dateStr);
    return dayEvents.length > 0;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const goToPreviousMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get upcoming events (next 3)
  const upcomingEvents = getUpcomingEvents(3);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'deadline':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'followup':
        return 'bg-gradient-to-r from-teal-500 to-cyan-500';
      case 'networking':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.calendar.title')}</h3>
        <button 
          onClick={onViewFull}
          className="text-sm text-teal-500 hover:text-teal-600"
        >
          {t('dashboard.calendar.viewAll')}
        </button>
      </div>

      {/* Calendar */}
      <div 
        onClick={onViewFull}
        className={`rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
          isDark
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-white border-gray-200 hover:shadow-lg'
        }`}
      >
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPreviousMonth}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {monthName}
          </span>
          <button 
            onClick={goToNextMonth}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <ChevronRight className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-200 relative ${
                  day === null
                    ? ''
                    : isToday(day)
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium'
                    : hasEvent(day)
                    ? isDark
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : isDark
                    ? 'text-gray-400 hover:bg-white/5'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {day}
                {hasEvent(day) && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-teal-400"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="mt-4">
        <h4 className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('dashboard.calendar.upcoming')}
        </h4>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={onViewFull}
                className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
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
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-xs text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('dashboard.calendar.noUpcomingEvents')}
          </p>
        )}
      </div>
    </div>
  );
}
