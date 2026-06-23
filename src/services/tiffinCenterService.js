import apiClient from '../utils/apiClient'

export const getAllCenters = async () => {
    const res = await apiClient.get('/tiffin-centers')
    return res.data
}

export const getCenterById = async (id) => {
    if (!id) return null
    const res = await apiClient.get(`/tiffin-centers/${id}`)
    return res.data
}

export const getCenterCustomers = async (centerId) => {
    const res = await apiClient.get(`/tiffin-centers/${centerId}/customers`)
    return res.data
}

export const createCenter = async (payload) => {
    const res = await apiClient.post('/tiffin-centers', payload)
    return res.data
}

export const updateCenter = async (id, payload) => {
    const res = await apiClient.patch(`/tiffin-centers/${id}`, payload)
    return res.data
}

export const getCenterStats = async (centerId) => {
    // backend returns aggregate stats as part of listCenters; for single center reuse customers + center detail
    const [center, customers] = await Promise.all([
        getCenterById(centerId),
        getCenterCustomers(centerId),
    ])
    return { center, customers }
}