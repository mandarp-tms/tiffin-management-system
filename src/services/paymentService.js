import apiClient from '../utils/apiClient'

export const getPayment = async (userId, centerId, month, year) => {
    const res = await apiClient.get('/payments', { params: { userId, centerId, month, year } })
    return res.data
}

export const getPaymentsByCenter = async (centerId, month, year) => {
    const res = await apiClient.get(`/payments/center/${centerId}`, { params: { month, year } })
    return res.data
}

export const recordPayment = async (payload) => {
    const res = await apiClient.post('/payments', payload)
    return res.data
}

export const getTransactions = async (paymentId) => {
    const res = await apiClient.get(`/payments/${paymentId}/transactions`)
    return res.data
}

// totalDue is now computed server-side — this helper just reads it off the payment/balance response
export const calculateTotalDue = async (userId, centerId, month, year) => {
    const payment = await getPayment(userId, centerId, month, year)
    return payment?.totalDue || 0
}