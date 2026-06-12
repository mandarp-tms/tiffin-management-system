import { useMemo } from 'react'
import AppDataTable from '../components/AppDataTable'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { getMyTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const MyBillPage = () => {
    const { currentUser } = useAuth()

    const myTiffins = useMemo(() =>
        getMyTiffins(currentUser?.id), [currentUser])

    const approved = myTiffins.filter(t => t.status === 'approved' && t.type !== 'none')
    const pending = myTiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((s, t) => s + t.amount, 0)

    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span style={{ fontWeight: 600, color: '#0F6E56' }}>{row.amount ? `₹${row.amount}` : '—'}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
        { header: 'Note', field: 'note' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Summary cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
            }}>
                {[
                    { label: 'Amount due', value: `₹${total}`, sub: 'June 2025', color: '#0F6E56' },
                    { label: 'Tiffins taken', value: approved.length, sub: 'Approved entries', color: 'var(--text-color)' },
                    { label: 'Pending approval', value: pending.length, sub: 'By tiffin center', color: '#BA7517' },
                ].map(card => (
                    <div key={card.label} style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px', padding: '1.25rem',
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '6px' }}>{card.label}</div>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>My tiffin log — June 2025</span>
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