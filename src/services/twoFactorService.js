/**
 * Two-Factor Authentication Service
 * Handles all 2FA operations including setup, verification, and management.
 * 
 * @module services/twoFactorService
 * @see FRONTEND_API_DOCUMENTATION.md Section 9: Two-Factor Authentication
 */

import api from './api';

// ============================================
// 2FA STATUS
// ============================================

/**
 * Get current 2FA status for authenticated user
 * @returns {Promise<Object>} 2FA status including enabled, verified, backup codes count
 */
export const get2FAStatus = async () => {
  const response = await api.get('/2fa/status/');
  return response.data;
};

// ============================================
// 2FA SETUP
// ============================================

/**
 * Initiate 2FA setup - generates QR code and backup codes
 * @returns {Promise<Object>} Setup data including secret, QR code, backup codes
 */
export const setup2FA = async () => {
  const response = await api.post('/2fa/setup/');
  return response.data;
};

/**
 * Confirm 2FA setup with a verification code from authenticator app
 * @param {string} code - 6-digit TOTP code from authenticator app
 * @returns {Promise<Object>} Confirmation result
 */
export const confirm2FA = async (code) => {
  const response = await api.post('/2fa/confirm/', { code });
  return response.data;
};

// ============================================
// 2FA VERIFICATION
// ============================================

/**
 * Verify a 2FA code (TOTP or backup code)
 * @param {string} code - 6-digit TOTP code or backup code (XXXX-XXXX format)
 * @returns {Promise<Object>} Verification result including method used
 */
export const verify2FA = async (code) => {
  const response = await api.post('/2fa/verify/', { code });
  return response.data;
};

// ============================================
// 2FA MANAGEMENT
// ============================================

/**
 * Disable 2FA for the authenticated user
 * @param {string} code - Current TOTP code for verification
 * @param {string} password - Current account password for verification
 * @returns {Promise<Object>} Disable confirmation
 */
export const disable2FA = async (code, password) => {
  const response = await api.post('/2fa/disable/', { code, password });
  return response.data;
};

/**
 * Regenerate backup codes (invalidates old codes)
 * @param {string} code - Current TOTP code for verification
 * @returns {Promise<Object>} New backup codes
 */
export const regenerateBackupCodes = async (code) => {
  const response = await api.post('/2fa/backup-codes/regenerate/', { code });
  return response.data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate TOTP code format (6 digits)
 * @param {string} code - Code to validate
 * @returns {boolean} Whether the code is valid format
 */
export const isValidTOTPCode = (code) => {
  return /^\d{6}$/.test(code);
};

/**
 * Validate backup code format (XXXX-XXXX)
 * @param {string} code - Code to validate
 * @returns {boolean} Whether the code is valid backup code format
 */
export const isValidBackupCode = (code) => {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.toUpperCase());
};

/**
 * Determine if a code is a backup code or TOTP code
 * @param {string} code - Code to check
 * @returns {'totp' | 'backup' | 'invalid'} Code type
 */
export const getCodeType = (code) => {
  if (isValidTOTPCode(code)) return 'totp';
  if (isValidBackupCode(code)) return 'backup';
  return 'invalid';
};

/**
 * Format backup code for display (ensures XXXX-XXXX format)
 * @param {string} code - Backup code
 * @returns {string} Formatted code
 */
export const formatBackupCode = (code) => {
  const clean = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (clean.length >= 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  return code;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  get2FAStatus,
  setup2FA,
  confirm2FA,
  verify2FA,
  disable2FA,
  regenerateBackupCodes,
  isValidTOTPCode,
  isValidBackupCode,
  getCodeType,
  formatBackupCode
};
