import { useState, useMemo } from 'react'
import { FaTimes, FaUsers, FaTag } from 'react-icons/fa'
import AppButton from '../components/AppButton'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getAllCenters, getCustomersByCenter, getCenterStats } from '../services/tiffinCenterService'
import { getPricing, updatePricing } from '../services/pricingService'
import { getAllTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'

// ── Pricing Modal ──────────────────────────────────────────────
const PRICE_FIELDS = [
    { key: 'full', label: 'Full tiffin', sub: '3 chapati default', hasChapati: true },
    { key: 'half', label: 'Half tiffin', sub: '2 chapati default', hasChapati: true },
    { key: 'chapati', label: 'Only chapati', sub: '2 chapati default', hasChapati: true },
    { key: 'bhakari', label: 'Bhakari', sub: '2 chapati default', hasChapati: true },
    { key: 'dalrice', label: 'Dal rice', sub: 'Fixed price', hasChapati: false },
]

const ModalWrap = ({ onClose, children, maxWidth = '480px' }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }}
    >
        <div
            onClick={e => e.stopPropagation()}
            style={{
                background: 'var(--surface-card)',
                borderRadius: '14px',
                width: '100%', maxWidth,
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
        >
            {children}
        </div>
    </div>
)

const ModalHeader = ({ title, sub, onClose }) => (
    <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0,
        background: 'var(--surface-card)', zIndex: 1,
    }}>
        <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{title}</div>
            {sub && <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>{sub}</div>}
        </div>
        <div onClick={onClose} style={{ cursor: 'pointer', padding: '6px' }}>
            <FaTimes size={15} color='var(--text-color-secondary)' />
        </div>
    </div>
)

const PricingModal = ({ center, onClose }) => {
    const [prices, setPrices] = useState(() => getPricing(center.id))
    const [saved, setSaved] = useState(false)

    const getValue = (key) => {
        const f = PRICE_FIELDS.find(f => f.key === key)
        return f?.hasChapati ? prices[key]?.base : prices[key]?.fixed
    }

    const updateField = (key, field, value) =>
        setPrices(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

    const handleSave = () => {
        updatePricing(center.id, prices)
        setSaved(true)
        setTimeout(() => { setSaved(false); onClose() }, 900)
    }

    return (
        <ModalWrap onClose={onClose}>
            <ModalHeader
                title={`Pricing — ${center.name}`}
                sub='Set tiffin prices for this center'
                onClose={onClose}
            />

            <div style={{
                margin: '1rem 1.25rem 0',
                background: '#E6F1FB', borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '12px', color: '#042C53',
            }}>
                Each chapati below default reduces price by <strong>₹5</strong>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PRICE_FIELDS.map(field => (
                    <div key={field.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1rem',
                        background: 'var(--surface-ground)',
                        borderRadius: '10px',
                        gap: '1rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{field.label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                {field.sub}
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'var(--surface-card)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '8px', padding: '6px 10px',
                            minWidth: '100px',
                        }}>
                            <span style={{ color: 'var(--text-color-secondary)', fontWeight: 600 }}>₹</span>
                            <input
                                type='number'
                                value={getValue(field.key) ?? ''}
                                min={0} max={999}
                                onChange={e => updateField(
                                    field.key,
                                    field.hasChapati ? 'base' : 'fixed',
                                    Number(e.target.value)
                                )}
                                style={{
                                    width: '60px', border: 'none', outline: 'none',
                                    background: 'transparent', fontSize: '18px',
                                    fontWeight: 700, color: 'var(--primary-color)',
                                    textAlign: 'right', fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--surface-border)',
                display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
            }}>
                <AppButton label='Cancel' variant='secondary' onClick={onClose} />
                <AppButton
                    label={saved ? 'Saved ✓' : 'Save pricing'}
                    variant={saved ? 'success' : 'primary'}
                    onClick={handleSave}
                />
            </div>
        </ModalWrap>
    )
}

// ── Customers Modal ────────────────────────────────────────────
const CustomersModal = ({ center, onClose }) => {
    const customers = getCustomersByCenter(center.id)
    const tiffins = getAllTiffins()

    const stats = customers.map(u => {
        const mine = tiffins.filter(t => t.userId === u.id)
        const approved = mine.filter(t => t.status === 'approved' && t.type !== 'none')
        const pending = mine.filter(t => t.status === 'pending')
        const total = approved.reduce((s, t) => s + t.amount, 0)
        const typeCounts = approved.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1; return acc
        }, {})
        const favouriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
        return { ...u, approved: approved.length, pending: pending.length, total, favouriteType }
    })

    return (
        <ModalWrap onClose={onClose} maxWidth='600px'>
            <ModalHeader
                title={`Customers — ${center.name}`}
                sub={`${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
                onClose={onClose}
            />

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '2rem',
                        color: 'var(--text-color-secondary)', fontSize: '14px',
                    }}>
                        No customers assigned to this center yet.
                    </div>
                )}

                {stats.map(u => (
                    <div key={u.id} style={{
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px', overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            borderBottom: '1px solid var(--surface-border)',
                            background: 'var(--surface-ground)',
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: '#E1F5EE', color: '#085041',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '14px', flexShrink: 0,
                            }}>
                                {u.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                    @{u.username}
                                </div>
                            </div>
                            <StatusBadge status='active' />
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                            {[
                                { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
                                { label: 'Tiffins', value: u.approved, color: 'var(--text-color)' },
                                { label: 'Pending', value: u.pending, color: '#BA7517' },
                                { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
                            ].map((stat, i) => (
                                <div key={stat.label} style={{
                                    padding: '0.75rem',
                                    borderRight: i < 3 ? '1px solid var(--surface-border)' : 'none',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                        {stat.label}
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ModalWrap>
    )
}

// ── Main Page ──────────────────────────────────────────────────
const TiffinCentersPage = () => {
    const [pricingModal, setPricingModal] = useState(null)
    const [customersModal, setCustomersModal] = useState(null)

    const tableData = useMemo(() =>
        getAllCenters().map(c => ({ ...c, ...getCenterStats(c.id) }))
        , [])

    const columns = [
        {
            header: 'Tiffin Center',
            body: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#EEEDFE', color: '#26215C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '12px', flexShrink: 0,
                    }}>
                        {row.avatar}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{row.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)' }}>
                            {row.address}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Phone',
            body: row => (
                <span style={{ fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                    {row.phone}
                </span>
            ),
        },
        {
            header: 'Status',
            body: row => <StatusBadge status={row.status} />,
        },
        {
            header: 'This month',
            body: row => (
                <div>
                    <div style={{ fontWeight: 600, color: '#0F6E56', fontSize: '14px' }}>
                        ₹{row.totalAmount}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                        {row.tiffinCount} tiffins
                    </div>
                </div>
            ),
        },
        {
            header: 'Customers',
            align: 'center',
            body: row => (
                <AppButton
                    label={`${row.customerCount} customers`}
                    icon={<FaUsers size={12} />}
                    variant='secondary'
                    size='sm'
                    onClick={() => setCustomersModal(row)}
                />
            ),
        },
        {
            header: 'Pricing',
            body: row => (
                <AppButton
                    label='Set pricing'
                    icon={<FaTag size={12} />}
                    variant='primary'
                    size='sm'
                    onClick={() => setPricingModal(row)}
                />
            ),
        },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Header */}
            <div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>Tiffin Centers</div>
                <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                    {tableData.length} center{tableData.length !== 1 ? 's' : ''} registered
                </div>
            </div>

            {/* Hierarchy banner */}
            <div style={{
                background: '#EEEDFE', border: '1px solid #C5C2F5',
                borderRadius: '10px', padding: '0.75rem 1rem',
                fontSize: '13px', color: '#26215C',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <span>🏗️</span>
                <span>
                    <strong>Super Admin</strong> → Tiffin Center → Customers.
                    Each center manages its own customers and pricing independently.
                </span>
            </div>

            {/* Centers table */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    fontWeight: 600, fontSize: '14px',
                }}>
                    Registered tiffin centers
                </div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    emptyMessage='No tiffin centers registered yet.'
                    pageSize={10}
                />
            </div>

            {/* Modals */}
            {pricingModal && <PricingModal center={pricingModal} onClose={() => setPricingModal(null)} />}
            {customersModal && <CustomersModal center={customersModal} onClose={() => setCustomersModal(null)} />}
        </div>
    )
}

export default TiffinCentersPage