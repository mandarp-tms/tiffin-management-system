import apiClient from '../utils/apiClient'

export const getAllTiffins = async (filters = {}) => {
    const res = await apiClient.get('/tiffin-entries', { params: filters })
    return res.data   // ← array of entries
}

export const addTiffin = async (payload) => {
    const res = await apiClient.post('/tiffin-entries', payload)
    return res.data
}

export const getPendingTiffins = async (centerId) => {
    const res = await apiClient.get('/approvals/pending', { params: { centerId } })
    return res.data
}

export const approveTiffin = async (id, reason = '') => {
    const res = await apiClient.patch(`/approvals/${id}/approve`, { reason })
    return res.data
}

export const rejectTiffin = async (id, reason = '') => {
    const res = await apiClient.patch(`/approvals/${id}/reject`, { reason })
    return res.data
}

export const markNoTiffin = async (userId, date) => {
    const res = await apiClient.post('/tiffin-entries/no-tiffin', { userId, date })
    return res.data
}

export const getMyTiffins = async (userId) => {
    const res = await apiClient.get('/tiffin-entries', { params: { userId } })
    return res.data
}