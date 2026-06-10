import { pricing } from '../mock/pricing'

export const calculateAmount = (type, chapatiCount) => {
    if (type === 'dalrice') return pricing.dalrice.fixed

    const typePrice = pricing[type]
    if (!typePrice) return 0

    const base = typePrice.base
    const defChap = typePrice.defaultChapati
    const diff = defChap - chapatiCount
    return base - diff * 5
}