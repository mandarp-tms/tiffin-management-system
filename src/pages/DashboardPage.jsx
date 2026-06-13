import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { tiffins } from '../mock/tiffins'
import { ROLES, TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { getCenterById } from '../services/tiffinCenterService'
import styles from './DashboardPage.module.css'

const DashboardPage = () => {
    const { currentUser, isRole } = useAuth()

    const myTiffins = useMemo(() => tiffins.filter(t => t.userId === currentUser?.id), [currentUser])
    const allApproved = useMemo(() => tiffins.filter(t => t.status === 'approved' && t.type !== 'none'), [])
    const pending = useMemo(() => tiffins.filter(t => t.status === 'pending'), [])
    const totalAmount = useMemo(() => allApproved.reduce((sum, t) => sum + t.amount, 0), [allApproved])
    const myAmount = useMemo(() => myTiffins.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0), [myTiffins])
    const recentEntries = useMemo(() => [...tiffins].reverse().slice(0, 6), [])
    const myCenter = isRole(ROLES.USER) ? getCenterById(currentUser?.centerId) : null

    const stats = isRole(ROLES.ADMIN)
        ? [
            { title: 'Total tiffins (June)', value: allApproved.length, subtitle: 'Approved entries', icon: 'pi pi-shopping-bag', color: '#1D9E75' },
            { title: 'Pending approvals', value: pending.length, subtitle: 'Awaiting review', icon: 'pi pi-clock', color: '#BA7517' },
            { title: 'Total billing', value: `₹${totalAmount}`, subtitle: 'June 2025', icon: 'pi pi-indian-rupee', color: '#534AB7' },
            { title: 'Active customers', value: 2, subtitle: 'Rahul, Priya', icon: 'pi pi-users', color: '#185FA5' },
        ]
        : isRole(ROLES.CENTER)
            ? [
                { title: "Today's tiffins", value: 2, subtitle: '10 Jun 2025', icon: 'pi pi-shopping-bag', color: '#1D9E75' },
                { title: 'Pending approvals', value: pending.length, subtitle: 'Needs action', icon: 'pi pi-clock', color: '#BA7517' },
                { title: 'Month total', value: `₹${totalAmount}`, subtitle: 'June 2025', icon: 'pi pi-indian-rupee', color: '#534AB7' },
                { title: 'Customers served', value: 2, subtitle: 'Active customers', icon: 'pi pi-users', color: '#185FA5' },
            ]
            : [
                { title: 'My tiffins (June)', value: myTiffins.filter(t => t.status === 'approved').length, subtitle: 'Approved entries', icon: 'pi pi-shopping-bag', color: '#1D9E75' },
                { title: 'Amount this month', value: `₹${myAmount}`, subtitle: 'June 2025', icon: 'pi pi-indian-rupee', color: '#534AB7' },
                { title: 'Pending approval', value: myTiffins.filter(t => t.status === 'pending').length, subtitle: 'By tiffin center', icon: 'pi pi-clock', color: '#BA7517' },
            ]

    return (
        <div className={styles.page}>

            {/* Stat cards */}
            <div className={styles.statsGrid}>
                {stats.map((s, i) => (
                    <StatCard key={i} title={s.title} value={s.value} subtitle={s.subtitle} icon={s.icon} color={s.color} />
                ))}
            </div>

            {/* Tiffin center card — customers only */}
            {isRole(ROLES.USER) && myCenter && (
                <div className={styles.centerCard}>
                    <div className={styles.centerAvatar}>{myCenter.avatar}</div>
                    <div className={styles.centerInfo}>
                        <div className={styles.centerLabel}>Your tiffin center</div>
                        <div className={styles.centerName}>{myCenter.name}</div>
                        <div className={styles.centerSub}>{myCenter.address} · {myCenter.phone}</div>
                    </div>
                    <StatusBadge status='active' style={{ flexShrink: 0 }} />
                </div>
            )}

            {/* Recent entries */}
            <div className={styles.tableCard}>
                <div className={styles.tableHead}>Recent entries</div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['Date', 'Customer', 'Type', 'Chapati', 'Amount', 'Status'].map(h => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentEntries.map(t => (
                                <tr key={t.id} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.tdNoWrap}`}>{formatDate(t.date)}</td>
                                    <td className={`${styles.td} ${styles.tdNoWrap}`}>{t.userName}</td>
                                    <td className={styles.td}><StatusBadge status={t.type} label={TYPE_LABELS[t.type]} /></td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>{t.chapatiCount || '—'}</td>
                                    <td className={`${styles.td} ${styles.tdAmount}`}>{t.amount ? `₹${t.amount}` : '—'}</td>
                                    <td className={styles.td}><StatusBadge status={t.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default DashboardPage