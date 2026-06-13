import { useState, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { getPricing, updatePricing } from '../services/pricingService'
import AppIcon from '../components/AppIcon'
import AppButton from '../components/AppButton'
import styles from './PricingPage.module.css'

const PRICE_FIELDS = [
    { key: 'full', label: 'Full tiffin', sub: '3 chapati default', color: '#1D9E75', hasChapati: true },
    { key: 'half', label: 'Half tiffin', sub: '2 chapati default', color: '#534AB7', hasChapati: true },
    { key: 'chapati', label: 'Only chapati', sub: '2 chapati default', color: '#BA7517', hasChapati: true },
    { key: 'bhakari', label: 'Bhakari', sub: '2 chapati default', color: '#185FA5', hasChapati: true },
    { key: 'dalrice', label: 'Dal rice', sub: 'Fixed price', color: '#993C1D', hasChapati: false },
]

const PricingPage = () => {
    const toast = useRef(null)
    const [prices, setPrices] = useState(() => getPricing())
    const [saved, setSaved] = useState(false)

    const updateField = (key, field, value) => {
        setPrices(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }))
    }

    const getValue = (key) => {
        const field = PRICE_FIELDS.find(f => f.key === key)
        return field?.hasChapati ? prices[key]?.base : prices[key]?.fixed
    }

    const handleSave = () => {
        updatePricing(prices)
        setSaved(true)
        toast.current.show({
            severity: 'success',
            summary: 'Pricing saved',
            detail: 'New prices apply to all future entries',
            life: 3000,
        })
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            {/* Info banner */}
            <div className={styles.infoBanner}>
                <i className='pi pi-info-circle' style={{ marginTop: '1px', flexShrink: 0 }} />
                <span>
                    Base price is for default chapati count. Each chapati below default reduces price by <strong>₹5</strong>.
                </span>
            </div>

            {/* Price rows */}
            <div className={styles.priceList}>
                {PRICE_FIELDS.map(field => {
                    const val = getValue(field.key)
                    return (
                        <div key={field.key} className={styles.priceRow}>

                            {/* Left — icon + label */}
                            <div className={styles.priceLeft}>
                                <AppIcon name='bag' size={20} color={field.color} />
                                <div>
                                    <div className={styles.priceLabel}>{field.label}</div>
                                    <div className={styles.priceSub}>{field.sub}</div>
                                </div>
                            </div>

                            {/* Right — input */}
                            <div className={styles.priceInput}>
                                <span className={styles.rupeeSign}>₹</span>
                                <input
                                    type='number'
                                    value={val ?? ''}
                                    min={0}
                                    max={999}
                                    onChange={e => updateField(
                                        field.key,
                                        field.hasChapati ? 'base' : 'fixed',
                                        Number(e.target.value)
                                    )}
                                    className={styles.input}
                                    style={{ color: field.color }}  // ← per-field color stays inline
                                />
                            </div>

                        </div>
                    )
                })}
            </div>

            {/* Save */}
            <div className={styles.saveRow}>
                <AppButton
                    label={saved ? 'Saved ✓' : 'Save pricing'}
                    icon={<i className='pi pi-save' />}
                    variant={saved ? 'success' : 'primary'}
                    fullWidth
                    onClick={handleSave}
                />
            </div>
        </div>
    )
}

export default PricingPage