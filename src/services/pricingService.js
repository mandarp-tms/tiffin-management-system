import apiClient from '../utils/apiClient'

export const getPricing = async (centerId) => {
    const res = await apiClient.get('/pricing', { params: { centerId } })
    return res.data
}

export const updatePricing = async (centerId, prices) => {
    const res = await apiClient.put('/pricing', { centerId, prices })
    return res.data
}