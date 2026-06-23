import apiClient from '../utils/apiClient'

export const login = async (username, password) => {
    // Returns full body: { success: true, data: { token, user } }
    return apiClient.post('/auth/login', { username, password })
}

export const getMe = async () => {
    return apiClient.get('/auth/me')
}

export const logout = async () => {
    return apiClient.post('/auth/logout')
}