import apiClient from '../utils/apiClient'

export const getPricing = async (centerId) => {
    const res = await apiClient.get('/pricing/active', { params: { centerId } })
    return res.data
}

export const updatePricing = async (centerId, prices) => {
    const res = await apiClient.put('/pricing/bulk', { centerId, prices })
    return res.data
}