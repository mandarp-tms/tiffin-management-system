import { useState, useMemo, useRef } from 'react'
import { Toast } from 'primereact/toast'
import clsx from 'clsx'
import AppDataTable from '../components/AppDataTable'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import AppButton from '../components/AppButton'
import { getAllTiffins } from '../services/tiffinService'
import { getTiffinUsers } from '../services/userService'
import {
    calculateTotalDue,
    getPayment,
    recordPayment,
} from '../services/paymentService'
import { TYPE_LABELS, ROLES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import { FaRupeeSign, FaTimes } from 'react-icons/fa'
import styles from './ReportsPage.module.css'

const MONTHS = [
    { label: 'June 2025', value: '2025-06', month: 6, year: 2025 },
    { label: 'May 2025', value: '2025-05', month: 5, year: 2025 },
    { label: 'April 2025', value: '2025-04', month: 4, year: 2025 },
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

const PAYMENT_METHODS = [
    { label: '💵 Cash', value: 'cash' },
    { label: '📱 UPI', value: 'upi' },
    { label: '🏦 Bank Transfer', value: 'bank' },
    { label: '💳 Card', value: 'card' },
]

const ReportsPage = () => {
    const toast = useRef(null)
    const { currentUser, isRole } = useAuth()
    const allCustomers = getTiffinUsers()

    const customerOptions = [
        { label: 'All customers', value: 'all' },
        ...allCustomers.map(u => ({ label: u.name, value: u.id })),
    ]

    const [month, setMonth] = useState('2025-06')
    const [customerFilter, setCustomerFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showTxModal, setShowTxModal] = useState(false)

    // Payment form state
    const [payAmount, setPayAmount] = useState('')
    const [payMethod, setPayMethod] = useState('cash')
    const [payReference, setPayReference] = useState('')
    const [payNote, setPayNote] = useState('')
    const [payRefresh, setPayRefresh] = useState(0)

    const selectedMonth = MONTHS.find(m => m.value === month)
    const currentMonth = selectedMonth?.month || 6
    const currentYear = selectedMonth?.year || 2025

    // ── Tiffin data ────────────────────────────────────────
    const allFiltered = useMemo(() =>
        getAllTiffins().filter(t => {
            const matchMonth = t.date.startsWith(month)
            const matchCustomer = customerFilter === 'all' || t.userId === customerFilter
            return matchMonth && matchCustomer
        }),
        [month, customerFilter])

    const tableData = useMemo(() =>
        statusFilter === 'all'
            ? allFiltered
            : allFiltered.filter(t => t.status === statusFilter),
        [allFiltered, statusFilter])

    const customerTotals = useMemo(() =>
        allCustomers.map(u => {
            const entries = allFiltered.filter(t =>
                t.userId === u.id && t.status === 'approved' && t.type !== 'none'
            )
            const total = entries.reduce((s, t) => s + t.amount, 0)
            return { ...u, count: entries.length, total }
        }),
        [allFiltered])

    const grandTotal = customerTotals.reduce((s, u) => s + u.total, 0)

    const counts = useMemo(() => ({
        all: allFiltered.length,
        approved: allFiltered.filter(t => t.status === 'approved').length,
        pending: allFiltered.filter(t => t.status === 'pending').length,
        rejected: allFiltered.filter(t => t.status === 'rejected').length,
    }), [allFiltered])

    // ── Payment data — driven by top customer dropdown ────
    // Only shows when a specific customer is selected
    const selectedCustomer = useMemo(() =>
        customerFilter !== 'all'
            ? allCustomers.find(u => u.id === customerFilter) || null
            : null,
        [customerFilter])

    const paymentInfo = useMemo(() => {
        if (!selectedCustomer) return null
        const centerId = selectedCustomer.centerId || 1
        const totalDue = calculateTotalDue(selectedCustomer.id, centerId, currentMonth, currentYear)
        const existing = getPayment(selectedCustomer.id, centerId, currentMonth, currentYear)
        const amountPaid = existing?.amountPaid || 0
        const balanceDue = Math.max(0, totalDue - amountPaid)
        const status = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'
        return { totalDue, amountPaid, balanceDue, status, existing, centerId }
    }, [selectedCustomer, currentMonth, currentYear, payRefresh])

    // Reset payment form when customer changes
    const handleCustomerChange = (val) => {
        setCustomerFilter(val)
        setPayAmount('')
        setPayReference('')
        setPayNote('')
    }

    // ── Record payment ─────────────────────────────────────
    const handleRecordPayment = () => {
        const amt = parseFloat(payAmount)
        if (!amt || amt <= 0) {
            toast.current.show({ severity: 'warn', summary: 'Enter a valid amount', life: 2000 })
            return
        }
        if (amt > paymentInfo.balanceDue) {
            toast.current.show({
                severity: 'warn',
                summary: `Amount exceeds balance due ₹${paymentInfo.balanceDue}`,
                life: 2500,
            })
            return
        }
        recordPayment({
            userId: selectedCustomer.id,
            userName: selectedCustomer.name,
            centerId: paymentInfo.centerId,
            month: currentMonth,
            year: currentYear,
            amount: amt,
            method: payMethod,
            reference: payReference,
            note: payNote,
            recordedBy: currentUser?.name,
        })
        toast.current.show({
            severity: 'success',
            summary: 'Payment recorded',
            detail: `₹${amt} recorded for ${selectedCustomer.name}`,
            life: 2500,
        })
        setPayAmount('')
        setPayReference('')
        setPayNote('')
        setPayRefresh(r => r + 1)
    }

    // ── Table columns ──────────────────────────────────────
    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Customer', field: 'userName', noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        {
            header: 'Amount',
            body: row => (
                <span className={clsx(styles.amount, row.status !== 'approved' && styles.amountMuted)}>
                    {row.amount ? `₹${row.amount}` : '—'}
                </span>
            ),
        },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
    ]

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            {/* ── Filters — ONE customer dropdown ───────────── */}
            <div className={styles.filters}>
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Month'
                        value={month}
                        options={MONTHS}
                        onChange={e => setMonth(e.value)}
                    />
                </div>
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Customer'
                        value={customerFilter}
                        options={customerOptions}
                        onChange={e => handleCustomerChange(e.value)}
                    />
                </div>
            </div>

            {/* ── Status tabs ────────────────────────────────── */}
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

            {/* ── Billing totals ──────────────────────────────── */}
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

            {/* ── Info banner ─────────────────────────────────── */}
            {statusFilter !== 'all' && statusFilter !== 'approved' && (
                <div className={styles.infoBanner}>
                    <i className='pi pi-info-circle' />
                    Billing totals above always show <strong>approved entries only</strong>,
                    regardless of the status filter applied to the table.
                </div>
            )}

            {/* ── Payment section ──────────────────────────────── */}
            {/* Only shown to center/admin AND only when a specific customer is selected */}
            {(isRole(ROLES.CENTER) || isRole(ROLES.ADMIN)) && (
                <div className={styles.paymentSection}>
                    <div className={styles.paymentSectionHead}>
                        <div className={styles.paymentSectionTitle}>Payment tracking</div>
                        <div className={styles.paymentSectionSub}>
                            {selectedCustomer
                                ? `Showing payment details for ${selectedCustomer.name} — ${selectedMonth?.label}`
                                : `Select a specific customer above to view and record payments`}
                        </div>
                    </div>

                    {/* No customer selected hint */}
                    {!selectedCustomer && (
                        <div className={styles.paymentEmpty}>
                            <i className='pi pi-arrow-up' style={{ marginRight: '6px' }} />
                            Select a customer from the Customer dropdown above to view their payment details
                        </div>
                    )}

                    {/* Transaction history — button to open modal */}
                    {selectedCustomer && paymentInfo.existing?.transactions?.length > 0 && (
                        <div className={styles.txHistoryRow}>
                            <div className={styles.txHistorySummary}>
                                <span className={styles.txCount}>
                                    {paymentInfo.existing.transactions.length} transaction{paymentInfo.existing.transactions.length !== 1 ? 's' : ''} recorded
                                </span>
                                <span className={styles.txLastDate}>
                                    · Last payment: {new Date(paymentInfo.existing.paidAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <AppButton
                                label='View history'
                                icon={<i className='pi pi-history' />}
                                variant='secondary'
                                size='sm'
                                onClick={() => setShowTxModal(true)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ── Detailed log table ──────────────────────────── */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>Detailed log</span>
                    <span className={styles.tableCount}>
                        {tableData.length} entr{tableData.length === 1 ? 'y' : 'ies'}
                    </span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    emptyMessage='No entries found for selected filters.'
                    pageSize={10}
                />
            </div>

            {/* Transaction history modal */}
            {showTxModal && paymentInfo?.existing?.transactions && (
                <div className={styles.txModalOverlay} onClick={() => setShowTxModal(false)}>
                    <div className={styles.txModal} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className={styles.txModalHeader}>
                            <div>
                                <div className={styles.txModalTitle}>
                                    Transaction history — {selectedCustomer?.name}
                                </div>
                                <div className={styles.txModalSub}>
                                    {selectedMonth?.label} · {paymentInfo.existing.transactions.length} transaction{paymentInfo.existing.transactions.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div
                                className={styles.txModalClose}
                                onClick={() => setShowTxModal(false)}
                            >
                                <FaTimes size={15} color='var(--text-color-secondary)' />
                            </div>
                        </div>

                        {/* Summary row */}
                        <div className={styles.txModalSummary}>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Total due</div>
                                <div className={styles.txModalSummaryValue}>₹{paymentInfo.totalDue}</div>
                            </div>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Total paid</div>
                                <div className={clsx(styles.txModalSummaryValue, styles.green)}>
                                    ₹{paymentInfo.amountPaid}
                                </div>
                            </div>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Remaining</div>
                                <div className={clsx(
                                    styles.txModalSummaryValue,
                                    paymentInfo.balanceDue > 0 ? styles.red : styles.green
                                )}>
                                    ₹{paymentInfo.balanceDue}
                                </div>
                            </div>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Status</div>
                                <div style={{ marginTop: '6px' }}>
                                    <StatusBadge status={paymentInfo.status} />
                                </div>
                            </div>
                        </div>

                        {/* AppDataTable */}
                        <div className={styles.txModalTable}>
                            <AppDataTable
                                columns={[
                                    {
                                        header: '#',
                                        body: (row, idx) => <span className={styles.txSerial}>{idx + 1}</span>,
                                        width: '40px',
                                        align: 'center',
                                    },
                                    {
                                        header: 'Amount',
                                        body: row => (
                                            <span className={styles.txTableAmount}>₹{row.amount}</span>
                                        ),
                                    },
                                    {
                                        header: 'Method',
                                        body: row => (
                                            <span className={styles.txTableMethod}>
                                                {row.method === 'cash' && '💵 '}
                                                {row.method === 'upi' && '📱 '}
                                                {row.method === 'bank' && '🏦 '}
                                                {row.method === 'card' && '💳 '}
                                                {row.method.charAt(0).toUpperCase() + row.method.slice(1)}
                                            </span>
                                        ),
                                    },
                                    {
                                        header: 'Reference',
                                        body: row => (
                                            <span className={styles.txTableRef}>
                                                {row.reference || '—'}
                                            </span>
                                        ),
                                    },
                                    {
                                        header: 'Note',
                                        body: row => (
                                            <span className={styles.txTableNote}>
                                                {row.note || '—'}
                                            </span>
                                        ),
                                    },
                                    {
                                        header: 'Date',
                                        body: row => (
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(row.paidAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        ),
                                        noWrap: true,
                                    },
                                    {
                                        header: 'Recorded by',
                                        body: row => (
                                            <span className={styles.txTableBy}>{row.recordedBy}</span>
                                        ),
                                        noWrap: true,
                                    },
                                ]}
                                data={paymentInfo.existing.transactions}
                                emptyMessage='No transactions found.'
                                pageSize={10}
                            />
                        </div>

                        {/* Footer */}
                        <div className={styles.txModalFooter}>
                            <AppButton
                                label='Close'
                                variant='secondary'
                                onClick={() => setShowTxModal(false)}
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default ReportsPage