import { tiffins } from './tiffins'

export const getPendingApprovals = () =>
    tiffins.filter(t => t.status === 'pending')