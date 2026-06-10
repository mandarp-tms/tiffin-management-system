import { users } from '../mock/users'
import { getAllTiffins } from './tiffinService'
import { ROLES } from '../utils/constants'

export const getTiffinUsers = () =>
    users.filter(u => u.role === ROLES.USER)

export const getUserStats = (userId) => {
    const tiffins = getAllTiffins().filter(t => t.userId === userId)
    const approved = tiffins.filter(t => t.status === 'approved' && t.type !== 'none')
    const pending = tiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((sum, t) => sum + t.amount, 0)
    return { tiffins, approved, pending, total }
}