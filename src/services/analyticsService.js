import api from './api'

/**
 * Analytics Service
 * Provides dashboard statistics, charts data, and performance metrics
 * 
 * @module analyticsService
 */
export const analyticsService = {
    /**
     * Get main dashboard overview statistics
     * Includes: total applications, active apps, offers, interviews, response rate
     * 
     * @returns {Promise<DashboardStats>}
     */
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard/')
        return response.data
    },

    /**
     * Get response rate breakdown by application source
     * Useful for determining which job sources are most effective
     * 
     * @returns {Promise<ResponseRateData>}
     */
    getResponseRate: async () => {
        const response = await api.get('/analytics/response-rate/')
        return response.data
    },

    /**
     * Get application funnel data
     * Shows progression: applied -> screening -> interviewing -> offer -> accepted
     * 
     * @returns {Promise<FunnelData>}
     */
    getFunnel: async () => {
        const response = await api.get('/analytics/funnel/')
        return response.data
    },

    /**
     * Get weekly application activity
     * 
     * @param {Object} params
     * @param {number} [params.weeks=12] - Number of weeks to include
     * @returns {Promise<WeeklyData>}
     */
    getWeeklyActivity: async (params = { weeks: 12 }) => {
        const response = await api.get('/analytics/weekly/', { params })
        return response.data
    },

    /**
     * Get top companies by application count
     * 
     * @param {Object} params
     * @param {number} [params.limit=10] - Number of companies to return
     * @returns {Promise<TopCompaniesData>}
     */
    getTopCompanies: async (params = { limit: 10 }) => {
        const response = await api.get('/analytics/top-companies/', { params })
        return response.data
    },

    /**
     * Health check endpoint - no auth required
     * 
     * @returns {Promise<HealthStatus>}
     */
    healthCheck: async () => {
        const response = await api.get('/analytics/health/')
        return response.data
    }
}

/**
 * @typedef {Object} DashboardStats
 * @property {number} total_applications
 * @property {number} active_applications
 * @property {number} offers_received
 * @property {number} interviews_scheduled
 * @property {number} response_rate
 * @property {number} avg_response_days
 * @property {Object} status_breakdown
 */

/**
 * @typedef {Object} ResponseRateData
 * @property {Array<{source: string, total: number, with_response: number, response_rate: number}>} by_source
 */

/**
 * @typedef {Object} FunnelData
 * @property {Array<{stage: string, count: number, percentage: number}>} funnel
 * @property {number} total_applications
 */

/**
 * @typedef {Object} WeeklyData
 * @property {Array<{week: string, count: number}>} weekly_applications
 * @property {number} period_weeks
 */

/**
 * @typedef {Object} TopCompaniesData
 * @property {Array<{company__id: number, company__name: string, application_count: number, interview_count: number}>} top_companies
 */
