import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../services/userService'
import { getTiffinUsers } from '../services/userService'
import { getPayment } from '../services/paymentService'
import { ROLES } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import AppButton from '../components/AppButton'
import PaymentModal from './PaymentModal'
import { FaPlus, FaRupeeSign } from 'react-icons/fa'
import styles from './UsersPage.module.css'
import { useNavigate } from 'react-router-dom'

const now = new Date()
const CURRENT_MONTH = now.getMonth() + 1
const CURRENT_YEAR = now.getFullYear()
const MONTH_LABEL = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const UsersPage = () => {
    const navigate = useNavigate()
    const { currentUser, isRole } = useAuth()
    const centerId = currentUser?.centerId || 1
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [paymentModal, setPaymentModal] = useState(null)

    const fetchCustomers = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getTiffinUsers(centerId)
            setCustomers(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Load customers error:', err)
        } finally {
            setLoading(false)
        }
    }, [centerId])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    const statCells = (u) => [
        { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
        { label: 'Tiffins taken', value: u.approved, color: 'var(--text-color)' },
        { label: 'Pending', value: u.pending, color: '#BA7517' },
        { label: 'Favourite', value: u.favouriteType ? String(u.favouriteType).charAt(0).toUpperCase() + String(u.favouriteType).slice(1) : '—', color: '#534AB7' },
    ]

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.sub}>
                    {loading ? '...' : `${customers.length} active customers`}
                </div>
                {isRole(ROLES.CENTER) && (
                    <AppButton
                        label='Add customer'
                        icon={<FaPlus size={12} />}
                        variant='primary'
                        size='sm'
                        onClick={() => navigate('/module/customer/add')}
                    />
                )}
            </div>

            {loading ? (
                <div style={{
                    padding: '2rem', textAlign: 'center',
                    color: 'var(--text-color-secondary)', fontSize: '13px',
                }}>
                    <i className='pi pi-spin pi-spinner' style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }} />
                    Loading customers...
                </div>
            ) : (
                <div className={styles.grid}>
                    {customers.map(u => (
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
                                        <div className={styles.paymentLabel}>Overall payment</div>
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
            )}

            {/* Payment modal */}
            {paymentModal && (
                <PaymentModal
                    customer={paymentModal}
                    centerId={paymentModal.centerId || centerId}
                    onClose={() => setPaymentModal(null)}
                    onSuccess={() => {
                        setPaymentModal(null)
                        fetchCustomers()   // ← refresh stats after payment recorded
                    }}
                />
            )}

        </div>
    )
}

export default UsersPage