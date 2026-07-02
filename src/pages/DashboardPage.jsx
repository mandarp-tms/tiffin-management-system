import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { getDashboard, getCustomerHistory, getCenterTypeBreakdown } from '../services/reportService'
import { ROLES } from '../utils/constants'
import CustomerHistoryChart from '../components/CustomerHistoryChart'
import CenterTypeBreakdownChart from '../components/CenterTypeBreakdownChart'
import styles from './DashboardPage.module.css'

const getCurrentMonthLabel = () =>
    new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

const getCurrentMonthParam = () =>
    new Date().toISOString().slice(0, 7)

const DashboardPage = () => {
    const { currentUser, isRole } = useAuth()

    const [dashData, setDashData] = useState(null)
    const [dashLoading, setDashLoading] = useState(true)

    // Customer chart data
    const [historyData, setHistoryData] = useState(null)
    const [historyLoading, setHistoryLoading] = useState(true)

    // Center/Admin chart data
    const [breakdownData, setBreakdownData] = useState(null)
    const [breakdownLoading, setBreakdownLoading] = useState(true)

    const monthLabel = getCurrentMonthLabel()
    const monthParam = getCurrentMonthParam()

    useEffect(() => {
        if (!currentUser) return
        setDashLoading(true)
        getDashboard(monthParam)
            .then(data => setDashData(data))
            .catch(err => console.error('Dashboard fetch error:', err))
            .finally(() => setDashLoading(false))
    }, [currentUser, monthParam])

    // Load customer history chart — customer role only
    useEffect(() => {
        if (!currentUser || !isRole(ROLES.USER)) return
        setHistoryLoading(true)
        getCustomerHistory(6)
            .then(data => setHistoryData(data))
            .catch(err => console.error('History fetch error:', err))
            .finally(() => setHistoryLoading(false))
    }, [currentUser])

    // Load type breakdown chart — center and admin only
    useEffect(() => {
        if (!currentUser) return
        if (isRole(ROLES.USER)) return

        const centerId = isRole(ROLES.CENTER)
            ? currentUser.id        // CENTER user's own id is the centerId
            : null                  // ADMIN — adjust if needed later

        if (!centerId) {
            console.warn('No centerId resolved for user:', currentUser)
            setBreakdownLoading(false)
            return
        }

        setBreakdownLoading(true)
        getCenterTypeBreakdown(centerId, monthParam)
            .then(data => setBreakdownData(data))
            .catch(err => console.error('Breakdown fetch error:', err))
            .finally(() => setBreakdownLoading(false))
    }, [currentUser, monthParam])

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

    const columns = [
        { header: 'Date', field: 'entryDate', noWrap: true, body: row => formatDate(row.entryDate) },
        { header: 'Customer', field: 'userName', noWrap: true, body: row => row.user?.name || row.userName || '—' },
        { header: 'Shift', field: 'shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', field: 'tiffinType', body: row => <StatusBadge status={row.tiffinType} label={TYPE_LABELS[row.tiffinType]} /> },
        { header: 'Chapati', field: 'chapatiCount', align: 'center', body: row => row.chapatiCount || '—' },
        { header: 'Amount', field: 'amount', align: 'right', body: row => row.amount ? `₹${row.amount}` : '—' },
        { header: 'Status', field: 'status', body: row => <StatusBadge status={row.status} /> },
    ]

    return (
        <div className={styles.page}>

            <div className={styles.statsGrid}>
                {dashLoading
                    ? [1, 2, 3, 4].map(i => <div key={i} className={styles.skeletonCard} />)
                    : stats.map((s, i) => (
                        <StatCard key={i} title={s.title} value={s.value}
                            subtitle={s.subtitle} icon={s.icon} color={s.color} />
                    ))
                }
            </div>

            {isRole(ROLES.USER) && dashData?.myCenter && (
                <div className={styles.centerCard}>
                    <div className={styles.centerAvatar}>{dashData.myCenter.avatar}</div>
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

            {/* Customer history chart — customer role only */}
            {isRole(ROLES.USER) && (
                <CustomerHistoryChart data={historyData} loading={historyLoading} />
            )}

            {(isRole(ROLES.CENTER) || isRole(ROLES.ADMIN)) && (
                <CenterTypeBreakdownChart data={breakdownData} loading={breakdownLoading} />
            )}
            {/* Recent entries table */}
            {/* <div className={styles.tableCard}>
                <div className={styles.tableHead}>Recent entries</div>
                <AppDataTable
                    columns={columns}
                    data={entries}
                    loading={entriesLoading}
                    pageSize={6}
                    emptyMessage="No entries yet this month"
                    serverPagination={entriesPagination}
                    onPageChange={(p) => setEntriesPage(p)}
                />
            </div> */}

        </div>
    )
}

export default DashboardPage