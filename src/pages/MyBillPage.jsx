import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { getMyTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './MyBillPage.module.css'

const MyBillPage = () => {
    const { currentUser } = useAuth()

    const myTiffins = useMemo(() => getMyTiffins(currentUser?.id), [currentUser])
    const approved = myTiffins.filter(t => t.status === 'approved' && t.type !== 'none')
    const pending = myTiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((s, t) => s + t.amount, 0)

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