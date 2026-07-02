import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../services/userService'
import { getTiffinUsers } from '../services/userService'
import { getPayment } from '../services/paymentService'
import { TYPE_LABELS, ROLES } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import AppButton from '../components/AppButton'
import PaymentModal from './PaymentModal'
import { FaRupeeSign } from 'react-icons/fa'
import styles from './UsersPage.module.css'

const now = new Date()
const CURRENT_MONTH = now.getMonth() + 1
const CURRENT_YEAR = now.getFullYear()
const MONTH_LABEL = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

// const UsersPage = () => {
//     const { currentUser, isRole } = useAuth()
//     const centerId = currentUser?.centerId || 1

//     const [customers, setCustomers] = useState([])
//     const [customerStats, setCustomerStats] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [paymentModal, setPaymentModal] = useState(null)

//     // Load customers list
//     useEffect(() => {
//         getTiffinUsers(centerId)
//             .then(data => setCustomers(Array.isArray(data) ? data : []))
//             .catch(err => console.error('Load customers error:', err))
//     }, [centerId])

//     // Load stats for each customer
//     const fetchStats = useCallback(async () => {
//         if (customers.length === 0) return
//         setLoading(true)
//         try {
//             const statsPromises = customers.map(async (u) => {
//                 const [stats, payment] = await Promise.all([
//                     getUserStats(u.id, CURRENT_MONTH, CURRENT_YEAR),
//                     getPayment(u.id, u.centerId || centerId, CURRENT_MONTH, CURRENT_YEAR),
//                 ])
//                 const totalDue = parseFloat(stats?.payment?.totalDue || 0)
//                 const amountPaid = parseFloat(stats?.payment?.amountPaid || payment?.amountPaid || 0)
//                 const balanceDue = Math.max(0, totalDue - amountPaid)
//                 const payStatus = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

//                 return {
//                     ...u,
//                     approved: stats?.approvedCount || 0,
//                     pending: stats?.pendingCount || 0,
//                     total: stats?.totalAmount || 0,
//                     favouriteType: stats?.favouriteType || null,
//                     totalDue,
//                     amountPaid,
//                     balanceDue,
//                     payStatus,
//                 }
//             })
//             const results = await Promise.all(statsPromises)
//             setCustomerStats(results)
//         } catch (err) {
//             console.error('Load stats error:', err)
//         } finally {
//             setLoading(false)
//         }
//     }, [customers, centerId])

//     useEffect(() => { fetchStats() }, [fetchStats])

//     const statCells = (u) => [
//         { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
//         { label: 'Tiffins taken', value: u.approved, color: 'var(--text-color)' },
//         { label: 'Pending', value: u.pending, color: '#BA7517' },
//         { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
//     ]

//     return (
//         <div className={styles.page}>

//             <div className={styles.header}>
//                 <div className={styles.title}>Customers</div>
//                 <div className={styles.sub}>
//                     {loading ? '...' : `${customerStats.length} active customers this month`}
//                 </div>
//             </div>

//             {loading ? (
//                 <div style={{
//                     padding: '2rem', textAlign: 'center',
//                     color: 'var(--text-color-secondary)', fontSize: '13px',
//                 }}>
//                     <i className='pi pi-spin pi-spinner' style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }} />
//                     Loading customers...
//                 </div>
//             ) : (
//                 <div className={styles.grid}>
//                     {customerStats.map(u => (
//                         <div key={u.id} className={styles.card}>

//                             {/* Card header */}
//                             <div className={styles.cardHead}>
//                                 <div className={styles.avatar}>{u.avatar}</div>
//                                 <div style={{ flex: 1, minWidth: 0 }}>
//                                     <div className={styles.name}>{u.name}</div>
//                                     <div className={styles.username}>@{u.username}</div>
//                                 </div>
//                                 <StatusBadge status='active' />
//                             </div>

//                             {/* Tiffin stats */}
//                             <div className={styles.statsGrid}>
//                                 {statCells(u).map((stat, i) => (
//                                     <div
//                                         key={stat.label}
//                                         className={`
//                       ${styles.statCell}
//                       ${i % 2 === 0 ? styles.borderRight : ''}
//                       ${i < 2 ? styles.borderBottom : ''}
//                     `}
//                                     >
//                                         <div className={styles.statCellLabel}>{stat.label}</div>
//                                         <div className={styles.statCellValue} style={{ color: stat.color }}>
//                                             {stat.value}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* Payment section */}
//                             <div className={styles.paymentSection}>
//                                 <div className={styles.paymentRow}>
//                                     <div>
//                                         <div className={styles.paymentLabel}>{MONTH_LABEL} payment</div>
//                                         <div className={styles.paymentAmounts}>
//                                             <span className={styles.paidAmt}>₹{u.amountPaid} paid</span>
//                                             {u.balanceDue > 0 && (
//                                                 <span className={styles.balanceAmt}>· ₹{u.balanceDue} due</span>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <div className={styles.paymentRight}>
//                                         <StatusBadge status={u.payStatus} />
//                                         {isRole(ROLES.CENTER) && (
//                                             <AppButton
//                                                 label='Record'
//                                                 icon={<FaRupeeSign size={11} />}
//                                                 variant={u.payStatus === 'paid' ? 'secondary' : 'primary'}
//                                                 size='sm'
//                                                 onClick={() => setPaymentModal(u)}
//                                                 style={{ marginTop: '6px' }}
//                                             />
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Payment modal */}
//             {paymentModal && (
//                 <PaymentModal
//                     customer={paymentModal}
//                     centerId={paymentModal.centerId || centerId}
//                     onClose={() => setPaymentModal(null)}
//                     onSuccess={() => {
//                         setPaymentModal(null)
//                         fetchStats()   // ← refresh stats after payment recorded
//                     }}
//                 />
//             )}

//         </div>
//     )
// }
const UsersPage = () => {
    return (
        <h2>Comming soon !!</h2>
    )
}
export default UsersPage