/**
 * Resume Service
 * Handles all resume/CV management operations including upload, listing,
 * setting default, and deletion.
 * 
 * @module services/resumeService
 * @see FRONTEND_API_DOCUMENTATION.md Section 4: Applications - Resume Management
 */

import api from './api';

// ============================================
// CONSTANTS
// ============================================

/**
 * Allowed file types for resume upload
 */
export const ALLOWED_FILE_TYPES = {
  'application/pdf': { extension: '.pdf', label: 'PDF' },
  'application/msword': { extension: '.doc', label: 'Word Document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: '.docx', 
    label: 'Word Document' 
  }
};

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Human-readable max file size
 */
export const MAX_FILE_SIZE_DISPLAY = '5 MB';

// ============================================
// RESUME CRUD OPERATIONS
// ============================================

/**
 * List all resume versions for the authenticated user
 * @returns {Promise<Object>} Paginated list of resumes
 */
export const getResumes = async () => {
  const response = await api.get('/applications/resumes/');
  return response.data;
};

/**
 * Get a specific resume by ID
 * @param {number} id - Resume ID
 * @returns {Promise<Object>} Resume details
 */
export const getResume = async (id) => {
  const response = await api.get(`/applications/resumes/${id}/`);
  return response.data;
};

/**
 * Upload a new resume
 * @param {File} file - The resume file (PDF or Word)
 * @param {string} versionName - Name for this resume version
 * @param {boolean} [isDefault=false] - Set as default resume
 * @param {function} [onProgress] - Upload progress callback (0-100)
 * @returns {Promise<Object>} Uploaded resume details
 */
export const uploadResume = async (file, versionName, isDefault = false, onProgress) => {
  // Validate file type
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PDF or Word document.');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('version_name', versionName);
  if (isDefault) {
    formData.append('is_default', 'true');
  }

  const response = await api.post('/applications/resumes/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  });

  return response.data;
};

/**
 * Set a resume as the default
 * @param {number} id - Resume ID to set as default
 * @returns {Promise<Object>} Updated resume details
 */
export const setDefaultResume = async (id) => {
  const response = await api.post(`/applications/resumes/${id}/set-default/`);
  return response.data;
};

/**
 * Delete a resume
 * @param {number} id - Resume ID to delete
 * @returns {Promise<void>}
 */
export const deleteResume = async (id) => {
  await api.delete(`/applications/resumes/${id}/`);
};

/**
 * Update resume metadata (version name)
 * @param {number} id - Resume ID
 * @param {Object} data - Update data
 * @param {string} [data.version_name] - New version name
 * @returns {Promise<Object>} Updated resume details
 */
export const updateResume = async (id, data) => {
  const response = await api.patch(`/applications/resumes/${id}/`, data);
  return response.data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (lowercase)
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Validate a file for resume upload
 * @param {File} file - File to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateResumeFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a file.' };
  }

  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx).' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}.` 
    };
  }

  return { valid: true };
};

/**
 * Get icon name based on file type
 * @param {string} fileType - MIME type or filename
 * @returns {string} Icon name to use
 */
export const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('word') || fileType.includes('doc')) return 'word';
  return 'file';
};

// Export as default object for consistency
export default {
  getResumes,
  getResume,
  uploadResume,
  setDefaultResume,
  deleteResume,
  updateResume,
  formatFileSize,
  getFileExtension,
  validateResumeFile,
  getFileIcon,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_DISPLAY
};
