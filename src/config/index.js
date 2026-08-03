import { customerConfig } from './modules/customer.config'
import { tiffinEntryConfig }  from './modules/tiffinEntry.config.jsx'
// import { pricingConfig }      from './modules/pricing.config'
// import { paymentConfig }      from './modules/payment.config'
// import { tiffinCenterConfig } from './modules/tiffinCenter.config'
// import { approvalConfig }     from './modules/approval.config'

// Registry — keyed by module id
export const MODULE_REGISTRY = {
    customer:      customerConfig,
    tiffinEntry:   tiffinEntryConfig,
    //   pricing:       pricingConfig,
    //   payment:       paymentConfig,
    //   tiffinCenter:  tiffinCenterConfig,
    //   approval:      approvalConfig,
}

// Helper to get a module config by id
export const getModule = (id) => MODULE_REGISTRY[id] || null