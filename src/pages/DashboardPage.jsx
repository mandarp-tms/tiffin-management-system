import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { tiffins } from '../mock/tiffins'
import { ROLES, TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { getCenterById } from '../services/tiffinCenterService'

const DashboardPage = () => {
    const { currentUser, isRole } = useAuth()

    const myTiffins = useMemo(() =>
        tiffins.filter(t => t.userId === currentUser?.id), [currentUser])

    const allApproved = useMemo(() =>
        tiffins.filter(t => t.status === 'approved' && t.type !== 'none'), [])

    const pending = useMemo(() =>
        tiffins.filter(t => t.status === 'pending'), [])

    const totalAmount = useMemo(() =>
        allApproved.reduce((sum, t) => sum + t.amount, 0), [allApproved])

    const myAmount = useMemo(() =>
        myTiffins.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0), [myTiffins])

    const recentEntries = useMemo(() =>
        [...tiffins].reverse().slice(0, 6), [])

    // Tiffin center for customer
    const myCenter = isRole(ROLES.USER)
        ? getCenterById(currentUser?.centerId)
        : null

    // Stats per role
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
            }}>
                {stats.map((s, i) => (
                    <StatCard
                        key={i}
                        title={s.title}
                        value={s.value}
                        subtitle={s.subtitle}
                        icon={s.icon}
                        color={s.color}
                    />
                ))}
            </div>

            {/* Tiffin center card — customers only */}
            {isRole(ROLES.USER) && myCenter && (
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#EEEDFE',
                        color: '#26215C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        flexShrink: 0,
                    }}>
                        {myCenter.avatar}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-color-secondary)',
                            marginBottom: '2px',
                        }}>
                            Your tiffin center
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {myCenter.name}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-color-secondary)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {myCenter.address} · {myCenter.phone}
                        </div>
                    </div>

                    {/* Status badge */}
                    <StatusBadge
                        status='active'
                        style={{ flexShrink: 0 }}
                    />
                </div>
            )}

            {/* Recent entries table */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    fontWeight: 600,
                    fontSize: '14px',
                }}>
                    Recent entries
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: 'var(--surface-ground)' }}>
                                {['Date', 'Customer', 'Type', 'Chapati', 'Amount', 'Status'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 14px',
                                        textAlign: 'left',
                                        color: 'var(--text-color-secondary)',
                                        fontWeight: 500,
                                        fontSize: '12px',
                                        borderBottom: '1px solid var(--surface-border)',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentEntries.map(t => (
                                <tr
                                    key={t.id}
                                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-ground)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                        {formatDate(t.date)}
                                    </td>
                                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                        {t.userName}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <StatusBadge status={t.type} label={TYPE_LABELS[t.type]} />
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                        {t.chapatiCount || '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px', fontWeight: 500, color: '#0F6E56' }}>
                                        {t.amount ? `₹${t.amount}` : '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <StatusBadge status={t.status} />
                                    </td>
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