import { pricingByCenter } from '../mock/pricing'

let data = JSON.parse(JSON.stringify(pricingByCenter))

export const getPricing = (centerId = 1) => ({ ...data[centerId] })

export const updatePricing = (centerId = 1, newPricing) => {
    data[centerId] = { ...newPricing }
    return data[centerId]
}