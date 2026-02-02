/**
 * InterviewCalendar Page
 * Calendar view for interviews with month navigation and event details.
 * 
 * @module pages/interviews/InterviewCalendar
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus,
  Clock, MapPin, Video, Phone, Building2, Code, Users, Users2, Award,
  Loader2, List, Grid3X3
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addMonths, subMonths, isSameMonth, isSameDay, isToday,
  eachDayOfInterval, parseISO
} from 'date-fns';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { interviewService, getInterviewTypeConfig, INTERVIEW_TYPES } from '@/services/interviewService';
import InterviewForm from './InterviewForm';

// Icon mapping
const TYPE_ICONS = {
  Phone,
  Video,
  Building2,
  Code,
  Users,
  Users2,
  Award,
  Calendar: CalendarIcon
};

/**
 * Single day cell in calendar
 */
function DayCell({ day, currentMonth, interviews, onEventClick }) {
  const dayInterviews = interviews.filter(interview => 
    isSameDay(parseISO(interview.scheduled_at), day)
  );
  
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);

  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border-b border-r border-slate-200",
        "transition-colors",
        !isCurrentMonth && "bg-slate-50/50",
        isCurrentDay && "bg-teal-brand-50/50"
      )}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-full text-sm",
            isCurrentDay && "bg-teal-brand-500 text-white font-bold",
            !isCurrentDay && isCurrentMonth && "text-slate-900",
            !isCurrentMonth && "text-slate-400"
          )}
        >
          {format(day, 'd')}
        </span>
        {dayInterviews.length > 0 && (
          <span className="text-xs text-slate-500">
            {dayInterviews.length} event{dayInterviews.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Events */}
      <div className="space-y-1">
        {dayInterviews.slice(0, 3).map((interview) => {
          const config = getInterviewTypeConfig(interview.interview_type);
          const Icon = TYPE_ICONS[config.icon] || CalendarIcon;
          
          return (
            <button
              key={interview.id}
              onClick={() => onEventClick(interview)}
              className={cn(
                "w-full text-left p-1.5 rounded text-xs truncate",
                "transition-all hover:ring-2 hover:ring-offset-1",
                config.bgColor,
                config.color,
                "hover:ring-current"
              )}
            >
              <div className="flex items-center gap-1">
                <Icon size={10} className="shrink-0" />
                <span className="truncate font-medium">
                  {format(parseISO(interview.scheduled_at), 'h:mm a')}
                </span>
              </div>
              <p className="truncate text-[10px] opacity-80">
                {interview.application?.company_name || 'Interview'}
              </p>
            </button>
          );
        })}
        {dayInterviews.length > 3 && (
          <p className="text-[10px] text-slate-500 pl-1">
            +{dayInterviews.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Interview event popup/preview
 */
function EventPreview({ interview }) {
  const config = getInterviewTypeConfig(interview.interview_type);
  const Icon = TYPE_ICONS[config.icon] || CalendarIcon;
  const interviewDate = parseISO(interview.scheduled_at);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          config.bgColor,
          "border",
          config.borderColor
        )}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{config.label}</h3>
          {interview.application && (
            <p className="text-sm text-slate-600">
              {interview.application.company_name} - {interview.application.job_title}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarIcon size={14} className="text-slate-400" />
          {format(interviewDate, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={14} className="text-slate-400" />
          {format(interviewDate, 'h:mm a')}
          {interview.duration_minutes && (
            <span className="text-slate-400">
              ({interview.duration_minutes} min)
            </span>
          )}
        </div>
        {interview.location && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} className="text-slate-400" />
            {interview.location}
          </div>
        )}
        {interview.meeting_link && (
          <div className="flex items-center gap-2 text-sm">
            <Video size={14} className="text-slate-400" />
            <a 
              href={interview.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-brand-600 hover:text-teal-brand-700 truncate"
            >
              Join Meeting
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <Link to={`/interviews/${interview.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            View Details
          </Button>
        </Link>
        {interview.meeting_link && (
          <a 
            href={interview.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full" size="sm">
              <Video size={14} />
              Join
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Calendar loading skeleton
 */
function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-center">
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
        {[...Array(35)].map((_, i) => (
          <div key={i} className="min-h-[100px] p-2 border-b border-r border-slate-200">
            <Skeleton className="h-6 w-6 rounded-full mb-2" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Interview Calendar Page Component
 */
export default function InterviewCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNewInterviewOpen, setIsNewInterviewOpen] = useState(false);

  // Calculate date range for the calendar view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Fetch interviews for the visible range
  const { data, isLoading } = useQuery({
    queryKey: ['interviews', 'calendar', format(calendarStart, 'yyyy-MM-dd'), format(calendarEnd, 'yyyy-MM-dd')],
    queryFn: () => interviewService.getCalendarEvents(
      format(calendarStart, 'yyyy-MM-dd'),
      format(calendarEnd, 'yyyy-MM-dd')
    )
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Organize interviews by date
  const interviews = data || [];

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview Calendar</h1>
          <p className="text-slate-500 mt-1">
            View and manage your upcoming interviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/interviews">
            <Button variant="outline" size="sm">
              <List size={16} />
              List View
            </Button>
          </Link>
          <Button onClick={() => setIsNewInterviewOpen(true)}>
            <Plus size={16} />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="p-2"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="p-2"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-100">
          {Object.entries(INTERVIEW_TYPES).slice(0, 6).map(([key, config]) => {
            const Icon = TYPE_ICONS[config.icon] || CalendarIcon;
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <div className={cn("w-3 h-3 rounded", config.bgColor)} />
                <span className="text-slate-600">{config.label}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-slate-600 border-r border-slate-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                currentMonth={currentMonth}
                interviews={interviews}
                onEventClick={setSelectedEvent}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Upcoming This Week */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Coming Up This Week
        </h3>
        {interviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No interviews scheduled this month
          </p>
        ) : (
          <div className="space-y-3">
            {interviews
              .filter(i => new Date(i.scheduled_at) >= new Date())
              .slice(0, 5)
              .map((interview) => {
                const config = getInterviewTypeConfig(interview.interview_type);
                const Icon = TYPE_ICONS[config.icon] || CalendarIcon;
                const interviewDate = parseISO(interview.scheduled_at);
                
                return (
                  <Link
                    key={interview.id}
                    to={`/interviews/${interview.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      config.bgColor,
                      "border",
                      config.borderColor
                    )}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {interview.application?.company_name || 'Interview'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {config.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {format(interviewDate, 'MMM d')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(interviewDate, 'h:mm a')}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </Card>

      {/* Event Preview Modal */}
      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Interview Details"
        size="sm"
      >
        {selectedEvent && (
          <EventPreview 
            interview={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </Modal>

      {/* New Interview Modal */}
      <Modal
        isOpen={isNewInterviewOpen}
        onClose={() => setIsNewInterviewOpen(false)}
        title="Schedule New Interview"
        size="lg"
      >
        <InterviewForm
          onSuccess={() => setIsNewInterviewOpen(false)}
          onCancel={() => setIsNewInterviewOpen(false)}
        />
      </Modal>
    </div>
  );
}
