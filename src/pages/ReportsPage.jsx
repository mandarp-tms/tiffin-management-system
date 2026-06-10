import { useState, useMemo, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { getAllTiffins } from '../services/tiffinService'
import { getTiffinUsers } from '../services/userService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const MONTHS = [
    { label: 'June 2025', value: '2025-06' },
    { label: 'May 2025', value: '2025-05' },
    { label: 'April 2025', value: '2025-04' },
]

const STATUS_CONFIG = {
    approved: { severity: 'success' },
    pending: { severity: 'warning' },
    rejected: { severity: 'danger' },
}

const ReportsPage = () => {
    const toast = useRef(null)
    const allUsers = getTiffinUsers()
    const userOptions = [
        { label: 'All users', value: 'all' },
        ...allUsers.map(u => ({ label: u.name, value: u.id })),
    ]

    const [month, setMonth] = useState('2025-06')
    const [userFilter, setUserFilter] = useState('all')

    const filtered = useMemo(() => {
        return getAllTiffins().filter(t => {
            const matchMonth = t.date.startsWith(month)
            const matchUser = userFilter === 'all' || t.userId === userFilter
            return matchMonth && matchUser
        })
    }, [month, userFilter])

    // Per user totals
    const userTotals = useMemo(() => {
        return allUsers.map(u => {
            const entries = filtered.filter(t => t.userId === u.id && t.status === 'approved' && t.type !== 'none')
            const total = entries.reduce((s, t) => s + t.amount, 0)
            const count = entries.length
            return { name: u.name, count, total }
        })
    }, [filtered])

    const grandTotal = userTotals.reduce((s, u) => s + u.total, 0)

    // Column templates
    const dateBody = (row) => formatDate(row.date)
    const typeBody = (row) => TYPE_LABELS[row.type] || row.type
    const chapBody = (row) => row.chapatiCount || '—'
    const amountBody = (row) => (
        <span style={{ fontWeight: 600, color: '#0F6E56' }}>
            {row.amount ? `₹${row.amount}` : '—'}
        </span>
    )
    const statusBody = (row) => (
        <Tag
            value={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            severity={STATUS_CONFIG[row.status]?.severity || 'info'}
        />
    )

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
                <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>Month</label>
                    <Dropdown
                        value={month}
                        options={MONTHS}
                        onChange={e => setMonth(e.value)}
                        style={{ minWidth: '160px' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>User</label>
                    <Dropdown
                        value={userFilter}
                        options={userOptions}
                        onChange={e => setUserFilter(e.value)}
                        style={{ minWidth: '160px' }}
                    />
                </div>
            </div>

            {/* User totals summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
            }}>
                {userTotals.map(u => (
                    <div key={u.name} style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '6px' }}>
                            {u.name}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F6E56' }}>₹{u.total}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>
                            {u.count} tiffins
                        </div>
                    </div>
                ))}
                <div style={{
                    background: '#E1F5EE',
                    border: '1px solid #A3D9C8',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                }}>
                    <div style={{ fontSize: '13px', color: '#085041', marginBottom: '6px' }}>Grand total</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#085041' }}>₹{grandTotal}</div>
                    <div style={{ fontSize: '12px', color: '#0F6E56', marginTop: '4px' }}>
                        {filtered.filter(t => t.status === 'approved' && t.type !== 'none').length} tiffins
                    </div>
                </div>
            </div>

            {/* Full log table */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    fontWeight: 600, fontSize: '14px',
                }}>
                    Detailed log
                </div>
                <DataTable
                    value={filtered}
                    emptyMessage='No entries found for selected filters.'
                    scrollable
                    paginator
                    rows={10}
                    style={{ fontSize: '13px' }}
                >
                    <Column body={dateBody} header='Date' />
                    <Column field='userName' header='User' />
                    <Column body={typeBody} header='Type' />
                    <Column body={chapBody} header='Chapati' style={{ textAlign: 'center' }} />
                    <Column body={amountBody} header='Amount' />
                    <Column body={statusBody} header='Status' />
                </DataTable>
            </div>

        </div>
    )
}

export default ReportsPage