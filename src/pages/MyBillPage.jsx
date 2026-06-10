import { useMemo, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import { getMyTiffins } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const STATUS_CONFIG = {
    approved: { severity: 'success' },
    pending: { severity: 'warning' },
    rejected: { severity: 'danger' },
}

const MyBillPage = () => {
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const myTiffins = useMemo(() =>
        getMyTiffins(currentUser?.id), [currentUser])

    const approved = myTiffins.filter(t => t.status === 'approved' && t.type !== 'none')
    const pending = myTiffins.filter(t => t.status === 'pending')
    const total = approved.reduce((s, t) => s + t.amount, 0)

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
                        borderRadius: '12px',
                        padding: '1.25rem',
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-secondary)', marginBottom: '6px' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: card.color }}>
                            {card.value}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>
                            {card.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tiffin log */}
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
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>My tiffin log — June 2025</span>
                    <span style={{
                        background: '#E1F5EE', color: '#085041',
                        padding: '3px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 500,
                    }}>
                        Total ₹{total}
                    </span>
                </div>

                <DataTable
                    value={myTiffins}
                    emptyMessage='No tiffin entries yet.'
                    scrollable
                    paginator
                    rows={10}
                    style={{ fontSize: '13px' }}
                >
                    <Column body={dateBody} header='Date' />
                    <Column body={typeBody} header='Type' />
                    <Column body={chapBody} header='Chapati' style={{ textAlign: 'center' }} />
                    <Column body={amountBody} header='Amount' />
                    <Column body={statusBody} header='Status' />
                    {myTiffins.some(t => t.note) && (
                        <Column field='note' header='Note' />
                    )}
                </DataTable>
            </div>

        </div>
    )
}

export default MyBillPage