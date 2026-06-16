import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTiffinUsers } from '../services/userService'
import { getAllTiffins } from '../services/tiffinService'
import { getPayment, calculateTotalDue } from '../services/paymentService'
import { TYPE_LABELS, ROLES } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import AppButton from '../components/AppButton'
import PaymentModal from './PaymentModal'
import { FaRupeeSign } from 'react-icons/fa'
import styles from './UsersPage.module.css'

const CURRENT_MONTH = 6
const CURRENT_YEAR = 2025

const UsersPage = () => {
    const { isRole } = useAuth()
    const customers = getTiffinUsers()
    const [paymentModal, setPaymentModal] = useState(null)

    const customerStats = useMemo(() => {
        const tiffins = getAllTiffins()
        return customers.map(u => {
            const mine = tiffins.filter(t => t.userId === u.id)
            const approved = mine.filter(t => t.status === 'approved' && t.type !== 'none')
            const pending = mine.filter(t => t.status === 'pending')
            const total = approved.reduce((s, t) => s + t.amount, 0)
            const typeCounts = approved.reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1
                return acc
            }, {})
            const favouriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

            // payment info
            const payment = getPayment(u.id, u.centerId, CURRENT_MONTH, CURRENT_YEAR)
            const totalDue = calculateTotalDue(u.id, u.centerId, CURRENT_MONTH, CURRENT_YEAR)
            const amountPaid = payment?.amountPaid || 0
            const balanceDue = Math.max(0, totalDue - amountPaid)
            const payStatus = !payment || amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

            return {
                ...u,
                approved: approved.length,
                pending: pending.length,
                total,
                favouriteType,
                totalDue,
                amountPaid,
                balanceDue,
                payStatus,
            }
        })
    }, [paymentModal]) // re-compute when modal closes after payment

    const statCells = (u) => [
        { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
        { label: 'Tiffins taken', value: u.approved, color: 'var(--text-color)' },
        { label: 'Pending', value: u.pending, color: '#BA7517' },
        { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
    ]

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.title}>Customers</div>
                <div className={styles.sub}>{customers.length} active customers this month</div>
            </div>

            <div className={styles.grid}>
                {customerStats.map(u => (
                    <div key={u.id} className={styles.card}>

                        {/* Card header */}
                        <div className={styles.cardHead}>
                            <div className={styles.avatar}>{u.avatar}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className={styles.name}>{u.name}</div>
                                <div className={styles.username}>@{u.username}</div>
                            </div>
                            <StatusBadge status='active' />
                        </div>

                        {/* Tiffin stats */}
                        <div className={styles.statsGrid}>
                            {statCells(u).map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className={`
                    ${styles.statCell}
                    ${i % 2 === 0 ? styles.borderRight : ''}
                    ${i < 2 ? styles.borderBottom : ''}
                  `}
                                >
                                    <div className={styles.statCellLabel}>{stat.label}</div>
                                    <div className={styles.statCellValue} style={{ color: stat.color }}>
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment section */}
                        <div className={styles.paymentSection}>
                            <div className={styles.paymentRow}>
                                <div>
                                    <div className={styles.paymentLabel}>June 2025 payment</div>
                                    <div className={styles.paymentAmounts}>
                                        <span className={styles.paidAmt}>₹{u.amountPaid} paid</span>
                                        {u.balanceDue > 0 && (
                                            <span className={styles.balanceAmt}>· ₹{u.balanceDue} due</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.paymentRight}>
                                    <StatusBadge status={u.payStatus} />
                                    {isRole(ROLES.CENTER) && (
                                        <AppButton
                                            label='Record'
                                            icon={<FaRupeeSign size={11} />}
                                            variant={u.payStatus === 'paid' ? 'secondary' : 'primary'}
                                            size='sm'
                                            onClick={() => setPaymentModal(u)}
                                            style={{ marginTop: '6px' }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Payment modal */}
            {paymentModal && (
                <PaymentModal
                    customer={paymentModal}
                    centerId={paymentModal.centerId || 1}
                    onClose={() => setPaymentModal(null)}
                    onSuccess={() => setPaymentModal(null)}
                />
            )}

        </div>
    )
}

export default UsersPage