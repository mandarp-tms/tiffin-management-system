import { useMemo } from 'react'
import { getTiffinUsers } from '../services/userService'
import { getAllTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import styles from './UsersPage.module.css'

const UsersPage = () => {
    const customers = getTiffinUsers()

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
            return { ...u, approved: approved.length, pending: pending.length, total, favouriteType }
        })
    }, [])

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

                        {/* Stats grid */}
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

                    </div>
                ))}
            </div>

        </div>
    )
}

export default UsersPage