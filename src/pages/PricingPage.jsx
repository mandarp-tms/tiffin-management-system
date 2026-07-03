import { useState, useRef, useEffect } from 'react'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import { getPricing, updatePricing } from '../services/pricingService'
import AppIcon from '../components/AppIcon'
import AppButton from '../components/AppButton'
import styles from './PricingPage.module.css'

const PALETTE = [
    '#1D9E75',
    '#534AB7',
    '#BA7517',
    '#185FA5',
    '#993C1D',
    '#e84393',
    '#00b4d8',
    '#606c38',
]

const getColor = (index) => PALETTE[index % PALETTE.length]

const PricingPage = () => {
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const [prices, setPrices] = useState(null)
    const [typeKeys, setTypeKeys] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const centerId = currentUser?.centerId || 1

    useEffect(() => {
        if (!centerId) return
        setLoading(true)
        getPricing(centerId)
            .then(data => {
                setPrices(data)
                setTypeKeys(Object.keys(data))
            })
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

    const handleSave = async () => {
        if (!prices) return
        setSaving(true)

        const shapedPrices = {}
        typeKeys.forEach(key => {
            shapedPrices[key] = {
                basePrice: prices[key]?.basePrice || 0,
                defaultChapati: prices[key]?.defaultChapati || 0,
                pricePerChapati: prices[key]?.pricePerChapati || 5,
                isFixedPrice: prices[key]?.isFixedPrice || false,
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

            <div className={styles.infoBanner}>
                <i className='pi pi-info-circle' style={{ marginTop: '1px', flexShrink: 0 }} />
                <span>
                    Base price is for default chapati count. Each chapati below default reduces price by the price per chapati.
                </span>
            </div>

            <div className={styles.priceList}>
                {typeKeys.map((key, index) => {
                    const entry = prices[key]
                    const color = getColor(index)
                    const isFixed = entry?.isFixedPrice
                    const sub = isFixed
                        ? 'Fixed price'
                        : `${entry?.defaultChapati ?? 0} chapati default`

                    return (
                        <div key={key} className={styles.priceRow}>
                            <div className={styles.priceLeft}>
                                <AppIcon name='bag' size={20} color={color} />
                                <div>
                                    <div className={styles.priceLabel}>{entry?.name}</div>
                                    <div className={styles.priceSub}>{sub}</div>
                                </div>
                            </div>
                            <div className={styles.priceInput}>
                                <span className={styles.rupeeSign}>₹</span>
                                <input
                                    type='number'
                                    value={entry?.basePrice ?? ''}
                                    min={0}
                                    max={9999}
                                    onChange={e => updateField(key, 'basePrice', Number(e.target.value))}
                                    className={styles.input}
                                    style={{ color }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

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