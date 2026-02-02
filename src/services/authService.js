import api from './api'

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login/', { email, password })
        return response.data
    },

    register: async (userData) => {
        const response = await api.post('/auth/register/', userData)
        return response.data
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile/')
        return response.data
    },

    verify2FA: async (code) => {
        const response = await api.post('/2fa/verify/', { code })
        return response.data
    },

    setup2FA: async () => {
        const response = await api.post('/2fa/setup/')
        return response.data
    },

    confirm2FA: async (code) => {
        const response = await api.post('/2fa/confirm/', { code })
        return response.data
    },

    updateProfile: async (data) => {
        const response = await api.patch('/auth/profile/', data)
        return response.data
    },

    changePassword: async (data) => {
        const response = await api.put('/auth/change-password/', data)
        return response.data
    },

    // ============================================
    // EMAIL VERIFICATION
    // ============================================

    /**
     * Verify email with token from email link
     * @param {string} token - Verification token from email
     * @returns {Promise<Object>} Verification result
     */
    verifyEmail: async (token) => {
        const response = await api.post('/auth/verify-email/', { token })
        return response.data
    },

    /**
     * Resend verification email
     * @param {string} email - Email address to send verification to
     * @returns {Promise<Object>} Result message
     */
    resendVerification: async (email) => {
        const response = await api.post('/auth/resend-verification/', { email })
        return response.data
    },

    // ============================================
    // PASSWORD RESET
    // ============================================

    /**
     * Request password reset email
     * @param {string} email - Email address for password reset
     * @returns {Promise<Object>} Result message
     */
    requestPasswordReset: async (email) => {
        const response = await api.post('/auth/password-reset/', { email })
        return response.data
    },

    /**
     * Confirm password reset with token and new password
     * @param {string} token - Reset token from email
     * @param {string} newPassword - New password
     * @param {string} newPasswordConfirm - Password confirmation
     * @returns {Promise<Object>} Reset confirmation
     */
    confirmPasswordReset: async (token, newPassword, newPasswordConfirm) => {
        const response = await api.post('/auth/password-reset/confirm/', {
            token,
            new_password: newPassword,
            new_password_confirm: newPasswordConfirm
        })
        return response.data
    }
}

