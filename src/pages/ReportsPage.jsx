import { useState, useMemo, useRef } from 'react'
import { Toast } from 'primereact/toast'
import AppDataTable from '../components/AppDataTable'
import AppDropdown from '../components/AppDropdown'
import StatusBadge from '../components/StatusBadge'
import { getAllTiffins } from '../services/tiffinService'
import { getTiffinUsers } from '../services/userService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const MONTHS = [
    { label: 'June 2025', value: '2025-06' },
    { label: 'May 2025', value: '2025-05' },
    { label: 'April 2025', value: '2025-04' },
]

const ReportsPage = () => {
    const toast = useRef(null)
    const allCustomers = getTiffinUsers()
    const customerOptions = [
        { label: 'All customers', value: 'all' },
        ...allCustomers.map(u => ({ label: u.name, value: u.id })),
    ]

    const [month, setMonth] = useState('2025-06')
    const [customerFilter, setCustomerFilter] = useState('all')

    const filtered = useMemo(() => {
        return getAllTiffins().filter(t => {
            const matchMonth = t.date.startsWith(month)
            const matchCustomer = customerFilter === 'all' || t.userId === customerFilter
            return matchMonth && matchCustomer
        })
    }, [month, customerFilter])

    const customerTotals = useMemo(() => {
        return allCustomers.map(u => {
            const entries = filtered.filter(t => t.userId === u.id && t.status === 'approved' && t.type !== 'none')
            const total = entries.reduce((s, t) => s + t.amount, 0)
            return { name: u.name, count: entries.length, total }
        })
    }, [filtered])

    const grandTotal = customerTotals.reduce((s, u) => s + u.total, 0)

    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Customer', field: 'userName', noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span style={{ fontWeight: 600, color: '#0F6E56' }}>{row.amount ? `₹${row.amount}` : '—'}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Toast ref={toast} />

            {/* Filters */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end',
            }}>
                <div style={{ minWidth: '160px', flex: 1 }}>
                    <AppDropdown
                        label='Month'
                        value={month}
                        options={MONTHS}
                        onChange={e => setMonth(e.value)}
                    />
                </div>
                <div style={{ minWidth: '160px', flex: 1 }}>
                    <AppDropdown
                        label='Customer'
                        value={customerFilter}
                        options={customerOptions}
                        onChange={e => setCustomerFilter(e.value)}
                    />
                </div>
            </div>

            {/* Customer totals */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
            }}>
                {customerTotals.map(u => (
                    <div key={u.name} style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px', padding: '1.25rem',
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '6px' }}>{u.name}</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F6E56' }}>₹{u.total}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>{u.count} tiffins</div>
                    </div>
                ))}
                <div style={{
                    background: '#E1F5EE', border: '1px solid #A3D9C8',
                    borderRadius: '12px', padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '13px', color: '#085041', marginBottom: '6px' }}>Grand total</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#085041' }}>₹{grandTotal}</div>
                    <div style={{ fontSize: '12px', color: '#0F6E56', marginTop: '4px' }}>
                        {filtered.filter(t => t.status === 'approved' && t.type !== 'none').length} tiffins
                    </div>
                </div>
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
                    fontWeight: 600, fontSize: '14px',
                }}>
                    Detailed log
                </div>
                <AppDataTable
                    columns={columns}
                    data={filtered}
                    emptyMessage='No entries for selected filters.'
                    pageSize={10}
                />
            </div>
        </div>
    )
}

export default ReportsPage