import { useState, useMemo, useRef } from 'react'
import { Toast } from 'primereact/toast'
import clsx from 'clsx'
import AppDataTable from '../components/AppDataTable'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import { getAllTiffins } from '../services/tiffinService'
import { getTiffinUsers } from '../services/userService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './ReportsPage.module.css'

const MONTHS = [
    { label: 'June 2025', value: '2025-06' },
    { label: 'May 2025', value: '2025-05' },
    { label: 'April 2025', value: '2025-04' },
]

const STATUS_OPTIONS = [
    { label: 'All entries', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
]

const COUNT_COLORS = {
    all: { bg: '#F1EFE8', color: '#2C2C2A' },
    approved: { bg: '#E1F5EE', color: '#085041' },
    pending: { bg: '#FAEEDA', color: '#633806' },
    rejected: { bg: '#FCEBEB', color: '#791F1F' },
}

const ReportsPage = () => {
    const toast = useRef(null)
    const allCustomers = getTiffinUsers()

    const customerOptions = [
        { label: 'All customers', value: 'all' },
        ...allCustomers.map(u => ({ label: u.name, value: u.id })),
    ]

    const [month, setMonth] = useState('2025-06')
    const [customerFilter, setCustomerFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const allFiltered = useMemo(() =>
        getAllTiffins().filter(t => {
            const matchMonth = t.date.startsWith(month)
            const matchCustomer = customerFilter === 'all' || t.userId === customerFilter
            return matchMonth && matchCustomer
        }),
        [month, customerFilter])

    const tableData = useMemo(() =>
        statusFilter === 'all' ? allFiltered : allFiltered.filter(t => t.status === statusFilter),
        [allFiltered, statusFilter])

    const customerTotals = useMemo(() =>
        allCustomers.map(u => {
            const entries = allFiltered.filter(t => t.userId === u.id && t.status === 'approved' && t.type !== 'none')
            const total = entries.reduce((s, t) => s + t.amount, 0)
            return { name: u.name, count: entries.length, total }
        }),
        [allFiltered])

    const grandTotal = customerTotals.reduce((s, u) => s + u.total, 0)

    const counts = useMemo(() => ({
        all: allFiltered.length,
        approved: allFiltered.filter(t => t.status === 'approved').length,
        pending: allFiltered.filter(t => t.status === 'pending').length,
        rejected: allFiltered.filter(t => t.status === 'rejected').length,
    }), [allFiltered])

    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Customer', field: 'userName', noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span className={clsx(styles.amount, row.status !== 'approved' && styles.amountMuted)}>{row.amount ? `₹${row.amount}` : '—'}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
    ]

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterItem}>
                    <AppDropdown label='Month' value={month} options={MONTHS} onChange={e => setMonth(e.value)} />
                </div>
                <div className={styles.filterItem}>
                    <AppDropdown label='Customer' value={customerFilter} options={customerOptions} onChange={e => setCustomerFilter(e.value)} />
                </div>
            </div>

            {/* Status filter tabs */}
            <div className={styles.statusTabs}>
                {STATUS_OPTIONS.map(opt => {
                    const isActive = statusFilter === opt.value
                    const cc = COUNT_COLORS[opt.value]
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={clsx(styles.statusTab, isActive && styles.active)}
                        >
                            {opt.label}
                            <span
                                className={styles.tabCount}
                                style={{
                                    background: isActive ? 'var(--primary-color)' : cc.bg,
                                    color: isActive ? '#fff' : cc.color,
                                }}
                            >
                                {counts[opt.value]}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Customer totals — always approved only */}
            <div className={styles.totalsGrid}>
                {customerTotals.map(u => (
                    <div key={u.name} className={styles.totalCard}>
                        <div className={styles.totalLabel}>{u.name}</div>
                        <div className={styles.totalValue}>₹{u.total}</div>
                        <div className={styles.totalSub}>{u.count} tiffins</div>
                    </div>
                ))}
                <div className={clsx(styles.totalCard, styles.grand)}>
                    <div className={clsx(styles.totalLabel, styles.grand)}>Grand total</div>
                    <div className={clsx(styles.totalValue, styles.grand)}>₹{grandTotal}</div>
                    <div className={clsx(styles.totalSub, styles.grand)}>approved only</div>
                </div>
            </div>

            {/* Info banner — non-approved filter */}
            {statusFilter !== 'all' && statusFilter !== 'approved' && (
                <div className={styles.infoBanner}>
                    <i className='pi pi-info-circle' />
                    Billing totals above always show <strong>approved entries only</strong>,
                    regardless of the status filter applied to the table.
                </div>
            )}

            {/* Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>Detailed log</span>
                    <span className={styles.tableCount}>{tableData.length} entr{tableData.length === 1 ? 'y' : 'ies'}</span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    emptyMessage='No entries found for selected filters.'
                    pageSize={10}
                />
            </div>

        </div>
    )
}

export default ReportsPage