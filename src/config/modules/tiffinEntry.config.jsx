import { getPricing } from '../../services/pricingService'
import AppButton from '../../components/AppButton'
import { markNoTiffin } from '../../services/tiffinService'
import { SHIFTS, TYPE_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/formatDate'
import StatusBadge from '../../components/StatusBadge'
import clsx from 'clsx'
import { FaTimes, FaCheck, FaSpinner } from 'react-icons/fa'

// Builds a descending dropdown list around the default, e.g. default=3 -> [3,2,1]
const buildChapatiDropdownOptions = (defaultChapati) => {
    const max = Math.max(defaultChapati, 1)
    const opts = []
    for (let i = max; i >= 1; i--) {
        opts.push({ label: i === max ? `${i} (default)` : `${i}`, value: i })
    }
    return opts
}

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

const calculateAmountFromPricing = (pricingData, tiffinType, chapati) => {
    const p = pricingData?.[tiffinType]
    if (!p) return 0
    const hasChapatiField = p.defaultChapati !== null && p.defaultChapati !== undefined
        && p.defaultChapati !== '' && p.defaultChapati !== 0
    if (!hasChapatiField) return parseFloat(p.basePrice)
    if (p.isFixedPrice) return parseFloat(p.basePrice) * (chapati || 0)
    const diff = (p.defaultChapati - (chapati || 0))
    const result = parseFloat(p.basePrice) - (diff * parseFloat(p.pricePerChapati || 5))
    return Math.max(0, result)
}

const fetchCustomData = async ({ currentUser }) => {
    const centerId = currentUser?.centerId || 1
    const res = await getPricing(centerId)
    const pricingMap = res?.data || res || {}
    return pricingMap
}

const getFieldProps = ({ values, customData, currentUser }) => {
    const pricing = customData || {}
    const tiffinTypes = Object.entries(pricing).map(([key, val]) => ({
        label: val.name || key,
        value: key,
    }))

    const chapatiConfig = getChapatiConfig(pricing[values.type])

    return {
        userId: {
            hidden: currentUser?.role === 'user'
        },
        type: {
            options: tiffinTypes
        },
        chapatiCount: {
            hidden: chapatiConfig.mode === 'none',
            type: chapatiConfig.mode === 'input' ? 'number' : undefined, // Override AppInput type to number if input mode
            options: chapatiConfig.mode === 'dropdown' ? chapatiConfig.options : [],
            label: pricing[values.type]?.name ? `${pricing[values.type].name} Count` : 'Chapati Count',
        }
    }
}

const renderFooter = ({ values, handleSubmit, loading, customData, currentUser }) => {
    const pricing = customData || {}
    const amount = calculateAmountFromPricing(pricing, values.type, Number(values.chapatiCount))

    const handleNoTiffin = async () => {
        if (!values.userId) {
            alert('Please select a customer first')
            return
        }
        try {
            await markNoTiffin(values.userId, values.date)
            alert('Marked no tiffin')
        } catch (err) {
            alert('Failed to mark no tiffin')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
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
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', textAlign: 'right' }}>
                    <div>{SHIFTS.find(s => s.value === values.shift)?.label || values.shift}</div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <AppButton
                    label='No Tiffin'
                    icon={<FaTimes />}
                    variant='secondary'
                    style={{ flex: 1 }}
                    disabled={loading}
                    onClick={(e) => { e.preventDefault(); handleNoTiffin(); }}
                />
                <AppButton
                    label={currentUser?.role === 'center' ? 'Save & Approve' : 'Submit'}
                    icon={loading ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                    style={{ flex: 2 }}
                    disabled={loading}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    )
}

export const tiffinEntryConfig = {
    id: 'tiffinEntry',
    label: 'Tiffin Entries',
    endpoint: '/tiffin-entries',
    listPath: '/my-tiffins',

    list: {
        columns: [
            { header: 'Date', body: row => formatDate(row.entryDate) },
            {
                header: 'Customer',
                body: row => row.user?.name || '—',
            },
            { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
            { header: 'Type', body: row => <StatusBadge status={row.tiffinType} label={TYPE_LABELS[row.tiffinType] || row.tiffinType} /> },
            { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
            {
                header: 'Amount',
                body: row => (
                    <span style={{ fontWeight: 600, color: row.status !== 'approved' ? 'var(--text-color-secondary)' : '#0F6E56' }}>
                        {row.amount ? `₹${row.amount}` : '—'}
                    </span>
                ),
            },
            { header: 'Status', body: row => <StatusBadge status={row.status} /> },
        ],
        emptyMessage: 'No tiffin entries found.',
    },

    add: {
        title: 'Add Tiffin Entry',
        endpoint: { method: 'POST', url: '/tiffin-entries' },
        fetchCustomData,
        getFieldProps,
        renderFooter,
        fields: [
            {
                key: 'userId',
                label: 'Customer',
                type: 'dropdown',
                placeholder: 'Select customer',
                required: true,
                optionsFrom: 'api',
                apiSource: '/mini-api/customers', // Using mini api for dropdown
                apiLabelKey: 'name',
                apiValueKey: 'id',
            },
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
            },
            {
                key: 'shift',
                label: 'Shift',
                type: 'dropdown',
                required: true,
                options: [
                    { label: 'Morning', value: 'morning' },
                    { label: 'Evening', value: 'evening' },
                ]
            },
            {
                key: 'type',
                label: 'Tiffin Type',
                type: 'dropdown',
                required: true,
                // Options injected dynamically
            },
            {
                key: 'chapatiCount',
                label: 'Chapati Count',
                type: 'dropdown',
                required: false,
                // Options and hidden state injected dynamically
            },
            {
                key: 'note',
                label: 'Note (Optional)',
                type: 'input',
                inputType: 'text',
                placeholder: 'e.g. extra spicy, no onion',
            },
        ],
    },

    edit: {
        title: 'Edit Tiffin Entry',
        endpoint: { method: 'PUT', url: '/tiffin-entries/:id' },
        fetchCustomData,
        getFieldProps,
        renderFooter,
        fields: [
            {
                key: 'userId',
                label: 'Customer',
                type: 'dropdown',
                placeholder: 'Select customer',
                required: true,
                optionsFrom: 'api',
                apiSource: '/mini-api/customers',
                apiLabelKey: 'name',
                apiValueKey: 'id',
            },
            {
                key: 'date',
                label: 'Date',
                type: 'date',
                required: true,
            },
            {
                key: 'shift',
                label: 'Shift',
                type: 'dropdown',
                required: true,
                options: [
                    { label: 'Morning', value: 'morning' },
                    { label: 'Evening', value: 'evening' },
                ]
            },
            {
                key: 'type',
                label: 'Tiffin Type',
                type: 'dropdown',
                required: true,
            },
            {
                key: 'chapatiCount',
                label: 'Chapati Count',
                type: 'dropdown',
                required: false,
            },
            {
                key: 'status',
                label: 'Status',
                type: 'dropdown',
                required: true,
                options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                ]
            },
            {
                key: 'note',
                label: 'Note (Optional)',
                type: 'input',
                inputType: 'text',
            },
        ],
        idKey: 'id',
    },
}
