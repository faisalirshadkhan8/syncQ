import api from './api'

export const applicationService = {
    getApplications: async (params) => {
        const response = await api.get('/applications/', { params })
        return response.data
    },

    getApplication: async (id) => {
        const response = await api.get(`/applications/${id}/`)
        return response.data
    },

    createApplication: async (data) => {
        const response = await api.post('/applications/', data)
        return response.data
    },

    updateApplication: async (id, data) => {
        const response = await api.patch(`/applications/${id}/`, data)
        return response.data
    },

    deleteApplication: async (id) => {
        await api.delete(`/applications/${id}/`)
    },

    updateStatus: async (id, status, responseDate) => {
        const response = await api.patch(`/applications/${id}/status/`, { status, response_date: responseDate })
        return response.data
    },

    createCompany: async (data) => {
        const response = await api.post('/companies/', data)
        return response.data
    }
}
