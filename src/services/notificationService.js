import apiClient from '../utils/apiClient'

export const getNotifications = async (params = { page: 1, limit: 20 }) => {
    const res = await apiClient.get('/notifications', { params })
    // Return the response object, standard for this app is res.data
    return res
}

export const getUnseenCount = async () => {
    const res = await apiClient.get('/notifications/unseen-count')
    return res
}

export const markAsSeen = async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/seen`)
    return res
}

export const markAllAsSeen = async () => {
    const res = await apiClient.patch('/notifications/seen-all')
    return res
}
