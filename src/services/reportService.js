import apiClient from '../utils/apiClient'

export const getDashboard = async (month) => {
    const res = await apiClient.get('/reports/dashboard', { params: { month } })
    return res.data   // { totalTiffins, pendingApprovals, ... }
}

export const getBillingReport = async (filters) => {
    const res = await apiClient.get('/reports/billing', { params: filters })
    return res.data
}

export const getCustomerHistory = async (months = 6) => {
    const res = await apiClient.get('/reports/customer-history', { params: { months } })
    return res.data
}

export const getCenterTypeBreakdown = async (centerId, month) => {
    const res = await apiClient.get('/reports/center-breakdown', { params: { centerId, month } })
    return res.data
}