import { useState, useEffect, useCallback } from 'react'
import { FaTimes, FaUsers, FaTag } from 'react-icons/fa'
import clsx from 'clsx'
import AppButton from '../components/AppButton'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getAllCenters, getCenterCustomers } from '../services/tiffinCenterService'
import { getPricing, updatePricing } from '../services/pricingService'
import { TYPE_LABELS } from '../utils/constants'
import styles from './TiffinCentersPage.module.css'

const PRICE_FIELDS = [
    { key: 'full', label: 'Full tiffin', sub: 'Chapati default', hasChapati: true },
    { key: 'half', label: 'Half tiffin', sub: 'Chapati default', hasChapati: true },
    { key: 'chapati', label: 'Only chapati', sub: 'Chapati default', hasChapati: true },
    { key: 'bhakari', label: 'Bhakari', sub: 'Bhakri default', hasChapati: true },
    { key: 'dalrice', label: 'Dal rice', sub: 'Fixed price', hasChapati: false },
]

// ── Shared modal wrapper ───────────────────────────────────────
const ModalWrap = ({ onClose, children, maxWidth = '480px' }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} style={{ maxWidth }} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
)

const ModalHeader = ({ title, sub, onClose }) => (
    <div className={styles.modalHeader}>
        <div>
            <div className={styles.modalTitle}>{title}</div>
            {sub && <div className={styles.modalSub}>{sub}</div>}
        </div>
        <div className={styles.modalClose} onClick={onClose}>
            <FaTimes size={15} color='var(--text-color-secondary)' />
        </div>
    </div>
)

// ── Pricing Modal ──────────────────────────────────────────────
const PricingModal = ({ center, onClose }) => {
    const [prices, setPrices] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setLoading(true)
        getPricing(center.id)
            .then(data => setPrices(data))
            .catch(err => console.error('Load pricing error:', err))
            .finally(() => setLoading(false))
    }, [center.id])

    const getValue = (key) => prices?.[key]?.basePrice ?? ''

    const updateField = (key, value) =>
        setPrices(prev => ({ ...prev, [key]: { ...prev[key], basePrice: value } }))

    const handleSave = async () => {
        if (!prices) return
        setSaving(true)
        try {
            const shapedPrices = {}
            PRICE_FIELDS.forEach(f => {
                shapedPrices[f.key] = {
                    basePrice: prices[f.key]?.basePrice || 0,
                    defaultChapati: prices[f.key]?.defaultChapati || 0,
                    pricePerChapati: prices[f.key]?.pricePerChapati || 5,
                    isFixedPrice: !f.hasChapati,
                }
            })
            await updatePricing(center.id, shapedPrices)
            setSaved(true)
            setTimeout(() => { setSaved(false); onClose() }, 900)
        } catch (err) {
            console.error('Save pricing error:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalWrap onClose={onClose}>
            <ModalHeader
                title={`Pricing — ${center.name}`}
                sub='Set tiffin prices for this center'
                onClose={onClose}
            />

            <div className={styles.modalInfoBanner}>
                Each chapati below default reduces price by respective price per chapati.
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                    Loading pricing...
                </div>
            ) : (
                <div className={styles.pricingList}>
                    {PRICE_FIELDS.map(field => {
                        const defaultChapati = `${field.hasChapati ? prices?.[field.key]?.defaultChapati + ' ' : ''}`
                        return (<div key={field.key} className={styles.pricingRow}>
                            <div>
                                <div className={styles.pricingLabel}>{field.label}</div>
                                <div className={styles.pricingSub}>{defaultChapati + field.sub}</div>
                            </div>
                            <div className={styles.pricingInput}>
                                <span className={styles.rupeeSign}>₹</span>
                                <input
                                    type='number'
                                    className={styles.numberInput}
                                    value={getValue(field.key)}
                                    min={0}
                                    max={999}
                                    onChange={e => updateField(field.key, Number(e.target.value))}
                                />
                            </div>
                        </div>)
                    })}
                </div>
            )}

            <div className={styles.modalFooter}>
                <AppButton label='Cancel' variant='secondary' onClick={onClose} />
                <AppButton
                    label={saved ? 'Saved ✓' : 'Save pricing'}
                    variant={saved ? 'success' : 'primary'}
                    disabled={saving || loading}
                    onClick={handleSave}
                />
            </div>
        </ModalWrap>
    )
}

// ── Customers Modal ────────────────────────────────────────────
const CustomersModal = ({ center, onClose }) => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getCenterCustomers(center.id)
            .then(data => setCustomers(Array.isArray(data) ? data : []))
            .catch(err => console.error('Load customers error:', err))
            .finally(() => setLoading(false))
    }, [center.id])

    const statCells = (u) => [
        { label: 'Amount due', value: `₹${u.total || 0}`, color: '#0F6E56' },
        { label: 'Tiffins', value: u.approvedCount || 0, color: 'var(--text-color)' },
        { label: 'Pending', value: u.pending || 0, color: '#BA7517' },
        { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
    ]

    return (
        <ModalWrap onClose={onClose} maxWidth='600px'>
            <ModalHeader
                title={`Customers — ${center.name}`}
                sub={loading ? 'Loading...' : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
                onClose={onClose}
            />

            <div className={styles.customerList}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                        <i className='pi pi-spin pi-spinner' style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }} />
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className={styles.emptyState}>No customers assigned to this center yet.</div>
                ) : (
                    customers.map(u => (
                        <div key={u.id} className={styles.customerCard}>
                            <div className={styles.customerHead}>
                                <div className={styles.customerAvatar}>{u.avatar}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className={styles.customerName}>{u.name}</div>
                                    <div className={styles.customerUsername}>@{u.username}</div>
                                </div>
                                <StatusBadge status='active' />
                            </div>
                            <div className={styles.customerStats}>
                                {statCells(u).map((stat, i) => (
                                    <div
                                        key={stat.label}
                                        className={clsx(styles.customerStatCell, i < 3 && styles.borderRight)}
                                    >
                                        <div className={styles.customerStatLabel}>{stat.label}</div>
                                        <div className={styles.customerStatValue} style={{ color: stat.color }}>
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ModalWrap>
    )
}

// ── Main Page ──────────────────────────────────────────────────
const TiffinCentersPage = () => {
    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(true)
    const [pricingModal, setPricingModal] = useState(null)
    const [customersModal, setCustomersModal] = useState(null)

    useEffect(() => {
        setLoading(true)
        getAllCenters()
            .then(data => setTableData(Array.isArray(data) ? data : []))
            .catch(err => console.error('Load centers error:', err))
            .finally(() => setLoading(false))
    }, [])

    const columns = [
        {
            header: 'Tiffin Center',
            body: row => (
                <div className={styles.centerCell}>
                    <div className={styles.centerAvatar}>{row.avatar}</div>
                    <div>
                        <div className={styles.centerName}>{row.name}</div>
                        <div className={styles.centerAddress}>{row.address}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Phone',
            body: row => <span className={styles.centerAddress}>{row.phone}</span>,
        },
        {
            header: 'Status',
            body: row => <StatusBadge status={row.status} />,
        },
        {
            header: 'This month',
            body: row => (
                <div>
                    <div className={styles.amountValue}>₹{row.totalAmount || 0}</div>
                    <div className={styles.amountSub}>{row.tiffinCount || 0} tiffins</div>
                </div>
            ),
        },
        {
            header: 'Customers',
            align: 'center',
            body: row => (
                <AppButton
                    label={`${row.customerCount || 0} customers`}
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
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.title}>Tiffin Centers</div>
                <div className={styles.sub}>
                    {loading ? '...' : `${tableData.length} center${tableData.length !== 1 ? 's' : ''} registered`}
                </div>
            </div>

            <div className={styles.banner}>
                <span>🏗️</span>
                <span>
                    <strong>Super Admin</strong> → Tiffin Center → Customers.
                    Each center manages its own customers and pricing independently.
                </span>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHead}>Registered tiffin centers</div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    loading={loading}
                    emptyMessage='No tiffin centers registered yet.'
                    pageSize={10}
                />
            </div>

            {pricingModal && <PricingModal center={pricingModal} onClose={() => setPricingModal(null)} />}
            {customersModal && <CustomersModal center={customersModal} onClose={() => setCustomersModal(null)} />}

        </div>
    )
}

export default TiffinCentersPage