import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AppInput from '../components/AppInput'
import { getPayment } from '../services/paymentService'
import { FaCheckCircle } from 'react-icons/fa'
import styles from './MyBillPage.module.css'

const MyBillPage = () => {
    const { currentUser } = useAuth()
    const centerId = currentUser?.centerId || 1

    const today = new Date()
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    
    const [monthValue, setMonthValue] = useState(currentMonthStr)
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser || !monthValue) return
        const [year, month] = monthValue.split('-')
        
        setLoading(true)
        getPayment(currentUser.id, centerId, parseInt(month), parseInt(year))
            .then(data => setPayment(data))
            .catch(err => console.error('Load payment error:', err))
            .finally(() => setLoading(false))
    }, [currentUser, monthValue, centerId])

    const totalDue = parseFloat(payment?.totalDue || 0)
    const amountPaid = parseFloat(payment?.amountPaid || 0)
    const balanceDue = Math.max(0, totalDue - amountPaid)
    const isSettled = balanceDue <= 0 && totalDue > 0

    const transactions = payment?.transactions || []

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.title}>My Bill</div>
                <div style={{ width: '160px' }}>
                    <AppInput
                        type='month'
                        value={monthValue}
                        onChange={e => setMonthValue(e.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-color-secondary)' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <div style={{ marginTop: '1rem' }}>Loading billing details...</div>
                </div>
            ) : (
                <>
                    {/* Hero Balance Card */}
                    <div className={`${styles.balanceCard} ${isSettled ? styles.settled : ''}`}>
                        <div className={styles.balanceLabel}>
                            {isSettled ? 'All Settled Up' : 'Pending Balance'}
                        </div>
                        <div className={styles.balanceValue}>
                            ₹{isSettled ? '0' : balanceDue}
                        </div>
                        {isSettled && (
                            <FaCheckCircle size={24} style={{ marginTop: '12px', opacity: 0.9 }} />
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Billed</div>
                            <div className={styles.statValue}>₹{totalDue}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Paid</div>
                            <div className={`${styles.statValue} ${styles.green}`}>₹{amountPaid}</div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className={styles.txSection}>
                        <div className={styles.txHeader}>Transaction History</div>
                        
                        {transactions.length === 0 ? (
                            <div className={styles.emptyState}>
                                No transactions recorded for this month.
                            </div>
                        ) : (
                            <div className={styles.txList}>
                                {transactions.map(tx => (
                                    <div key={tx.id} className={styles.txCard}>
                                        <div className={styles.txLeft}>
                                            <div className={styles.txAmount}>₹{tx.amount}</div>
                                            <div className={styles.txMethod}>
                                                {tx.method} {tx.reference && `· ${tx.reference}`}
                                                {tx.note && <span style={{ textTransform: 'none', fontWeight: 500 }}> ({tx.note})</span>}
                                            </div>
                                        </div>
                                        <div className={styles.txRight}>
                                            <div className={styles.txDate}>
                                                {new Date(tx.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div className={styles.txTime}>
                                                {new Date(tx.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default MyBillPage