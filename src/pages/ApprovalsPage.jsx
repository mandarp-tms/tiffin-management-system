import { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { getPendingTiffins, approveTiffin, rejectTiffin } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const ApprovalsPage = () => {
    const toast = useRef(null)
    const [data, setData] = useState(() => getPendingTiffins())

    const refresh = () => setData(getPendingTiffins())

    const handleApprove = (id) => {
        approveTiffin(id)
        toast.current.show({ severity: 'success', summary: 'Approved', life: 2000 })
        refresh()
    }

    const handleReject = (id) => {
        rejectTiffin(id)
        toast.current.show({ severity: 'warn', summary: 'Rejected', life: 2000 })
        refresh()
    }

    const typeBody = (row) => TYPE_LABELS[row.type] || row.type
    const dateBody = (row) => formatDate(row.date)
    const chapBody = (row) => row.chapatiCount || '—'
    const amountBody = (row) => <span style={{ fontWeight: 600, color: '#0F6E56' }}>₹{row.amount}</span>
    const statusBody = () => <Tag value='Pending' severity='warning' />
    const actionBody = (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
                icon='pi pi-check' label='Approve'
                size='small' severity='success'
                onClick={() => handleApprove(row.id)}
            />
            <Button
                icon='pi pi-times' label='Reject'
                size='small' severity='danger' outlined
                onClick={() => handleReject(row.id)}
            />
        </div>
    )

    return (
        <div>
            <Toast ref={toast} />

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
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Pending approvals</span>
                    <span style={{
                        background: '#FAEEDA', color: '#633806',
                        padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                    }}>
                        {data.length} pending
                    </span>
                </div>

                <DataTable
                    value={data}
                    emptyMessage='All caught up! No pending approvals.'
                    scrollable
                    style={{ fontSize: '13px' }}
                >
                    <Column field='userName' header='User' />
                    <Column body={dateBody} header='Date' />
                    <Column body={typeBody} header='Type' />
                    <Column body={chapBody} header='Chapati' style={{ textAlign: 'center' }} />
                    <Column body={amountBody} header='Amount' />
                    <Column body={statusBody} header='Status' />
                    <Column body={actionBody} header='Actions' style={{ minWidth: '180px' }} />
                </DataTable>
            </div>
        </div>
    )
}

export default ApprovalsPage