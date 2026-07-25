import apiClient from '../utils/apiClient'

export const registerDevice = async (payload) => {
    const res = await apiClient.post('/devices/register', payload)
    return res
}

export const logoutDevice = async (payload) => {
    const res = await apiClient.post('/devices/logout', payload)
    return res
}
