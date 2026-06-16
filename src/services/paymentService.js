import { payments } from '../mock/payments'
import { getAllTiffins } from './tiffinService'

// In-memory copy
let data = payments.map(p => ({ ...p, transactions: [...p.transactions] }))

// Get payment record for a user+center+month
export const getPayment = (userId, centerId, month, year) =>
    data.find(p =>
        p.userId === userId &&
        p.centerId === centerId &&
        p.periodMonth === month &&
        p.periodYear === year
    ) || null

// Get all payments for a center+month
export const getPaymentsByCenter = (centerId, month, year) =>
    data.filter(p => p.centerId === centerId && p.periodMonth === month && p.periodYear === year)

// Calculate total due from approved tiffin entries
export const calculateTotalDue = (userId, centerId, month, year) => {
    const tiffins = getAllTiffins().filter(t =>
        t.userId === userId &&
        t.centerId === centerId &&
        t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`) &&
        t.status === 'approved' &&
        t.type !== 'none'
    )
    return tiffins.reduce((s, t) => s + t.amount, 0)
}

// Record a new payment transaction
export const recordPayment = ({ userId, userName, centerId, month, year, amount, method, reference, note, recordedBy }) => {
    const totalDue = calculateTotalDue(userId, centerId, month, year)
    const existing = getPayment(userId, centerId, month, year)

    const transaction = {
        id: Date.now(),
        amount,
        method,
        reference: reference || '',
        paidAt: new Date().toISOString(),
        note: note || '',
        recordedBy,
    }

    if (existing) {
        existing.transactions.push(transaction)
        existing.amountPaid += amount
        existing.balanceDue = Math.max(0, existing.totalDue - existing.amountPaid)
        existing.status = existing.balanceDue === 0 ? 'paid' : 'partial'
        existing.paidAt = transaction.paidAt
        return existing
    } else {
        const newRecord = {
            id: data.length + 1,
            userId,
            userName,
            centerId,
            periodMonth: month,
            periodYear: year,
            totalDue,
            amountPaid: amount,
            balanceDue: Math.max(0, totalDue - amount),
            status: totalDue - amount <= 0 ? 'paid' : 'partial',
            paymentMethod: method,
            paymentReference: reference || '',
            paidAt: transaction.paidAt,
            notes: note || '',
            transactions: [transaction],
        }
        data.push(newRecord)
        return newRecord
    }
}

// Get payment status badge config
export const getPaymentStatus = (payment, totalDue) => {
    if (!payment || payment.amountPaid === 0) return { label: 'Unpaid', status: 'unpaid' }
    if (payment.balanceDue <= 0) return { label: 'Paid', status: 'paid' }
    return {
        label: `Partial (₹${payment.amountPaid} / ₹${totalDue})`,
        status: 'partial',
    }
}