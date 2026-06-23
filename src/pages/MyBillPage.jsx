import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getMyTiffins } from '../services/tiffinService'
import { getPayment } from '../services/paymentService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './MyBillPage.module.css'

const now = new Date()
const CURRENT_MONTH = now.getMonth() + 1
const CURRENT_YEAR = now.getFullYear()
const MONTH_LABEL = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const MyBillPage = () => {
    const { currentUser } = useAuth()
    const centerId = currentUser?.centerId || 1

    // Tiffin entries
    const [tiffins, setTiffins] = useState([])
    const [tiffinsLoading, setTiffinsLoading] = useState(true)

    // Payment info
    const [payment, setPayment] = useState(null)
    const [paymentLoading, setPaymentLoading] = useState(true)

    // Load tiffin entries
    useEffect(() => {
        if (!currentUser) return
        setTiffinsLoading(true)
        getMyTiffins(currentUser.id)
            .then(data => setTiffins(Array.isArray(data) ? data : []))
            .catch(err => console.error('Load tiffins error:', err))
            .finally(() => setTiffinsLoading(false))
    }, [currentUser])

    // Load payment info
    useEffect(() => {
        if (!currentUser) return
        setPaymentLoading(true)
        getPayment(currentUser.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
            .then(data => setPayment(data))
            .catch(err => console.error('Load payment error:', err))
            .finally(() => setPaymentLoading(false))
    }, [currentUser])

    // Derived from tiffins
    const approved = tiffins.filter(t => t.status === 'approved' && !t.isNoTiffin)
    const pending = tiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((s, t) => s + parseFloat(t.amount || 0), 0)

    // Derived from payment
    const totalDue = parseFloat(payment?.totalDue || 0)
    const amountPaid = parseFloat(payment?.amountPaid || 0)
    const balanceDue = Math.max(0, totalDue - amountPaid)
    const payStatus = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

    const summaryCards = [
        { label: 'Amount due', value: `₹${total}`, sub: MONTH_LABEL, color: '#0F6E56' },
        { label: 'Tiffins taken', value: approved.length, sub: 'Approved entries', color: 'var(--text-color)' },
        { label: 'Pending approval', value: pending.length, sub: 'By tiffin center', color: '#BA7517' },
    ]

    const columns = [
        { header: 'Date', body: row => formatDate(row.entryDate), noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.tiffinType} label={TYPE_LABELS[row.tiffinType]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span className={styles.amount}>{row.amount ? `₹${row.amount}` : '—'}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
        { header: 'Note', field: 'note' },
    ]

    return (
        <div className={styles.page}>

            {/* Summary cards */}
            <div className={styles.statsGrid}>
                {summaryCards.map(card => (
                    <div key={card.label} className={styles.statCard}>
                        <div className={styles.statLabel}>{card.label}</div>
                        <div className={styles.statValue} style={{ color: card.color }}>
                            {tiffinsLoading ? '...' : card.value}
                        </div>
                        <div className={styles.statSub}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Payment status card */}
            <div className={styles.tableCard} style={{ padding: '1rem 1.25rem' }}>
                {paymentLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-color-secondary)', fontSize: '13px', padding: '0.5rem' }}>
                        Loading payment info...
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                    {MONTH_LABEL} payment status
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Total: ₹{totalDue}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F6E56' }}>Paid: ₹{amountPaid}</span>
                                    {balanceDue > 0 && (
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#A32D2D' }}>Balance: ₹{balanceDue}</span>
                                    )}
                                </div>
                                {payment?.transactions?.length > 0 && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '6px' }}>
                                        {payment.transactions.length} payment{payment.transactions.length > 1 ? 's' : ''} recorded
                                        · Last: {new Date(payment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </div>
                                )}
                            </div>
                            <StatusBadge status={payStatus} />
                        </div>

                        {/* Transaction list */}
                        {payment?.transactions?.length > 0 && (
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                    Transaction history
                                </div>
                                {payment.transactions.map(tx => (
                                    <div key={tx.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'var(--surface-ground)', borderRadius: '8px', padding: '0.625rem 0.875rem',
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 700, color: '#0F6E56', fontSize: '14px' }}>₹{tx.amount}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginLeft: '8px', textTransform: 'uppercase' }}>
                                                {tx.method}{tx.reference ? ` · ${tx.reference}` : ''}
                                            </span>
                                            {tx.note && (
                                                <span style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginLeft: '6px' }}>
                                                    · {tx.note}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', textAlign: 'right' }}>
                                            {new Date(tx.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Tiffin log table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>My tiffin log — {MONTH_LABEL}</span>
                    <StatusBadge status='approved' label={`Total ₹${total}`} />
                </div>
                <AppDataTable
                    columns={columns}
                    data={tiffins}
                    loading={tiffinsLoading}
                    emptyMessage='No tiffin entries yet.'
                    pageSize={10}
                />
            </div>

        </div>
    )
}

export default MyBillPage