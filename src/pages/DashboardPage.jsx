import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { getDashboard } from '../services/reportService'
import { getAllTiffins } from '../services/tiffinService'
import { TYPE_LABELS, ROLES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './DashboardPage.module.css'

const getCurrentMonthLabel = () =>
    new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const getCurrentMonthParam = () =>
    new Date().toISOString().slice(0, 7)   // "2026-06"

const DashboardPage = () => {
    const { currentUser, isRole } = useAuth()

    // Dashboard stats from API
    const [dashData, setDashData] = useState(null)
    const [dashLoading, setDashLoading] = useState(true)

    // Recent entries from API
    const [entries, setEntries] = useState([])
    const [entriesLoading, setEntriesLoading] = useState(true)

    const monthLabel = getCurrentMonthLabel()
    const monthParam = getCurrentMonthParam()

    // Fetch dashboard stats
    useEffect(() => {
        if (!currentUser) return
        setDashLoading(true)
        getDashboard(monthParam)
            .then(data => setDashData(data))
            .catch(err => console.error('Dashboard fetch error:', err))
            .finally(() => setDashLoading(false))
    }, [currentUser, monthParam])

    // Fetch recent entries — scoped by role
    useEffect(() => {
        if (!currentUser) return
        setEntriesLoading(true)

        const filters = {
            page: 1,
            limit: 6,
            ...(isRole(ROLES.USER) && { userId: currentUser.id }),
            ...(isRole(ROLES.CENTER) && { centerId: currentUser.centerId }),
        }

        getAllTiffins(filters)
            .then(data => setEntries(Array.isArray(data) ? data : []))
            .catch(err => console.error('Entries fetch error:', err))
            .finally(() => setEntriesLoading(false))
    }, [currentUser])

    // Build stat cards from API response
    const stats = !dashData ? [] : isRole(ROLES.ADMIN)
        ? [
            { title: `Total tiffins (${monthLabel})`, value: dashData.totalTiffins, subtitle: 'Approved entries', icon: 'pi pi-shopping-bag', color: '#1D9E75' },
            { title: 'Pending approvals', value: dashData.pendingApprovals, subtitle: 'Awaiting review', icon: 'pi pi-clock', color: '#BA7517' },
            { title: 'Total billing', value: `₹${dashData.totalBilling}`, subtitle: monthLabel, icon: 'pi pi-indian-rupee', color: '#534AB7' },
            { title: 'Active customers', value: dashData.activeCustomers, subtitle: 'Registered users', icon: 'pi pi-users', color: '#185FA5' },
        ]
        : isRole(ROLES.CENTER)
            ? [
                { title: 'Pending approvals', value: dashData.pendingApprovals, subtitle: 'Needs action', icon: 'pi pi-clock', color: '#BA7517' },
                { title: 'Month total', value: `₹${dashData.monthTotal}`, subtitle: monthLabel, icon: 'pi pi-indian-rupee', color: '#534AB7' },
                { title: 'Customers served', value: dashData.customersServed, subtitle: 'Active customers', icon: 'pi pi-users', color: '#185FA5' },
            ]
            : [
                { title: `My tiffins (${monthLabel})`, value: dashData.myTiffins, subtitle: 'Approved entries', icon: 'pi pi-shopping-bag', color: '#1D9E75' },
                { title: 'Amount this month', value: `₹${dashData.myAmount}`, subtitle: monthLabel, icon: 'pi pi-indian-rupee', color: '#534AB7' },
                { title: 'Pending approval', value: dashData.myPending, subtitle: 'By tiffin center', icon: 'pi pi-clock', color: '#BA7517' },
            ]

    return (
        <div className={styles.page}>

            {/* Stat cards */}
            <div className={styles.statsGrid}>
                {dashLoading
                    ? [1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.skeletonCard} />
                    ))
                    : stats.map((s, i) => (
                        <StatCard key={i} title={s.title} value={s.value}
                            subtitle={s.subtitle} icon={s.icon} color={s.color} />
                    ))
                }
            </div>

            {/* Tiffin center card — customers only */}
            {isRole(ROLES.USER) && dashData?.myCenter && (
                <div className={styles.centerCard}>
                    <div className={styles.centerAvatar}>
                        {dashData.myCenter.avatar}
                    </div>
                    <div className={styles.centerInfo}>
                        <div className={styles.centerLabel}>Your tiffin center</div>
                        <div className={styles.centerName}>{dashData.myCenter.name}</div>
                        <div className={styles.centerSub}>
                            {dashData.myCenter.address} · {dashData.myCenter.phone}
                        </div>
                    </div>
                    <StatusBadge status='active' style={{ flexShrink: 0 }} />
                </div>
            )}

            {/* Recent entries table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>Recent entries</div>
                <div className={styles.tableWrap}>
                    {entriesLoading
                        ? (
                            <div className={styles.loadingRow}>Loading entries...</div>
                        )
                        : entries.length === 0
                            ? (
                                <div className={styles.emptyRow}>No entries yet this month</div>
                            )
                            : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            {['Date', 'Customer', 'Type', 'Chapati', 'Amount', 'Status'].map(h => (
                                                <th key={h} className={styles.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(t => (
                                            <tr key={t.id} className={styles.tr}>
                                                <td className={`${styles.td} ${styles.tdNoWrap}`}>
                                                    {formatDate(t.entryDate)}
                                                </td>
                                                <td className={`${styles.td} ${styles.tdNoWrap}`}>
                                                    {t.user?.name || t.userName || '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    <StatusBadge status={t.tiffinType} label={TYPE_LABELS[t.tiffinType]} />
                                                </td>
                                                <td className={`${styles.td} ${styles.tdCenter}`}>
                                                    {t.chapatiCount || '—'}
                                                </td>
                                                <td className={`${styles.td} ${styles.tdAmount}`}>
                                                    {t.amount ? `₹${t.amount}` : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    <StatusBadge status={t.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                    }
                </div>
            </div>

        </div>
    )
}

export default DashboardPage