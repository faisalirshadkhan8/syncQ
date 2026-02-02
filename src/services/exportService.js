/**
 * Export Service
 * Handles data export operations for applications, companies, interviews, and reports.
 * 
 * @module services/exportService
 * @see FRONTEND_API_DOCUMENTATION.md Section 11: Exports
 */

import api from './api';

// ============================================
// EXPORT OPERATIONS
// ============================================

/**
 * Export applications to CSV
 * @param {Object} [params] - Query parameters for filtering
 * @param {string} [params.status] - Filter by application status
 * @returns {Promise<Blob>} CSV file as blob
 */
export const exportApplications = async (params = {}) => {
  const response = await api.get('/exports/applications/', {
    params,
    responseType: 'blob' // Important for file downloads
  });
  return response.data;
};

/**
 * Export companies to CSV
 * @returns {Promise<Blob>} CSV file as blob
 */
export const exportCompanies = async () => {
  const response = await api.get('/exports/companies/', {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Export interviews to CSV
 * @param {Object} [params] - Query parameters for filtering
 * @param {string} [params.status] - Filter by interview status
 * @returns {Promise<Blob>} CSV file as blob
 */
export const exportInterviews = async (params = {}) => {
  const response = await api.get('/exports/interviews/', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Export full report (all data in ZIP)
 * @returns {Promise<Blob>} ZIP file as blob
 */
export const exportFullReport = async () => {
  const response = await api.get('/exports/full-report/', {
    responseType: 'blob'
  });
  return response.data;
};

// ============================================
// DOWNLOAD HELPERS
// ============================================

/**
 * Trigger browser download for a blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Suggested filename
 */
export const downloadBlob = (blob, filename) => {
  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 * @param {string} prefix - Filename prefix (e.g., 'applications', 'companies')
 * @param {string} [extension='csv'] - File extension
 * @returns {string} Filename with timestamp
 */
export const generateFilename = (prefix, extension = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Export and download applications
 * @param {Object} [params] - Filter parameters
 * @returns {Promise<void>}
 */
export const exportAndDownloadApplications = async (params = {}) => {
  const blob = await exportApplications(params);
  const filename = generateFilename('applications');
  downloadBlob(blob, filename);
};

/**
 * Export and download companies
 * @returns {Promise<void>}
 */
export const exportAndDownloadCompanies = async () => {
  const blob = await exportCompanies();
  const filename = generateFilename('companies');
  downloadBlob(blob, filename);
};

/**
 * Export and download interviews
 * @param {Object} [params] - Filter parameters
 * @returns {Promise<void>}
 */
export const exportAndDownloadInterviews = async (params = {}) => {
  const blob = await exportInterviews(params);
  const filename = generateFilename('interviews');
  downloadBlob(blob, filename);
};

/**
 * Export and download full report
 * @returns {Promise<void>}
 */
export const exportAndDownloadFullReport = async () => {
  const blob = await exportFullReport();
  const filename = generateFilename('full_report', 'zip');
  downloadBlob(blob, filename);
};

// ============================================
// EXPORT PRESETS
// ============================================

/**
 * Pre-configured export options for common use cases
 */
export const EXPORT_PRESETS = {
  applications: {
    all: {
      label: 'All Applications',
      params: {}
    },
    active: {
      label: 'Active Applications',
      params: { status: 'applied,interview,offer' }
    },
    archived: {
      label: 'Archived Applications',
      params: { status: 'rejected,ghosted,withdrawn' }
    }
  },
  interviews: {
    all: {
      label: 'All Interviews',
      params: {}
    },
    upcoming: {
      label: 'Upcoming Interviews',
      params: { status: 'scheduled' }
    },
    completed: {
      label: 'Completed Interviews',
      params: { status: 'completed' }
    }
  }
};

/**
 * Get formatted export types for UI
 * @returns {Array} Export type options
 */
export const getExportTypes = () => [
  {
    id: 'applications',
    label: 'Applications',
    description: 'Export all job applications with details',
    icon: '📝',
    action: exportAndDownloadApplications
  },
  {
    id: 'companies',
    label: 'Companies',
    description: 'Export all tracked companies',
    icon: '🏢',
    action: exportAndDownloadCompanies
  },
  {
    id: 'interviews',
    label: 'Interviews',
    description: 'Export interview schedule and history',
    icon: '🗓️',
    action: exportAndDownloadInterviews
  },
  {
    id: 'full_report',
    label: 'Full Report',
    description: 'Complete data export (ZIP archive)',
    icon: '📦',
    action: exportAndDownloadFullReport
  }
];

// Export as default object for consistency
export default {
  exportApplications,
  exportCompanies,
  exportInterviews,
  exportFullReport,
  downloadBlob,
  generateFilename,
  exportAndDownloadApplications,
  exportAndDownloadCompanies,
  exportAndDownloadInterviews,
  exportAndDownloadFullReport,
  EXPORT_PRESETS,
  getExportTypes
};
