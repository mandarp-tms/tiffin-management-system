import { useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { getPricing, updatePricing } from '../services/pricingService'
import AppIcon from '../components/AppIcon'

const PRICE_FIELDS = [
    { key: 'full', label: 'Full tiffin', sub: '3 chapati default', icon: 'pi pi-circle-fill', color: '#1D9E75', hasChapati: true },
    { key: 'half', label: 'Half tiffin', sub: '2 chapati default', icon: 'pi pi-circle-fill', color: '#534AB7', hasChapati: true },
    { key: 'chapati', label: 'Only chapati', sub: '2 chapati default', icon: 'pi pi-circle-fill', color: '#BA7517', hasChapati: true },
    { key: 'bhakari', label: 'Bhakari', sub: '2 chapati default', icon: 'pi pi-circle-fill', color: '#185FA5', hasChapati: true },
    { key: 'dalrice', label: 'Dal rice', sub: 'Fixed price', icon: 'pi pi-circle-fill', color: '#993C1D', hasChapati: false },
]

const PricingPage = () => {
    const toast = useRef(null)
    const [prices, setPrices] = useState(() => getPricing())

    const updateField = (key, field, value) => {
        setPrices(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }))
    }

    const handleSave = () => {
        updatePricing(prices)
        toast.current.show({
            severity: 'success',
            summary: 'Pricing saved',
            detail: 'New prices apply to all future entries',
            life: 3000,
        })
    }

    const getValue = (key) => {
        const field = PRICE_FIELDS.find(f => f.key === key)
        return field?.hasChapati ? prices[key]?.base : prices[key]?.fixed
    }

    return (
        <div style={{ maxWidth: '560px' }}>
            <Toast ref={toast} />

            {/* Info banner */}
            <div style={{
                background: '#E6F1FB',
                border: '1px solid #B6D4F0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '13px', color: '#042C53',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
                <i className='pi pi-info-circle' style={{ marginTop: '1px', flexShrink: 0 }} />
                <span>Base price is for default chapati count. Each chapati below default reduces price by <strong>₹5</strong>.</span>
            </div>

            {/* Price cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {PRICE_FIELDS.map(field => {
                    const val = getValue(field.key)
                    return (
                        <div key={field.key} style={{
                            background: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                        }}>
                            {/* Left — label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AppIcon name='bag' size={20} color={field.color} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>
                                        {field.label}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                        {field.sub}
                                    </div>
                                </div>
                            </div>

                            {/* Right — price input */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'var(--surface-ground)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                minWidth: '110px',
                            }}>
                                <span style={{
                                    fontSize: '15px', fontWeight: 600,
                                    color: 'var(--text-color-secondary)',
                                }}>₹</span>
                                <input
                                    type='number'
                                    value={val ?? ''}
                                    min={0} max={999}
                                    onChange={e => updateField(
                                        field.key,
                                        field.hasChapati ? 'base' : 'fixed',
                                        Number(e.target.value)
                                    )}
                                    style={{
                                        width: '70px',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: field.color,
                                        textAlign: 'right',
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Save button */}
            <Button
                label='Save pricing'
                icon='pi pi-save'
                onClick={handleSave}
                style={{ width: '100%' }}
            />
        </div>
    )
}

export default PricingPage