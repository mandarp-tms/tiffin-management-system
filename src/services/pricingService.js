import { pricing as mockPricing } from '../mock/pricing'

let data = { ...mockPricing }

export const getPricing = () => ({ ...data })

export const updatePricing = (newPricing) => {
    data = { ...newPricing }
    return data
}