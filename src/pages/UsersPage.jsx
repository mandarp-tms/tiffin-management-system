import { useMemo } from 'react'
import { getTiffinUsers } from '../services/userService'
import { getAllTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'

const ROLE_COLORS = {
    user: { bg: '#E1F5EE', color: '#085041' },
}

const UsersPage = () => {
    const users = getTiffinUsers()

    const userStats = useMemo(() => {
        const tiffins = getAllTiffins()
        return users.map(u => {
            const mine = tiffins.filter(t => t.userId === u.id)
            const approved = mine.filter(t => t.status === 'approved' && t.type !== 'none')
            const pending = mine.filter(t => t.status === 'pending')
            const rejected = mine.filter(t => t.status === 'rejected')
            const total = approved.reduce((s, t) => s + t.amount, 0)

            // most used tiffin type
            const typeCounts = approved.reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1
                return acc
            }, {})
            const favouriteType = Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0]

            return { ...u, approved: approved.length, pending: pending.length, rejected: rejected.length, total, favouriteType }
        })
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.25rem',
            }}>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>Tiffin users</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                        {users.length} active users this month
                    </div>
                </div>
            </div>

            {/* User cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
            }}>
                {userStats.map(u => (
                    <div key={u.id} style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                    }}>
                        {/* Card header */}
                        <div style={{
                            padding: '1.25rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            borderBottom: '1px solid var(--surface-border)',
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: '#E1F5EE', color: '#085041',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '16px', flexShrink: 0,
                            }}>
                                {u.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '15px' }}>{u.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                                    {u.email}
                                </div>
                            </div>
                            <span style={{
                                background: '#E1F5EE', color: '#085041',
                                padding: '3px 10px', borderRadius: '20px',
                                fontSize: '11px', fontWeight: 500,
                            }}>
                                Active
                            </span>
                        </div>

                        {/* Stats grid */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: '0',
                        }}>
                            {[
                                { label: 'Amount due', value: `₹${u.total}`, color: '#0F6E56' },
                                { label: 'Tiffins taken', value: u.approved, color: 'var(--text-color)' },
                                { label: 'Pending', value: u.pending, color: '#BA7517' },
                                { label: 'Favourite', value: TYPE_LABELS[u.favouriteType] || '—', color: '#534AB7' },
                            ].map((stat, i) => (
                                <div key={stat.label} style={{
                                    padding: '1rem',
                                    borderRight: i % 2 === 0 ? '1px solid var(--surface-border)' : 'none',
                                    borderBottom: i < 2 ? '1px solid var(--surface-border)' : 'none',
                                }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginBottom: '4px' }}>
                                        {stat.label}
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>
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