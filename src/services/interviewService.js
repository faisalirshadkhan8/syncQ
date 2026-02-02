/**
 * Interview Service
 * Handles all interview-related API operations including CRUD,
 * calendar integration, and outcome management.
 * 
 * @module services/interviewService
 */

import api from './api';

/**
 * Interview type definitions with icons and colors
 * @type {Object.<string, {label: string, icon: string, color: string, bgColor: string}>}
 */
export const INTERVIEW_TYPES = {
  phone_screen: {
    label: 'Phone Screen',
    icon: 'Phone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  video: {
    label: 'Video Call',
    icon: 'Video',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  onsite: {
    label: 'On-site',
    icon: 'Building2',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  technical: {
    label: 'Technical',
    icon: 'Code',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  behavioral: {
    label: 'Behavioral',
    icon: 'Users',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  panel: {
    label: 'Panel Interview',
    icon: 'Users2',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  final: {
    label: 'Final Round',
    icon: 'Award',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  other: {
    label: 'Other',
    icon: 'Calendar',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  }
};

/**
 * Interview outcome/status options
 */
export const INTERVIEW_OUTCOMES = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  },
  passed: {
    label: 'Passed',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  failed: {
    label: 'Not Selected',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100'
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  no_show: {
    label: 'No Show',
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  }
};

/**
 * Get interview type configuration
 * @param {string} type - Interview type key
 * @returns {Object} Type configuration with label, icon, colors
 */
export const getInterviewTypeConfig = (type) => {
  return INTERVIEW_TYPES[type] || INTERVIEW_TYPES.other;
};

/**
 * Get interview outcome configuration
 * @param {string} outcome - Outcome key
 * @returns {Object} Outcome configuration with label and colors
 */
export const getInterviewOutcomeConfig = (outcome) => {
  return INTERVIEW_OUTCOMES[outcome] || INTERVIEW_OUTCOMES.scheduled;
};

/**
 * @typedef {Object} Interview
 * @property {number} id - Interview ID
 * @property {number} application_id - Associated application ID
 * @property {string} interview_type - Type of interview
 * @property {string} scheduled_at - Interview date/time
 * @property {string} [location] - Interview location
 * @property {string} [meeting_link] - Video call link
 * @property {string} [notes] - Preparation notes
 * @property {string} outcome - Interview outcome
 * @property {Object[]} [interviewers] - List of interviewers
 * @property {Object} [application] - Application details
 */

/**
 * @typedef {Object} CalendarEvent
 * @property {number} id - Interview ID
 * @property {string} title - Event title
 * @property {string} start - Start datetime
 * @property {string} end - End datetime
 * @property {string} type - Interview type
 * @property {Object} application - Application info
 */

export const interviewService = {
  /**
   * List interviews with filters
   * @param {Object} params - Query parameters
   * @param {number} [params.page] - Page number
   * @param {number} [params.per_page] - Items per page
   * @param {string} [params.outcome] - Filter by outcome
   * @param {string} [params.interview_type] - Filter by type
   * @param {number} [params.application_id] - Filter by application
   * @param {string} [params.from_date] - Start date filter
   * @param {string} [params.to_date] - End date filter
   * @returns {Promise<{interviews: Interview[], pagination: Object}>}
   */
  getInterviews: async (params) => {
    const response = await api.get('/interviews/', { params });
    return response.data;
  },

  /**
   * Get upcoming interviews
   * @param {number} [days=7] - Number of days to look ahead
   * @returns {Promise<Interview[]>}
   */
  getUpcoming: async (days = 7) => {
    const response = await api.get('/interviews/upcoming', { params: { days } });
    return response.data;
  },

  /**
   * Get calendar events for a date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<CalendarEvent[]>}
   */
  getCalendarEvents: async (startDate, endDate) => {
    const response = await api.get('/interviews/calendar', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  /**
   * Create new interview
   * @param {Object} data - Interview data
   * @returns {Promise<Interview>}
   */
  createInterview: async (data) => {
    const response = await api.post('/interviews/', data);
    return response.data;
  },

  /**
   * Get interview details
   * @param {number} id - Interview ID
   * @returns {Promise<Interview>}
   */
  getInterview: async (id) => {
    const response = await api.get(`/interviews/${id}/`);
    return response.data;
  },

  /**
   * Update interview
   * @param {number} id - Interview ID
   * @param {Object} data - Updated data
   * @returns {Promise<Interview>}
   */
  updateInterview: async (id, data) => {
    const response = await api.patch(`/interviews/${id}/`, data);
    return response.data;
  },

  /**
   * Delete interview
   * @param {number} id - Interview ID
   * @returns {Promise<void>}
   */
  deleteInterview: async (id) => {
    await api.delete(`/interviews/${id}/`);
  },

  /**
   * Update interview outcome
   * @param {number} id - Interview ID
   * @param {string} outcome - New outcome
   * @param {string} [notes] - Outcome notes
   * @returns {Promise<Interview>}
   */
  updateOutcome: async (id, outcome, notes) => {
    const response = await api.patch(`/interviews/${id}/outcome/`, { outcome, notes });
    return response.data;
  },

  /**
   * Add interviewer to interview
   * @param {number} interviewId - Interview ID
   * @param {Object} interviewer - Interviewer data
   * @returns {Promise<Interview>}
   */
  addInterviewer: async (interviewId, interviewer) => {
    const response = await api.post(`/interviews/${interviewId}/interviewers`, interviewer);
    return response.data;
  },

  /**
   * Remove interviewer from interview
   * @param {number} interviewId - Interview ID
   * @param {number} interviewerId - Interviewer ID
   * @returns {Promise<void>}
   */
  removeInterviewer: async (interviewId, interviewerId) => {
    await api.delete(`/interviews/${interviewId}/interviewers/${interviewerId}`);
  }
};

/**
 * Format interview duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

/**
 * Get time until interview
 * @param {string} scheduledAt - Interview date/time
 * @returns {{value: number, unit: string, isPast: boolean}}
 */
export const getTimeUntilInterview = (scheduledAt) => {
  const now = new Date();
  const interviewDate = new Date(scheduledAt);
  const diffMs = interviewDate - now;
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  if (days > 0) return { value: days, unit: 'day', isPast };
  if (hours > 0) return { value: hours, unit: 'hour', isPast };
  return { value: minutes, unit: 'minute', isPast };
};

export default interviewService;
