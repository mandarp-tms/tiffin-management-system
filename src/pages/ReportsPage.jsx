import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Toast } from 'primereact/toast'
import clsx from 'clsx'
import AppDataTable from '../components/AppDataTable'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import AppButton from '../components/AppButton'
import { getTiffinUsers } from '../services/userService'
import { getPayment, recordPayment } from '../services/paymentService'
import { getBillingReport } from '../services/reportService'
import { TYPE_LABELS, ROLES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../context/AuthContext'
import { FaRupeeSign, FaTimes } from 'react-icons/fa'
import TiffinMobileCard from '../components/TiffinMobileCard/TiffinMobileCard'
import styles from './ReportsPage.module.css'

// Build last 6 months dynamically
const buildMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

        const label = d.toLocaleString('en-IN', {
            month: 'long',
            year: 'numeric',
        })
        options.push({
            label,
            value,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
        })
    }
    return options
}

const MONTHS = buildMonthOptions()

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
    const [reportPage, setReportPage] = useState(1)
    const [reportPagination, setReportPagination] = useState(null)
    const PAGE_SIZE = 10

    const centerId = currentUser?.centerId || 1

    // ── Filter state ───────────────────────────────────────
    const [month, setMonth] = useState(MONTHS[0].value)
    const [customerFilter, setCustomerFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showTxModal, setShowTxModal] = useState(false)

    // ── Remote data ────────────────────────────────────────
    const [customers, setCustomers] = useState([])
    const [reportData, setReportData] = useState(null)
    const [paymentInfo, setPaymentInfo] = useState(null)
    const [reportLoading, setReportLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Payment form state
    const [payAmount, setPayAmount] = useState('')
    const [payMethod, setPayMethod] = useState('cash')
    const [payReference, setPayReference] = useState('')
    const [payNote, setPayNote] = useState('')

    const selectedMonth = MONTHS.find(m => m.value === month) || MONTHS[0]
    const currentMonth = selectedMonth.month
    const currentYear = selectedMonth.year

    // ── Load customers once ────────────────────────────────
    useEffect(() => {
        getTiffinUsers(centerId)
            .then(data => setCustomers(Array.isArray(data) ? data : []))
            .catch(err => console.error('Load customers error:', err))
    }, [centerId])

    // ── Load billing report on filter change ──────────────
    const fetchReport = useCallback(async () => {
        setReportLoading(true)
        try {
            const data = await getBillingReport({
                centerId,
                month,
                userId: customerFilter !== 'all' ? customerFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: reportPage,
                limit: PAGE_SIZE,
            })

            if (data?.entries && data?.pagination) {
                setReportData(data)
                setReportPagination(data.pagination)
            } else {
                setReportData(data)
                setReportPagination(null)
            }
        } catch (err) {
            console.error('Billing report error:', err)
            toast.current?.show({ severity: 'error', summary: 'Failed to load report', life: 3000 })
        } finally {
            setReportLoading(false)
        }
    }, [centerId, month, customerFilter, statusFilter, reportPage])
    useEffect(() => { fetchReport() }, [fetchReport])

    // ── Load payment info when customer selected ──────────
    const fetchPaymentInfo = useCallback(async () => {
        if (customerFilter === 'all') {
            setPaymentInfo(null)
            return
        }
        const customer = customers.find(u => u.id === customerFilter)
        if (!customer) return

        setPaymentLoading(true)
        try {
            const cid = customer.centerId || centerId
            const existing = await getPayment(customer.id, cid, currentMonth, currentYear)
            const totalDue = reportData?.customerTotals?.find(c => c.userId === customer.id)?.total || 0
            const amountPaid = parseFloat(existing?.amountPaid || 0)
            const balanceDue = Math.max(0, totalDue - amountPaid)
            const status = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

            setPaymentInfo({ totalDue, amountPaid, balanceDue, status, existing, centerId: cid })
        } catch (err) {
            console.error('Load payment error:', err)
        } finally {
            setPaymentLoading(false)
        }
    }, [customerFilter, customers, currentMonth, currentYear, reportData])

    useEffect(() => { fetchPaymentInfo() }, [fetchPaymentInfo])

    // ── Customer change ────────────────────────────────────
    const handleCustomerChange = (val) => {
        setCustomerFilter(val)
        setReportPage(1)
        setPayAmount('')
        setPayReference('')
        setPayNote('')
        setPaymentInfo(null)
    }

    // ── Derived from reportData ────────────────────────────
    const tableData = reportData?.entries || []
    const customerTotals = reportData?.customerTotals || []
    const grandTotal = reportData?.grandTotal || 0
    const statusCounts = reportData?.statusCounts || { all: 0, approved: 0, pending: 0, rejected: 0 }

    const selectedCustomer = customerFilter !== 'all'
        ? customers.find(u => u.id === customerFilter) || null
        : null

    const customerOptions = [
        { label: 'All customers', value: 'all' },
        ...customers.map(u => ({ label: u.name, value: u.id })),
    ]

    // ── Record payment ─────────────────────────────────────
    const handleRecordPayment = async () => {
        const amt = parseFloat(payAmount)
        if (!amt || amt <= 0) {
            toast.current.show({ severity: 'warn', summary: 'Enter a valid amount', life: 2000 })
            return
        }
        if (paymentInfo && amt > paymentInfo.balanceDue) {
            toast.current.show({
                severity: 'warn',
                summary: `Amount exceeds balance due ₹${paymentInfo.balanceDue}`,
                life: 2500,
            })
            return
        }
        setSubmitting(true)
        try {
            await recordPayment({
                userId: selectedCustomer.id,
                centerId: paymentInfo.centerId,
                month: currentMonth,
                year: currentYear,
                amount: amt,
                method: payMethod,
                reference: payReference,
                note: payNote,
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
            // Refresh both report and payment info
            fetchReport()
            fetchPaymentInfo()
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Payment failed',
                detail: err?.message || 'Could not record payment',
                life: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    // ── Table columns ──────────────────────────────────────
    const columns = [
        { header: 'Date', body: row => formatDate(row.date || row.entryDate), noWrap: true },
        { header: 'Customer', body: row => row.user?.name || row.userName || '—', noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.tiffinType || row.type} label={TYPE_LABELS[row.tiffinType || row.type]} /> },
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

            {/* ── Filters ────────────────────────────────────── */}
            <div className={styles.filters}>
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Month'
                        value={month}
                        options={MONTHS}
                        onChange={e => { setMonth(e.value); setReportPage(1) }}
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
                            onClick={() => { setStatusFilter(opt.value); setReportPage(1) }}
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
                                {reportLoading ? '...' : statusCounts[opt.value] ?? 0}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* ── Billing totals ──────────────────────────────── */}
            <div className={styles.totalsGrid}>
                {reportLoading
                    ? [1, 2, 3].map(i => <div key={i} style={{ height: '90px', borderRadius: '12px', background: 'var(--surface-border)', animation: 'pulse 1.2s infinite' }} />)
                    : <>
                        {customerTotals.map(u => (
                            <div key={u.userId || u.name} className={styles.totalCard}>
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
                    </>
                }
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
            {(isRole(ROLES.CENTER) || isRole(ROLES.ADMIN)) && (
                <div className={styles.paymentSection}>
                    <div className={styles.paymentSectionHead}>
                        <div className={styles.paymentSectionTitle}>Payment tracking</div>
                        <div className={styles.paymentSectionSub}>
                            {selectedCustomer
                                ? `Showing payment details for ${selectedCustomer.name} — ${selectedMonth?.label}`
                                : 'Select a specific customer above to view and record payments'}
                        </div>
                    </div>

                    {/* No customer selected */}
                    {!selectedCustomer && (
                        <div className={styles.paymentEmpty}>
                            <i className='pi pi-arrow-up' style={{ marginRight: '6px' }} />
                            Select a customer from the Customer dropdown above to view their payment details
                        </div>
                    )}

                    {/* Payment details */}
                    {selectedCustomer && (
                        <div className={styles.paymentDetails}>
                            {paymentLoading ? (
                                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                                    Loading payment details...
                                </div>
                            ) : paymentInfo && (
                                <>
                                    {/* Balance overview */}
                                    <div className={styles.balanceGrid}>
                                        <div className={styles.balanceCard}>
                                            <div className={styles.balanceLabel}>Total due</div>
                                            <div className={styles.balanceValue}>₹{paymentInfo.totalDue}</div>
                                            <div className={styles.balanceSub}>From approved tiffins</div>
                                        </div>
                                        <div className={styles.balanceCard}>
                                            <div className={styles.balanceLabel}>Amount paid</div>
                                            <div className={clsx(styles.balanceValue, styles.green)}>₹{paymentInfo.amountPaid}</div>
                                            <div className={styles.balanceSub}>
                                                {paymentInfo.existing?.transactions?.length || 0} transaction{paymentInfo.existing?.transactions?.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className={styles.balanceCard}>
                                            <div className={styles.balanceLabel}>Remaining to pay</div>
                                            <div className={clsx(styles.balanceValue, paymentInfo.balanceDue > 0 ? styles.red : styles.green)}>
                                                ₹{paymentInfo.balanceDue}
                                            </div>
                                            <div className={styles.balanceSub}>
                                                {paymentInfo.balanceDue === 0 ? 'Fully settled' : 'Outstanding'}
                                            </div>
                                        </div>
                                        <div className={styles.balanceCard}>
                                            <div className={styles.balanceLabel}>Status</div>
                                            <div style={{ marginTop: '6px' }}>
                                                <StatusBadge status={paymentInfo.status} />
                                            </div>
                                            <div className={styles.balanceSub} style={{ marginTop: '4px' }}>
                                                {paymentInfo.status === 'paid'
                                                    ? 'Fully paid'
                                                    : paymentInfo.status === 'partial'
                                                        ? `${Math.round((paymentInfo.amountPaid / paymentInfo.totalDue) * 100)}% paid`
                                                        : 'No payment yet'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    {paymentInfo.totalDue > 0 && (
                                        <div className={styles.progressWrap}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{
                                                        width: `${Math.min(100, Math.round((paymentInfo.amountPaid / paymentInfo.totalDue) * 100))}%`,
                                                        background: paymentInfo.balanceDue === 0 ? '#1D9E75' : '#BA7517',
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.progressLabel}>
                                                {Math.min(100, Math.round((paymentInfo.amountPaid / paymentInfo.totalDue) * 100))}% paid
                                                {paymentInfo.balanceDue > 0 && ` · ₹${paymentInfo.balanceDue} remaining`}
                                            </div>
                                        </div>
                                    )}

                                    {/* View history button */}
                                    {paymentInfo.existing?.transactions?.length > 0 && (
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

                                    {/* Record form */}
                                    {isRole(ROLES.CENTER) && paymentInfo.balanceDue > 0 && (
                                        <div className={styles.recordForm}>
                                            <div className={styles.recordFormTitle}>
                                                Record new payment for {selectedCustomer.name}
                                            </div>
                                            <div className={styles.recordFormGrid}>
                                                <div className={styles.recordFormGroup}>
                                                    <label className={styles.recordLabel}>Amount (max ₹{paymentInfo.balanceDue})</label>
                                                    <div className={styles.amountInput}>
                                                        <span className={styles.rupee}>₹</span>
                                                        <input
                                                            type='number'
                                                            className={styles.amountField}
                                                            placeholder={`1 – ${paymentInfo.balanceDue}`}
                                                            value={payAmount}
                                                            min={1}
                                                            max={paymentInfo.balanceDue}
                                                            onChange={e => setPayAmount(e.target.value)}
                                                        />
                                                        <button
                                                            className={styles.fullBtn}
                                                            onClick={() => setPayAmount(String(paymentInfo.balanceDue))}
                                                        >
                                                            Full ₹{paymentInfo.balanceDue}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className={styles.recordFormGroup}>
                                                    <AppDropdown
                                                        label='Payment method'
                                                        value={payMethod}
                                                        options={PAYMENT_METHODS}
                                                        onChange={e => setPayMethod(e.value)}
                                                    />
                                                </div>

                                                {(payMethod === 'upi' || payMethod === 'bank') && (
                                                    <div className={styles.recordFormGroup}>
                                                        <label className={styles.recordLabel}>Reference / Transaction ID</label>
                                                        <input
                                                            type='text'
                                                            className={styles.textInput}
                                                            placeholder='e.g. UPI123456789'
                                                            value={payReference}
                                                            onChange={e => setPayReference(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div className={styles.recordFormGroup}>
                                                    <label className={styles.recordLabel}>Note (optional)</label>
                                                    <input
                                                        type='text'
                                                        className={styles.textInput}
                                                        placeholder='e.g. Second installment'
                                                        value={payNote}
                                                        onChange={e => setPayNote(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.recordFormActions}>
                                                <AppButton
                                                    label={submitting ? 'Recording...' : `Record ₹${payAmount || '0'} payment`}
                                                    icon={<FaRupeeSign size={12} />}
                                                    variant='primary'
                                                    disabled={submitting}
                                                    onClick={handleRecordPayment}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Fully paid */}
                                    {(paymentInfo.balanceDue <= 0 && paymentInfo.status === 'paid') && (
                                        <div className={styles.paidBanner}>
                                            ✅ {selectedCustomer.name} has fully paid for {selectedMonth?.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Detailed log table ──────────────────────────── */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>Detailed log</span>
                    <span className={styles.tableCount}>
                        {reportLoading ? '...' : `${reportPagination?.total ?? tableData.length} entr${(reportPagination?.total ?? tableData.length) === 1 ? 'y' : 'ies'}`}
                    </span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    loading={reportLoading}
                    emptyMessage='No entries found for selected filters.'
                    pageSize={PAGE_SIZE}
                    serverPagination={reportPagination}
                    onPageChange={(p) => setReportPage(p)}
                    renderMobileCard={(row) => <TiffinMobileCard row={row} />}
                />
            </div>

            {/* ── Transaction history modal ────────────────────── */}
            {showTxModal && paymentInfo?.existing?.transactions && (
                <div className={styles.txModalOverlay} onClick={() => setShowTxModal(false)}>
                    <div className={styles.txModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.txModalHeader}>
                            <div>
                                <div className={styles.txModalTitle}>
                                    Transaction history — {selectedCustomer?.name}
                                </div>
                                <div className={styles.txModalSub}>
                                    {selectedMonth?.label} · {paymentInfo.existing.transactions.length} transaction{paymentInfo.existing.transactions.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className={styles.txModalClose} onClick={() => setShowTxModal(false)}>
                                <FaTimes size={15} color='var(--text-color-secondary)' />
                            </div>
                        </div>

                        <div className={styles.txModalSummary}>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Total due</div>
                                <div className={styles.txModalSummaryValue}>₹{paymentInfo.totalDue}</div>
                            </div>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Total paid</div>
                                <div className={clsx(styles.txModalSummaryValue, styles.green)}>₹{paymentInfo.amountPaid}</div>
                            </div>
                            <div className={styles.txModalSummaryCard}>
                                <div className={styles.txModalSummaryLabel}>Remaining</div>
                                <div className={clsx(styles.txModalSummaryValue, paymentInfo.balanceDue > 0 ? styles.red : styles.green)}>
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

                        <div className={styles.txModalTable}>
                            <AppDataTable
                                columns={[
                                    { header: '#', body: (row, idx) => <span className={styles.txSerial}>{idx + 1}</span>, width: '40px', align: 'center' },
                                    { header: 'Amount', body: row => <span className={styles.txTableAmount}>₹{row.amount}</span> },
                                    { header: 'Method', body: row => <span className={styles.txTableMethod}>{row.method?.charAt(0).toUpperCase() + row.method?.slice(1)}</span> },
                                    { header: 'Reference', body: row => <span className={styles.txTableRef}>{row.reference || '—'}</span> },
                                    { header: 'Note', body: row => <span className={styles.txTableNote}>{row.note || '—'}</span> },
                                    { header: 'Date', body: row => <span style={{ whiteSpace: 'nowrap' }}>{new Date(row.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>, noWrap: true },
                                    { header: 'Recorded by', body: row => <span className={styles.txTableBy}>{row.recordedByName || row.recordedBy || '—'}</span>, noWrap: true },
                                ]}
                                data={paymentInfo.existing.transactions}
                                emptyMessage='No transactions found.'
                                pageSize={10}
                            />
                        </div>

                        <div className={styles.txModalFooter}>
                            <AppButton label='Close' variant='secondary' onClick={() => setShowTxModal(false)} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ReportsPage