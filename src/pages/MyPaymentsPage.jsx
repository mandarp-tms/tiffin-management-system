import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import AppDataTable from '../components/AppDataTable'
import AppInput from '../components/AppInput'
import StatusBadge from '../components/StatusBadge'
import apiClient from '../utils/apiClient'
import styles from './MyPaymentsPage.module.css' 

const MyPaymentsPage = () => {
    const { currentUser } = useAuth()
    const centerId = currentUser?.centerId || 1
    
    // Default to All Months (empty string)
    const [month, setMonth] = useState('')
    
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0, limit: 10 })
    const [stats, setStats] = useState({ totalBilled: 0, totalPaid: 0, totalBalance: 0 })

    const extractTransactions = (bills) => {
        const txns = []
        bills.forEach(b => {
            if (b.transactions && Array.isArray(b.transactions)) {
                b.transactions.forEach(t => {
                    txns.push({
                        ...t,
                        periodMonth: b.periodMonth,
                        periodYear: b.periodYear,
                        billStatus: b.status,
                        billBalance: b.balanceDue
                    })
                })
            }
        })
        txns.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        return txns
    }

    const fetchCountAndList = useCallback(async () => {
        if (!currentUser) return
        setLoading(true)
        try {
            const params = { centerId, month }
            
            // Fire both in parallel when filter changes
            const [countRes, listRes] = await Promise.all([
                apiClient.get('/payments/count', { params }),
                apiClient.get('/payments/list', { params: { ...params, page: 1, limit: 10 } })
            ])
            
            // countRes and listRes are already the unpacked JSON body: { success: true, data: ... }
            const statsData = countRes.data || {}
            const total = statsData.count || 0
            
            setStats({
                totalBilled: statsData.totalBilled || 0,
                totalPaid: statsData.totalPaid || 0,
                totalBalance: statsData.totalBalance || 0,
            })
            
            setData(extractTransactions(listRes.data || []))
            setPagination({
                page: 1,
                limit: 10,
                total,
                totalPages: Math.ceil(total / 10)
            })
            setPage(1)
        } catch (err) {
            console.error('Fetch payments error:', err)
        } finally {
            setLoading(false)
        }
    }, [currentUser, centerId, month])

    const fetchListPageOnly = useCallback(async (newPage) => {
        if (!currentUser) return
        setLoading(true)
        try {
            const params = { 
                centerId, 
                month,
                page: newPage,
                limit: 10
            }
            
            const listRes = await apiClient.get('/payments/list', { params })
            setData(extractTransactions(listRes.data || []))
            setPagination(prev => ({ ...prev, page: newPage }))
            setPage(newPage)
        } catch (err) {
            console.error('Fetch payments list error:', err)
        } finally {
            setLoading(false)
        }
    }, [currentUser, centerId, month])

    // When month changes, fetch both count and list (reset to page 1)
    useEffect(() => {
        fetchCountAndList()
    }, [fetchCountAndList])

    // Handle pagination (only fetch list)
    const handlePageChange = (newPage) => {
        if (newPage === page) return
        fetchListPageOnly(newPage)
    }

    const columns = [
        { 
            header: 'Date', 
            body: row => new Date(row.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        { 
            header: 'For Month', 
            body: row => {
                const d = new Date(row.periodYear, row.periodMonth - 1, 1)
                return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
            }
        },
        { header: 'Amount Paid', body: row => <span style={{ fontWeight: 600, color: '#0F6E56' }}>₹{row.amount}</span> },
        { header: 'Method', body: row => <span style={{ textTransform: 'capitalize' }}>{row.method}</span> },
        { header: 'Recorded By', body: row => row.recordedByName || 'System' }
    ]

    const renderMobileCard = (row) => {
        const d = new Date(row.periodYear, row.periodMonth - 1, 1)
        const monthStr = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
        const dateStr = new Date(row.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        
        return (
            <div className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileMonth}>{dateStr}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-color-secondary)', fontWeight: 500 }}>{monthStr}</span>
                </div>
                <div className={styles.mobileCardGrid}>
                    <div className={styles.mobileCardItem}>
                        <span className={styles.mobileCardLabel}>Amount Paid</span>
                        <span className={styles.mobileCardValue} style={{ color: '#0F6E56' }}>₹{row.amount}</span>
                    </div>
                    <div className={styles.mobileCardItem}>
                        <span className={styles.mobileCardLabel}>Method</span>
                        <span className={styles.mobileCardValue} style={{ textTransform: 'capitalize' }}>{row.method}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>My Payments</div>
            </div>

            <div className={styles.filters} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.filterItem}>
                    <AppInput
                        type='month'
                        label='Filter by Month'
                        value={month}
                        onChange={e => setMonth(e.value)}
                    />
                </div>
            </div>

            {!loading && (
                <div className={styles.statsGrid} style={{ marginBottom: '1.5rem' }}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Billed</div>
                        <div className={styles.statValue}>₹{stats.totalBilled}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Paid</div>
                        <div className={`${styles.statValue} ${styles.green}`}>₹{stats.totalPaid}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel} style={{ color: 'var(--red-500, #ff6b6b)' }}>Pending Balance</div>
                        <div className={styles.statValue} style={{ color: 'var(--red-500, #ff6b6b)' }}>₹{stats.totalBalance}</div>
                    </div>
                </div>
            )}

            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>Payment History</span>
                    <span className={styles.tableCount}>
                        {loading ? '...' : `${data.length} transaction${data.length === 1 ? '' : 's'}`}
                    </span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage='No transactions found for this period.'
                    pageSize={10}
                    serverPagination={pagination}
                    onPageChange={handlePageChange}
                    renderMobileCard={renderMobileCard}
                />
            </div>
        </div>
    )
}

export default MyPaymentsPage
