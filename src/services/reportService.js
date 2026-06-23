import apiClient from '../utils/apiClient'

export const getDashboard = async (month) => {
    const res = await apiClient.get('/reports/dashboard', { params: { month } })
    return res.data   // { totalTiffins, pendingApprovals, ... }
}

export const getBillingReport = async (filters) => {
    const res = await apiClient.get('/reports/billing', { params: filters })
    return res.data
}