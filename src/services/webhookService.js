/**
 * Webhook Service
 * Handles all webhook management operations including endpoints, testing, 
 * delivery logs, and secret regeneration.
 * 
 * @module services/webhookService
 * @see FRONTEND_API_DOCUMENTATION.md Section 10: Webhooks
 */

import api from './api';

// ============================================
// WEBHOOK ENDPOINT OPERATIONS
// ============================================

/**
 * List all webhook endpoints for the authenticated user
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.is_active] - Filter by active status
 * @returns {Promise<Object>} Paginated list of webhooks
 */
export const getWebhooks = async (params = {}) => {
  const response = await api.get('/webhooks/endpoints/', { params });
  return response.data;
};

/**
 * Get a specific webhook endpoint by ID
 * @param {number} id - Webhook endpoint ID
 * @returns {Promise<Object>} Webhook details
 */
export const getWebhook = async (id) => {
  const response = await api.get(`/webhooks/endpoints/${id}/`);
  return response.data;
};

/**
 * Create a new webhook endpoint
 * @param {Object} data - Webhook configuration
 * @param {string} data.url - Webhook URL (must be HTTPS)
 * @param {string[]} data.events - Array of event types to subscribe to
 * @param {boolean} [data.is_active=true] - Whether webhook is active
 * @param {string} [data.description] - Optional description
 * @returns {Promise<Object>} Created webhook details
 */
export const createWebhook = async (data) => {
  const response = await api.post('/webhooks/endpoints/', data);
  return response.data;
};

/**
 * Update a webhook endpoint
 * @param {number} id - Webhook endpoint ID
 * @param {Object} data - Updated webhook data
 * @returns {Promise<Object>} Updated webhook details
 */
export const updateWebhook = async (id, data) => {
  const response = await api.put(`/webhooks/endpoints/${id}/`, data);
  return response.data;
};

/**
 * Partially update a webhook endpoint
 * @param {number} id - Webhook endpoint ID
 * @param {Object} data - Partial webhook data
 * @returns {Promise<Object>} Updated webhook details
 */
export const patchWebhook = async (id, data) => {
  const response = await api.patch(`/webhooks/endpoints/${id}/`, data);
  return response.data;
};

/**
 * Delete a webhook endpoint
 * @param {number} id - Webhook endpoint ID
 * @returns {Promise<void>}
 */
export const deleteWebhook = async (id) => {
  await api.delete(`/webhooks/endpoints/${id}/`);
};

// ============================================
// WEBHOOK TESTING
// ============================================

/**
 * Test a webhook endpoint by sending a sample payload
 * @param {number} id - Webhook endpoint ID
 * @returns {Promise<Object>} Test result with status and response
 */
export const testWebhook = async (id) => {
  const response = await api.post(`/webhooks/endpoints/${id}/test/`);
  return response.data;
};

// ============================================
// WEBHOOK SECRETS
// ============================================

/**
 * Regenerate the secret for a webhook endpoint
 * @param {number} id - Webhook endpoint ID
 * @returns {Promise<Object>} New secret details
 */
export const regenerateSecret = async (id) => {
  const response = await api.post(`/webhooks/endpoints/${id}/regenerate_secret/`);
  return response.data;
};

// ============================================
// WEBHOOK DELIVERIES & LOGS
// ============================================

/**
 * List webhook delivery attempts
 * @param {Object} [params] - Query parameters
 * @param {number} [params.endpoint] - Filter by endpoint ID
 * @param {string} [params.status] - Filter by status (success/failure)
 * @param {string} [params.event_type] - Filter by event type
 * @returns {Promise<Object>} Paginated list of deliveries
 */
export const getDeliveries = async (params = {}) => {
  const response = await api.get('/webhooks/deliveries/', { params });
  return response.data;
};

/**
 * Get a specific delivery attempt details
 * @param {string} id - Delivery UUID
 * @returns {Promise<Object>} Delivery details
 */
export const getDelivery = async (id) => {
  const response = await api.get(`/webhooks/deliveries/${id}/`);
  return response.data;
};

/**
 * Retry a failed webhook delivery
 * @param {string} id - Delivery UUID
 * @returns {Promise<Object>} Retry confirmation
 */
export const retryDelivery = async (id) => {
  const response = await api.post(`/webhooks/deliveries/${id}/retry/`);
  return response.data;
};

// ============================================
// EVENT TYPES
// ============================================

/**
 * Get available webhook event types
 * @returns {Promise<Array>} List of event types
 */
export const getEventTypes = async () => {
  const response = await api.get('/webhooks/endpoints/events/');
  return response.data;
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate webhook URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const validateWebhookUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Must be HTTPS in production
    if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Webhook URL must use HTTPS in production'
      };
    }
    
    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        error: 'Webhook URL must use HTTP or HTTPS protocol'
      };
    }
    
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Format delivery status for display
 * @param {string} status - Status code
 * @returns {Object} Display info
 */
export const formatDeliveryStatus = (status) => {
  const statusMap = {
    success: {
      label: 'Success',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      icon: '✓'
    },
    failure: {
      label: 'Failed',
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      icon: '✗'
    },
    pending: {
      label: 'Pending',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      icon: '⋯'
    }
  };
  
  return statusMap[status] || statusMap.pending;
};

// Export as default object for consistency
export default {
  getWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  patchWebhook,
  deleteWebhook,
  testWebhook,
  regenerateSecret,
  getDeliveries,
  getDelivery,
  retryDelivery,
  getEventTypes,
  validateWebhookUrl,
  formatDeliveryStatus
};
