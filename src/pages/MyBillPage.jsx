import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getMyTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './MyBillPage.module.css'
import { getPayment, calculateTotalDue } from '../services/paymentService'

const MyBillPage = () => {
    const { currentUser } = useAuth()

    const myTiffins = useMemo(() => getMyTiffins(currentUser?.id), [currentUser])
    const approved = myTiffins.filter(t => t.status === 'approved' && t.type !== 'none')
    const pending = myTiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((s, t) => s + t.amount, 0)
    const CURRENT_MONTH = 6
    const CURRENT_YEAR = 2025
    const centerId = currentUser?.centerId || 1
    const payment = getPayment(currentUser?.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
    const totalDue = calculateTotalDue(currentUser?.id, centerId, CURRENT_MONTH, CURRENT_YEAR)
    const amountPaid = payment?.amountPaid || 0
    const balanceDue = Math.max(0, totalDue - amountPaid)
    const payStatus = !payment || amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span className={styles.amount}>{row.amount ? `₹${row.amount}` : '—'}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
        { header: 'Note', field: 'note' },
    ]

    const summaryCards = [
        { label: 'Amount due', value: `₹${total}`, sub: 'June 2025', color: '#0F6E56' },
        { label: 'Tiffins taken', value: approved.length, sub: 'Approved entries', color: 'var(--text-color)' },
        { label: 'Pending approval', value: pending.length, sub: 'By tiffin center', color: '#BA7517' },
    ]

    return (
        <div className={styles.page}>

            {/* Summary cards */}
            <div className={styles.statsGrid}>
                {summaryCards.map(card => (
                    <div key={card.label} className={styles.statCard}>
                        <div className={styles.statLabel}>{card.label}</div>
                        <div className={styles.statValue} style={{ color: card.color }}>{card.value}</div>
                        <div className={styles.statSub}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Payment status card */}
            <div className={styles.tableCard} style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                            June 2025 payment status
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
                                    {tx.note && <span style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginLeft: '6px' }}>· {tx.note}</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', textAlign: 'right' }}>
                                    {new Date(tx.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tiffin log table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>My tiffin log — June 2025</span>
                    <StatusBadge status='approved' label={`Total ₹${total}`} />
                </div>
                <AppDataTable
                    columns={columns}
                    data={myTiffins}
                    emptyMessage='No tiffin entries yet.'
                    pageSize={10}
                />
            </div>

        </div>
    )
}

export default MyBillPage