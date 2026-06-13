import { useState, useMemo } from 'react'
import { FaTimes, FaUsers, FaTag } from 'react-icons/fa'
import clsx from 'clsx'
import AppButton from '../components/AppButton'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getAllCenters, getCustomersByCenter, getCenterStats } from '../services/tiffinCenterService'
import { getPricing, updatePricing } from '../services/pricingService'
import { getAllTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import styles from './TiffinCentersPage.module.css'

const PRICE_FIELDS = [
    { key: 'full', label: 'Full tiffin', sub: '3 chapati default', hasChapati: true },
    { key: 'half', label: 'Half tiffin', sub: '2 chapati default', hasChapati: true },
    { key: 'chapati', label: 'Only chapati', sub: '2 chapati default', hasChapati: true },
    { key: 'bhakari', label: 'Bhakari', sub: '2 chapati default', hasChapati: true },
    { key: 'dalrice', label: 'Dal rice', sub: 'Fixed price', hasChapati: false },
]

// ── Shared modal wrapper ───────────────────────────────────────
const ModalWrap = ({ onClose, children, maxWidth = '480px' }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div
            className={styles.modal}
            style={{ maxWidth }}
            onClick={e => e.stopPropagation()}
        >
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

            <div className={styles.modalInfoBanner}>
                Each chapati below default reduces price by <strong>₹5</strong>
            </div>

            <div className={styles.pricingList}>
                {PRICE_FIELDS.map(field => (
                    <div key={field.key} className={styles.pricingRow}>
                        <div>
                            <div className={styles.pricingLabel}>{field.label}</div>
                            <div className={styles.pricingSub}>{field.sub}</div>
                        </div>
                        <div className={styles.pricingInput}>
                            <span className={styles.rupeeSign}>₹</span>
                            <input
                                type='number'
                                className={styles.numberInput}
                                value={getValue(field.key) ?? ''}
                                min={0} max={999}
                                onChange={e => updateField(
                                    field.key,
                                    field.hasChapati ? 'base' : 'fixed',
                                    Number(e.target.value)
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.modalFooter}>
                <AppButton label='Cancel' variant='secondary' onClick={onClose} />
                <AppButton label={saved ? 'Saved ✓' : 'Save pricing'} variant={saved ? 'success' : 'primary'} onClick={handleSave} />
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
            acc[t.type] = (acc[t.type] || 0) + 1
            return acc
        }, {})
        const favouriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
        return { ...u, approved: approved.length, pending: pending.length, total, favouriteType }
    })

    const statCells = (u) => [
        { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
        { label: 'Tiffins', value: u.approved, color: 'var(--text-color)' },
        { label: 'Pending', value: u.pending, color: '#BA7517' },
        { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
    ]

    return (
        <ModalWrap onClose={onClose} maxWidth='600px'>
            <ModalHeader
                title={`Customers — ${center.name}`}
                sub={`${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
                onClose={onClose}
            />

            <div className={styles.customerList}>
                {stats.length === 0 && (
                    <div className={styles.emptyState}>No customers assigned to this center yet.</div>
                )}

                {stats.map(u => (
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
                                    className={clsx(
                                        styles.customerStatCell,
                                        i < 3 && styles.borderRight,
                                    )}
                                >
                                    <div className={styles.customerStatLabel}>{stat.label}</div>
                                    <div className={styles.customerStatValue} style={{ color: stat.color }}>
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
                    <div className={styles.amountValue}>₹{row.totalAmount}</div>
                    <div className={styles.amountSub}>{row.tiffinCount} tiffins</div>
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
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.title}>Tiffin Centers</div>
                <div className={styles.sub}>{tableData.length} center{tableData.length !== 1 ? 's' : ''} registered</div>
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