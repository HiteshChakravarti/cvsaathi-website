import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, MoreVertical } from "lucide-react";
import { Button } from "../../components/ui/button";

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'interview' | 'deadline' | 'followup' | 'networking';
  company?: string;
  location?: string;
  notes?: string;
}

interface CalendarPageProps {
  isDark: boolean;
  onBack: () => void;
}

export function CalendarPage({ isDark, onBack }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Sample events
  const events: CalendarEvent[] = [
    { 
      id: '1', 
      date: '2024-12-15', 
      time: '10:00 AM',
      title: 'Technical Interview', 
      type: 'interview',
      company: 'Google',
      location: 'Video Call',
      notes: 'Prepare system design questions'
    },
    { 
      id: '2', 
      date: '2024-12-15', 
      time: '2:30 PM',
      title: 'Coffee Chat', 
      type: 'networking',
      company: 'LinkedIn Contact',
      location: 'Starbucks Downtown'
    },
    { 
      id: '3', 
      date: '2024-12-18', 
      time: '11:59 PM',
      title: 'Resume Submission Deadline', 
      type: 'deadline',
      company: 'Microsoft'
    },
    { 
      id: '4', 
      date: '2024-12-20', 
      time: '9:00 AM',
      title: 'Follow-up Email', 
      type: 'followup',
      company: 'Microsoft',
      notes: 'Send thank you note after interview'
    },
    { 
      id: '5', 
      date: '2024-12-22', 
      time: '3:00 PM',
      title: 'Final Round Interview', 
      type: 'interview',
      company: 'Meta',
      location: 'On-site - Menlo Park'
    },
    { 
      id: '6', 
      date: '2024-12-25', 
      time: '11:59 PM',
      title: 'Amazon Application Deadline', 
      type: 'deadline',
      company: 'Amazon'
    },
  ];

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

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `2024-12-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    return day === 13 && currentDate.getMonth() === 11;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

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
                  Calendar
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your interviews, deadlines, and events
                </p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
            >
              <Plus className="size-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Calendar */}
          <div className={`col-span-2 rounded-2xl border p-8 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button className={`p-2 rounded-xl transition-all duration-300 ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}>
                <ChevronLeft className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {monthName}
              </h2>
              <button className={`p-2 rounded-xl transition-all duration-300 ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}>
                <ChevronRight className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    className={`min-h-24 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                      day === null
                        ? ''
                        : selectedDate === day
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
                          selectedDate === day
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
                                selectedDate === day
                                  ? 'bg-white/20 text-white'
                                  : getEventBadgeColor(event.type)
                              } truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className={`text-xs ${
                              selectedDate === day
                                ? 'text-white/70'
                                : isDark
                                ? 'text-gray-500'
                                : 'text-gray-600'
                            }`}>
                              +{dayEvents.length - 2} more
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
            {/* Today's Events */}
            <div className={`rounded-2xl border p-6 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedDate ? `Events on Dec ${selectedDate}` : "Today's Events"}
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
                          {event.type}
                        </div>
                        <button>
                          <MoreVertical className={`size-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
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
                        <div className="flex items-center gap-2">
                          <Clock className={`size-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.time}
                          </span>
                        </div>
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
                  No events scheduled
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
                Upcoming Events
              </h3>
              
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
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
                          })} • {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
