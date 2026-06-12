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

const STATUS_OPTIONS = [
    { label: 'All entries', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
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
    const [statusFilter, setStatusFilter] = useState('all')

    // All entries matching month + customer filter
    const allFiltered = useMemo(() => {
        return getAllTiffins().filter(t => {
            const matchMonth = t.date.startsWith(month)
            const matchCustomer = customerFilter === 'all' || t.userId === customerFilter
            return matchMonth && matchCustomer
        })
    }, [month, customerFilter])

    // Table data — also apply status filter
    const tableData = useMemo(() => {
        if (statusFilter === 'all') return allFiltered
        return allFiltered.filter(t => t.status === statusFilter)
    }, [allFiltered, statusFilter])

    // Totals always use approved only — regardless of status filter
    const customerTotals = useMemo(() => {
        return allCustomers.map(u => {
            const entries = allFiltered.filter(
                t => t.userId === u.id && t.status === 'approved' && t.type !== 'none'
            )
            const total = entries.reduce((s, t) => s + t.amount, 0)
            return { name: u.name, count: entries.length, total }
        })
    }, [allFiltered])

    const grandTotal = customerTotals.reduce((s, u) => s + u.total, 0)

    // Status counts for filter tabs
    const counts = useMemo(() => ({
        all: allFiltered.length,
        approved: allFiltered.filter(t => t.status === 'approved').length,
        pending: allFiltered.filter(t => t.status === 'pending').length,
        rejected: allFiltered.filter(t => t.status === 'rejected').length,
    }), [allFiltered])

    const columns = [
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Customer', field: 'userName', noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        {
            header: 'Amount', body: row => (
                <span style={{ fontWeight: 600, color: row.status === 'approved' ? '#0F6E56' : 'var(--text-color-secondary)' }}>
                    {row.amount ? `₹${row.amount}` : '—'}
                </span>
            )
        },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Toast ref={toast} />

            {/* Filters row */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end',
            }}>
                <div style={{ minWidth: '150px', flex: 1 }}>
                    <AppDropdown
                        label='Month'
                        value={month}
                        options={MONTHS}
                        onChange={e => setMonth(e.value)}
                    />
                </div>
                <div style={{ minWidth: '150px', flex: 1 }}>
                    <AppDropdown
                        label='Customer'
                        value={customerFilter}
                        options={customerOptions}
                        onChange={e => setCustomerFilter(e.value)}
                    />
                </div>
            </div>

            {/* Status filter tabs */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
            }}>
                {STATUS_OPTIONS.map(opt => {
                    const isActive = statusFilter === opt.value
                    const countColors = {
                        all: { bg: '#F1EFE8', color: '#2C2C2A' },
                        approved: { bg: '#E1F5EE', color: '#085041' },
                        pending: { bg: '#FAEEDA', color: '#633806' },
                        rejected: { bg: '#FCEBEB', color: '#791F1F' },
                    }
                    const cc = countColors[opt.value]
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                                background: isActive ? 'var(--primary-50)' : 'var(--surface-card)',
                                color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                fontFamily: 'inherit',
                            }}
                        >
                            {opt.label}
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                background: isActive ? 'var(--primary-color)' : cc.bg,
                                color: isActive ? '#fff' : cc.color,
                                padding: '1px 7px',
                                borderRadius: '10px',
                                minWidth: '20px',
                                textAlign: 'center',
                            }}>
                                {counts[opt.value]}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Billing totals — always approved only */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
            }}>
                {customerTotals.map(u => (
                    <div key={u.name} style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '6px' }}>
                            {u.name}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F6E56' }}>
                            ₹{u.total}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>
                            {u.count} tiffins
                        </div>
                    </div>
                ))}
                <div style={{
                    background: '#E1F5EE',
                    border: '1px solid #A3D9C8',
                    borderRadius: '12px',
                    padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '13px', color: '#085041', marginBottom: '6px' }}>
                        Grand total
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#085041' }}>
                        ₹{grandTotal}
                    </div>
                    <div style={{ fontSize: '12px', color: '#0F6E56', marginTop: '4px' }}>
                        approved only
                    </div>
                </div>
            </div>

            {/* Note when viewing non-approved */}
            {statusFilter !== 'all' && statusFilter !== 'approved' && (
                <div style={{
                    background: '#FAEEDA',
                    border: '1px solid #E8C97A',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '13px',
                    color: '#633806',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <i className='pi pi-info-circle' />
                    Billing totals above always show <strong>approved entries only</strong>,
                    regardless of the status filter applied to the table.
                </div>
            )}

            {/* Detailed log table */}
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        Detailed log
                    </span>
                    <span style={{
                        fontSize: '12px',
                        color: 'var(--text-color-secondary)',
                    }}>
                        {tableData.length} entr{tableData.length === 1 ? 'y' : 'ies'}
                    </span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={tableData}
                    emptyMessage='No entries found for selected filters.'
                    pageSize={10}
                />
            </div>

        </div>
    )
}

export default ReportsPage