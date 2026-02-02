import api from './api'

/**
 * Company Service
 * Full CRUD operations for company management
 * 
 * @module companyService
 */
export const companyService = {
    /**
     * List all companies with optional filters
     * 
     * @param {Object} params - Query parameters
     * @param {string} [params.search] - Search by name, industry, location
     * @param {string} [params.size] - Filter by company size
     * @param {string} [params.industry] - Filter by industry
     * @param {string} [params.ordering] - Order by: name, created_at, glassdoor_rating
     * @param {number} [params.page] - Page number for pagination
     * @returns {Promise<PaginatedCompanies>}
     */
    getCompanies: async (params = {}) => {
        const response = await api.get('/companies/', { params })
        return response.data
    },

    /**
     * Get single company details
     * 
     * @param {number|string} id - Company ID
     * @returns {Promise<Company>}
     */
    getCompany: async (id) => {
        const response = await api.get(`/companies/${id}/`)
        return response.data
    },

    /**
     * Create a new company
     * 
     * @param {CompanyInput} data - Company data
     * @returns {Promise<Company>}
     */
    createCompany: async (data) => {
        const response = await api.post('/companies/', data)
        return response.data
    },

    /**
     * Update an existing company
     * 
     * @param {number|string} id - Company ID
     * @param {Partial<CompanyInput>} data - Updated company data
     * @returns {Promise<Company>}
     */
    updateCompany: async (id, data) => {
        const response = await api.patch(`/companies/${id}/`, data)
        return response.data
    },

    /**
     * Delete a company
     * 
     * @param {number|string} id - Company ID
     * @returns {Promise<void>}
     */
    deleteCompany: async (id) => {
        await api.delete(`/companies/${id}/`)
    },

    /**
     * Search companies with autocomplete-style results
     * Useful for dropdowns and quick search
     * 
     * @param {string} query - Search query
     * @returns {Promise<Array<CompanyListItem>>}
     */
    searchCompanies: async (query) => {
        if (!query || query.length < 2) return []
        const response = await api.get('/companies/', { 
            params: { search: query, page_size: 10 } 
        })
        return response.data.results || []
    }
}

/**
 * Company size options
 */
export const COMPANY_SIZES = [
    { value: '', label: 'Select size...' },
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1001-5000)' },
    { value: 'enterprise', label: 'Enterprise (5000+)' }
]

/**
 * Common industries
 */
export const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Education',
    'Marketing',
    'Consulting',
    'Manufacturing',
    'Media',
    'Real Estate',
    'Retail',
    'Transportation',
    'Other'
]

/**
 * @typedef {Object} Company
 * @property {number} id
 * @property {string} name
 * @property {string} website
 * @property {string} industry
 * @property {string} location
 * @property {string} size
 * @property {number|null} glassdoor_rating
 * @property {string} notes
 * @property {number} application_count
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CompanyInput
 * @property {string} name
 * @property {string} [website]
 * @property {string} [industry]
 * @property {string} [location]
 * @property {string} [size]
 * @property {number} [glassdoor_rating]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} CompanyListItem
 * @property {number} id
 * @property {string} name
 * @property {string} industry
 * @property {string} location
 * @property {number} application_count
 */

/**
 * @typedef {Object} PaginatedCompanies
 * @property {number} count
 * @property {string|null} next
 * @property {string|null} previous
 * @property {Array<CompanyListItem>} results
 */
