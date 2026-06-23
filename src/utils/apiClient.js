import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const ENCRYPTION_ENABLED = import.meta.env.VITE_ENCRYPTION_ENABLED === 'true'

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// ── Attach token on every request ──
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('tms_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    if (ENCRYPTION_ENABLED && config.data) {
        const encoded = btoa(JSON.stringify(config.data))
        config.data = { data: encoded }
    }

    return config
})

// ── Normalize every response ──
apiClient.interceptors.response.use(
    (response) => {
        let body = response.data

        // Decrypt if enabled
        if (ENCRYPTION_ENABLED && body?.data && typeof body.data === 'string') {
            try {
                body = JSON.parse(atob(body.data))
            } catch {
                // fall through with raw body
            }
        }

        // body shape is always: { success: true, data: {...}, message?, pagination? }
        // Return the full body so callers can access body.data, body.pagination, etc.
        return body
    },
    (error) => {
        let body = error.response?.data

        if (ENCRYPTION_ENABLED && body?.data && typeof body.data === 'string') {
            try {
                body = JSON.parse(atob(body.data))
            } catch { }
        }

        const normalized = {
            success: false,
            status: error.response?.status || 0,
            code: body?.error?.code || 'NETWORK_ERROR',
            message: body?.error?.message || error.message || 'Something went wrong',
        }

        // Auto-logout on 401
        if (normalized.status === 401) {
            localStorage.removeItem('tms_token')
            localStorage.removeItem('tms_user')
            window.location.href = '/login'
        }

        return Promise.reject(normalized)
    }
)

export default apiClient