/**
 * AI Service
 * Handles all AI-related API operations including cover letter generation,
 * job match analysis, interview questions, and AI history management.
 * 
 * @module services/aiService
 * @see FRONTEND_API_DOCUMENTATION.md Section 7: AI Features
 */

import api from './api';

// ============================================
// CONSTANTS & TYPES
// ============================================

/**
 * Tone options for cover letter generation
 * @type {Object.<string, {value: string, label: string, description: string}>}
 */
export const COVER_LETTER_TONES = {
  professional: {
    value: 'professional',
    label: 'Professional',
    description: 'Formal and business-appropriate tone'
  },
  enthusiastic: {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and passionate tone'
  },
  formal: {
    value: 'formal',
    label: 'Formal',
    description: 'Traditional and conservative tone'
  },
  conversational: {
    value: 'conversational',
    label: 'Conversational',
    description: 'Friendly and approachable tone'
  }
};

/**
 * AI task status options
 * @type {Object.<string, {value: string, label: string, color: string}>}
 */
export const TASK_STATUS = {
  pending: {
    value: 'pending',
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  processing: {
    value: 'processing',
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  failed: {
    value: 'failed',
    label: 'Failed',
    color: 'bg-red-100 text-red-700 border-red-200'
  }
};

/**
 * Content type options for AI history
 * @type {Object.<string, {value: string, label: string, icon: string}>}
 */
export const CONTENT_TYPES = {
  cover_letter: {
    value: 'cover_letter',
    label: 'Cover Letter',
    icon: 'FileText'
  },
  job_match: {
    value: 'job_match',
    label: 'Job Match',
    icon: 'Target'
  },
  interview_questions: {
    value: 'interview_questions',
    label: 'Interview Questions',
    icon: 'HelpCircle'
  }
};

// ============================================
// COVER LETTER GENERATION
// ============================================

/**
 * Generate a cover letter using AI
 * @param {Object} data - Generation parameters
 * @param {string} data.job_description - Job description text
 * @param {string} [data.resume_text] - Resume text (use this OR resume_version_id)
 * @param {number} [data.resume_version_id] - Resume version ID (use this OR resume_text)
 * @param {string} data.company_name - Target company name
 * @param {string} data.job_title - Job title
 * @param {string} [data.tone='professional'] - Cover letter tone
 * @param {number} [data.application_id] - Associated application ID
 * @param {boolean} [data.save_to_history=true] - Save to generation history
 * @param {boolean} [data.async_mode=false] - Use async generation
 * @returns {Promise<Object>} Generated cover letter or task info
 */
export const generateCoverLetter = async (data) => {
  const response = await api.post('/ai/cover-letter/generate/', {
    tone: 'professional',
    save_to_history: true,
    async_mode: false,
    ...data
  });
  return response.data;
};

// ============================================
// JOB MATCH ANALYSIS
// ============================================

/**
 * Analyze job match between resume and job description
 * @param {Object} data - Analysis parameters
 * @param {string} data.job_description - Job description text
 * @param {string} [data.resume_text] - Resume text (use this OR resume_version_id)
 * @param {number} [data.resume_version_id] - Resume version ID
 * @param {number} [data.application_id] - Associated application ID
 * @param {boolean} [data.save_to_history=true] - Save to history
 * @param {boolean} [data.async_mode=false] - Use async analysis
 * @returns {Promise<Object>} Match analysis results
 */
export const analyzeJobMatch = async (data) => {
  const response = await api.post('/ai/job-match/analyze/', {
    save_to_history: true,
    async_mode: false,
    ...data
  });
  return response.data;
};

// ============================================
// INTERVIEW QUESTIONS
// ============================================

/**
 * Generate interview questions based on job description
 * @param {Object} data - Generation parameters
 * @param {string} data.job_description - Job description text
 * @param {string} data.company_name - Company name
 * @param {string} data.job_title - Job title
 * @param {number} [data.question_count=10] - Number of questions to generate
 * @param {number} [data.application_id] - Associated application ID
 * @param {boolean} [data.save_to_history=true] - Save to history
 * @param {boolean} [data.async_mode=false] - Use async generation
 * @returns {Promise<Object>} Generated questions
 */
export const generateInterviewQuestions = async (data) => {
  const response = await api.post('/ai/interview-questions/generate/', {
    question_count: 10,
    save_to_history: true,
    async_mode: false,
    ...data
  });
  return response.data;
};

// ============================================
// AI TASKS (Async Operations)
// ============================================

/**
 * Get all AI tasks
 * @param {Object} [params] - Query parameters
 * @param {number} [params.page] - Page number
 * @returns {Promise<Object>} Paginated task list
 */
export const getTasks = async (params = {}) => {
  const response = await api.get('/ai/tasks/', { params });
  return response.data;
};

/**
 * Get a specific AI task by ID
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} Task details with result
 */
export const getTask = async (taskId) => {
  const response = await api.get(`/ai/tasks/${taskId}/`);
  return response.data;
};

/**
 * Get pending/processing AI tasks
 * @returns {Promise<Array>} List of pending tasks
 */
export const getPendingTasks = async () => {
  const response = await api.get('/ai/tasks/pending/');
  return response.data;
};

/**
 * Cancel a pending AI task
 * @param {number} taskId - Task ID to cancel
 * @returns {Promise<Object>} Cancellation status
 */
export const cancelTask = async (taskId) => {
  const response = await api.post(`/ai/tasks/${taskId}/cancel/`);
  return response.data;
};

// ============================================
// AI HISTORY
// ============================================

/**
 * Get AI generation history
 * @param {Object} [params] - Query parameters
 * @param {number} [params.page] - Page number
 * @param {string} [params.content_type] - Filter by content type
 * @returns {Promise<Object>} Paginated history list
 */
export const getHistory = async (params = {}) => {
  const response = await api.get('/ai/history/', { params });
  return response.data;
};

/**
 * Get a specific history item
 * @param {number} historyId - History item ID
 * @returns {Promise<Object>} History item details
 */
export const getHistoryItem = async (historyId) => {
  const response = await api.get(`/ai/history/${historyId}/`);
  return response.data;
};

/**
 * Update a history item (favorite/rating)
 * @param {number} historyId - History item ID
 * @param {Object} data - Update data
 * @param {boolean} [data.is_favorite] - Favorite status
 * @param {number} [data.rating] - Rating (1-5)
 * @returns {Promise<Object>} Updated history item
 */
export const updateHistoryItem = async (historyId, data) => {
  const response = await api.patch(`/ai/history/${historyId}/`, data);
  return response.data;
};

/**
 * Toggle favorite status of a history item
 * @param {number} historyId - History item ID
 * @returns {Promise<Object>} New favorite status
 */
export const toggleFavorite = async (historyId) => {
  const response = await api.post(`/ai/history/${historyId}/toggle_favorite/`);
  return response.data;
};

/**
 * Rate a history item
 * @param {number} historyId - History item ID
 * @param {number} rating - Rating value (1-5)
 * @returns {Promise<Object>} Updated rating
 */
export const rateHistoryItem = async (historyId, rating) => {
  const response = await api.post(`/ai/history/${historyId}/rate/`, { rating });
  return response.data;
};

/**
 * Get favorite AI history items
 * @returns {Promise<Array>} List of favorite items
 */
export const getFavorites = async () => {
  const response = await api.get('/ai/history/favorites/');
  return response.data;
};

/**
 * Delete a history item
 * @param {number} historyId - History item ID
 * @returns {Promise<void>}
 */
export const deleteHistoryItem = async (historyId) => {
  await api.delete(`/ai/history/${historyId}/`);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status configuration for a task status
 * @param {string} status - Status value
 * @returns {Object} Status configuration
 */
export const getTaskStatusConfig = (status) => {
  return TASK_STATUS[status] || TASK_STATUS.pending;
};

/**
 * Get content type configuration
 * @param {string} contentType - Content type value
 * @returns {Object} Content type configuration
 */
export const getContentTypeConfig = (contentType) => {
  return CONTENT_TYPES[contentType] || CONTENT_TYPES.cover_letter;
};

/**
 * Get tone configuration
 * @param {string} tone - Tone value
 * @returns {Object} Tone configuration
 */
export const getToneConfig = (tone) => {
  return COVER_LETTER_TONES[tone] || COVER_LETTER_TONES.professional;
};

/**
 * Poll task status until completion
 * @param {number} taskId - Task ID to poll
 * @param {Object} [options] - Polling options
 * @param {number} [options.interval=2000] - Polling interval in ms
 * @param {number} [options.maxAttempts=30] - Maximum polling attempts
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Completed task result
 */
export const pollTaskStatus = async (taskId, options = {}) => {
  const { interval = 2000, maxAttempts = 30, onProgress } = options;
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const task = await getTask(taskId);
    
    if (onProgress) {
      onProgress(task);
    }
    
    if (task.status === 'completed') {
      return task;
    }
    
    if (task.status === 'failed') {
      throw new Error(task.error_message || 'Task failed');
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Task polling timeout');
};
