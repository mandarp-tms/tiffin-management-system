import { useState, useRef, useEffect } from 'react'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
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
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const [prices, setPrices] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // centerId — center role has it directly, admin needs to pass one
    // For center role: currentUser.centerId is set when they log in
    const centerId = currentUser?.centerId || 1

    // Load pricing on mount
    useEffect(() => {
        if (!centerId) return
        setLoading(true)
        getPricing(centerId)
            .then(data => setPrices(data))
            .catch(err => {
                console.error('Load pricing error:', err)
                toast.current?.show({ severity: 'error', summary: 'Failed to load pricing', life: 3000 })
            })
            .finally(() => setLoading(false))
    }, [centerId])

    const updateField = (key, field, value) => {
        setPrices(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }))
    }

    const getValue = (key) => {
        const field = PRICE_FIELDS.find(f => f.key === key)
        return field?.hasChapati ? prices?.[key]?.basePrice : prices?.[key]?.basePrice
    }

    const handleSave = async () => {
        if (!prices) return
        setSaving(true)

        // Reshape from { full: { basePrice, defaultChapati } }
        // to the format backend PUT /pricing expects
        const shapedPrices = {}
        PRICE_FIELDS.forEach(f => {
            shapedPrices[f.key] = {
                basePrice: prices[f.key]?.basePrice || 0,
                defaultChapati: prices[f.key]?.defaultChapati || 0,
                pricePerChapati: prices[f.key]?.pricePerChapati || 5,
                isFixedPrice: !f.hasChapati,
            }
        })

        try {
            await updatePricing(centerId, shapedPrices)
            setSaved(true)
            toast.current.show({
                severity: 'success',
                summary: 'Pricing saved',
                detail: 'New prices apply to all future entries',
                life: 3000,
            })
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Save failed',
                detail: err?.message || 'Could not save pricing',
                life: 3000,
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.infoBanner}>
                    <i className='pi pi-spin pi-spinner' />
                    <span>Loading pricing...</span>
                </div>
            </div>
        )
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
                            <div className={styles.priceLeft}>
                                <AppIcon name='bag' size={20} color={field.color} />
                                <div>
                                    <div className={styles.priceLabel}>{field.label}</div>
                                    <div className={styles.priceSub}>{field.sub}</div>
                                </div>
                            </div>
                            <div className={styles.priceInput}>
                                <span className={styles.rupeeSign}>₹</span>
                                <input
                                    type='number'
                                    value={val ?? ''}
                                    min={0}
                                    max={999}
                                    onChange={e => updateField(
                                        field.key,
                                        'basePrice',
                                        Number(e.target.value)
                                    )}
                                    className={styles.input}
                                    style={{ color: field.color }}
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
                    icon={<i className={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'} />}
                    variant={saved ? 'success' : 'primary'}
                    fullWidth
                    disabled={saving}
                    onClick={handleSave}
                />
            </div>
        </div>
    )
}

export default PricingPage