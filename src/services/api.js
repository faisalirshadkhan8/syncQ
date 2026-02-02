import axios from 'axios'
import useAuthStore from '@/stores/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor: Add token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor: Handle 401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and not already retrying (and not a login req)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            originalRequest._retry = true

            try {
                const refreshToken = useAuthStore.getState().refreshToken
                if (!refreshToken) throw new Error('No refresh token')

                const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                    refresh: refreshToken
                })

                const { access } = response.data
                useAuthStore.getState().setTokens(access, refreshToken) // Keep same refresh or update if provided? Docs say access & refresh returned.

                api.defaults.headers.common['Authorization'] = `Bearer ${access}`
                originalRequest.headers['Authorization'] = `Bearer ${access}`

                return api(originalRequest)
            } catch (refreshError) {
                // Logout if refresh fails
                useAuthStore.getState().logout()
                // Assuming router handles redirect based on auth state
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api
