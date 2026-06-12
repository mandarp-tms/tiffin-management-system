import { tiffinCenters } from '../mock/tiffinCenters'
import { users } from '../mock/users'
import { getAllTiffins } from './tiffinService'
import { getPricing } from './pricingService'

export const getAllCenters = () => [...tiffinCenters]

export const getCenterById = (id) =>
    tiffinCenters.find(c => c.id === id)

export const getCustomersByCenter = (centerId) =>
    users.filter(u => u.role === 'user' && u.centerId === centerId)

export const getCenterStats = (centerId) => {
    const customers = getCustomersByCenter(centerId)
    const tiffins = getAllTiffins().filter(t =>
        customers.some(c => c.id === t.userId) &&
        t.status === 'approved' &&
        t.type !== 'none'
    )
    const totalAmount = tiffins.reduce((s, t) => s + t.amount, 0)
    const pricing = getPricing(centerId)
    return {
        customerCount: customers.length,
        tiffinCount: tiffins.length,
        totalAmount,
        pricing,
    }
}