import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import AppDropdown from '../components/AppDropdown'
import AppInput from '../components/AppInput'
import { useAuth } from '../context/AuthContext'
import { addTiffin, markNoTiffin } from '../services/tiffinService'
import { getPricing } from '../services/pricingService'
import { getTiffinUsers } from '../services/userService'
import { SHIFTS, ROLES } from '../utils/constants'
import AppDatePicker from '../components/AppDatePicker'

const getDateOptions = () => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const fmt = (d) => d.toISOString().split('T')[0]
    const label = (d, offset) => {
        const day = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
        return offset === 0 ? `Today — ${day}` : `Tomorrow — ${day}`
    }

    return [
        { label: label(today, 0), value: fmt(today) },
        { label: label(tomorrow, 1), value: fmt(tomorrow) },
    ]
}

// Builds a descending dropdown list around the default, e.g. default=3 -> [3,2,1]
const buildChapatiDropdownOptions = (defaultChapati) => {
    const max = Math.max(defaultChapati, 1)
    const opts = []
    for (let i = max; i >= 1; i--) {
        opts.push({ label: i === max ? `${i} (default)` : `${i}`, value: i })
    }
    return opts
}

// Mode is decided purely by isFixedPrice; whether the field shows at all is decided by defaultChapati
const getChapatiConfig = (pricingEntry) => {
    if (!pricingEntry) return { mode: 'none' }

    const def = pricingEntry.defaultChapati
    const hasField = def !== null && def !== undefined && def !== '' && def !== 0

    if (!hasField) return { mode: 'none' }

    if (pricingEntry.isFixedPrice === true) {
        return { mode: 'input', default: def }
    }

    return { mode: 'dropdown', default: def, options: buildChapatiDropdownOptions(def) }
}

const AddTiffinPage = () => {
    const { currentUser, isRole } = useAuth()
    const toast = useRef(null)

    const dateOptions = getDateOptions()

    // Form state
    const [selectedUser, setSelectedUser] = useState(null)
    const [date, setDate] = useState(dateOptions[0].value)
    const [shift, setShift] = useState('morning')
    const [type, setType] = useState(null)
    const [chapatiCount, setChapatiCount] = useState(0)
    const [note, setNote] = useState('')
    const [amount, setAmount] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    // Remote data
    const [customers, setCustomers] = useState([])
    const [pricing, setPricing] = useState(null)
    const [dataLoading, setDataLoading] = useState(true)

    const centerId = currentUser?.centerId || 1

    // Load customers and pricing on mount
    useEffect(() => {
        const loadData = async () => {
            setDataLoading(true)
            try {
                const [customerData, pricingData] = await Promise.all([
                    isRole(ROLES.CENTER) ? getTiffinUsers(centerId) : Promise.resolve([]),
                    getPricing(centerId),
                ])
                setCustomers(Array.isArray(customerData) ? customerData : [])

                const pricingMap = pricingData?.data || pricingData || {}
                setPricing(pricingMap)

                const firstType = Object.keys(pricingMap)[0] || null
                setType(firstType)
            } catch (err) {
                console.error('Load data error:', err)
                toast.current?.show({ severity: 'error', summary: 'Failed to load data', life: 3000 })
            } finally {
                setDataLoading(false)
            }
        }
        loadData()
    }, [centerId])

    // Set default selected customer for center role
    useEffect(() => {
        if (isRole(ROLES.CENTER) && customers.length > 0) {
            setSelectedUser(customers[0].id)
        }
    }, [customers])

    // Build dropdown options for the tiffin type selector from pricing
    const tiffinTypeOptions = useMemo(() => {
        if (!pricing) return []
        return Object.entries(pricing).map(([key, val]) => ({
            label: val.name || key,
            value: key,
        }))
    }, [pricing])

    const chapatiConfig = useMemo(() => getChapatiConfig(pricing?.[type]), [pricing, type])

    // Recalculate default chapati + amount when type changes
    useEffect(() => {
        if (!pricing || !type) return
        const config = getChapatiConfig(pricing[type])
        const defaultChap = config.mode === 'none' ? 0 : config.default
        setChapatiCount(defaultChap)
        setAmount(calculateAmountFromPricing(pricing, type, defaultChap))
    }, [type, pricing])

    // Recalculate amount when chapati count changes
    useEffect(() => {
        if (pricing && type) {
            setAmount(calculateAmountFromPricing(pricing, type, chapatiCount))
        }
    }, [chapatiCount])

    const calculateAmountFromPricing = (pricingData, tiffinType, chapati) => {
        const p = pricingData?.[tiffinType]
        if (!p) return 0

        const hasChapatiField = p.defaultChapati !== null && p.defaultChapati !== undefined
            && p.defaultChapati !== '' && p.defaultChapati !== 0

        // No chapati/bhakari concept at all — one flat price for the whole item (e.g. Dal Rice)
        if (!hasChapatiField) return parseFloat(p.basePrice)

        // Fixed per-unit price — multiply by however many the user selected/entered
        if (p.isFixedPrice) return parseFloat(p.basePrice) * chapati

        // Variable pricing — base price adjusted up/down from the default count
        const diff = (p.defaultChapati - chapati)
        const result = parseFloat(p.basePrice) - (diff * parseFloat(p.pricePerChapati || 5))
        return Math.max(0, result)
    }

    const userOptions = customers.map(u => ({ label: u.name, value: u.id }))

    const resolvedUserId = isRole(ROLES.USER)
        ? currentUser.id
        : selectedUser

    const resolvedUserName = isRole(ROLES.USER)
        ? currentUser.name
        : customers.find(u => u.id === selectedUser)?.name || ''

    const handleSubmit = async () => {
        if (!resolvedUserId) {
            toast.current.show({ severity: 'warn', summary: 'Select a customer', life: 2500 })
            return
        }
        setSubmitting(true)
        try {
            await addTiffin({
                userId: resolvedUserId,
                date,
                shift,
                type,
                chapatiCount,
                note,
            })
            toast.current.show({
                severity: 'success',
                summary: isRole(ROLES.CENTER) ? 'Entry added & approved' : 'Entry submitted',
                detail: isRole(ROLES.CENTER)
                    ? `Added for ${resolvedUserName}`
                    : 'Awaiting tiffin center approval',
                life: 3000,
            })
            setNote('')
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Failed to add tiffin',
                detail: err?.message || 'Something went wrong',
                life: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleNoTiffin = async () => {
        if (!resolvedUserId) {
            toast.current.show({ severity: 'warn', summary: 'Select a customer', life: 2500 })
            return
        }
        setSubmitting(true)
        try {
            await markNoTiffin(resolvedUserId, date)
            toast.current.show({
                severity: 'info',
                summary: 'Marked no tiffin',
                detail: `${resolvedUserName} — ${date}`,
                life: 3000,
            })
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Failed',
                detail: err?.message || 'Something went wrong',
                life: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (dataLoading) {
        return (
            <div style={{ maxWidth: '480px' }}>
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-color-secondary)',
                    fontSize: '13px',
                }}>
                    <i className='pi pi-spin pi-spinner' style={{ fontSize: '20px', marginBottom: '8px' }} />
                    <div>Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '480px' }}>
            <Toast ref={toast} />

            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Add Tiffin Entry</span>
                    {isRole(ROLES.CENTER) && (
                        <span style={{
                            background: '#E1F5EE', color: '#085041',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 500,
                        }}>
                            Auto-Approved
                        </span>
                    )}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Customer selector — center only */}
                    {isRole(ROLES.CENTER) && (
                        <AppDropdown
                            label='Customer'
                            value={selectedUser}
                            options={userOptions}
                            onChange={e => setSelectedUser(e.value)}
                            placeholder='Select customer'
                        />
                    )}

                    {/* Date */}
                    {isRole(ROLES.USER)
                        ? (
                            <AppDropdown
                                label='Date'
                                value={date}
                                options={dateOptions}
                                onChange={e => setDate(e.value)}
                            />
                        ) : (
                            <AppDatePicker
                                label='Date'
                                value={date}
                                onChange={e => setDate(e.value)}
                            />
                        )
                    }

                    {/* Shift */}
                    <AppDropdown
                        label='Shift'
                        value={shift}
                        options={SHIFTS}
                        onChange={e => setShift(e.value)}
                    />

                    {/* Tiffin type — dynamic from pricing */}
                    <AppDropdown
                        label='Tiffin Type'
                        value={type}
                        options={tiffinTypeOptions}
                        onChange={e => setType(e.value)}
                    />

                    {/* Chapati / Bhakari — dropdown or number input, based on isFixedPrice */}
                    {chapatiConfig.mode === 'dropdown' && (
                        <AppDropdown
                            label={`${pricing?.[type]?.name} Count`}
                            value={chapatiCount}
                            options={chapatiConfig.options}
                            onChange={e => setChapatiCount(e.value)}
                        />
                    )}

                    {chapatiConfig.mode === 'input' && (
                        <AppInput
                            label={`${pricing?.[type]?.name} Count`}
                            type='number'
                            value={chapatiCount}
                            onChange={e => setChapatiCount(Number(e.value) || 0)}
                        />
                    )}

                    {/* Note */}
                    <AppInput
                        label='Note (Optional)'
                        type='text'
                        value={note}
                        onChange={e => setNote(e.value)}
                        placeholder='e.g. extra spicy, no onion'
                    />

                    {/* Amount preview */}
                    <div style={{
                        background: 'var(--surface-ground)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                Estimated Amount
                            </div>
                            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F6E56' }}>
                                ₹{amount}
                            </div>
                            {!isRole(ROLES.CENTER) && (
                                <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                    Subject to Approval
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', textAlign: 'right' }}>
                            <div>{SHIFTS.find(s => s.value === shift)?.label}</div>
                            <div style={{ marginTop: '4px', fontWeight: 500 }}>
                                {date === dateOptions[0].value ? 'Today' : 'Tomorrow'}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                            label='No Tiffin'
                            icon='pi pi-times'
                            severity='secondary'
                            outlined
                            style={{ flex: 1 }}
                            disabled={submitting}
                            onClick={handleNoTiffin}
                        />
                        <Button
                            label={isRole(ROLES.CENTER) ? 'Add & approve' : 'Submit'}
                            icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                            style={{ flex: 2 }}
                            disabled={submitting}
                            onClick={handleSubmit}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AddTiffinPage