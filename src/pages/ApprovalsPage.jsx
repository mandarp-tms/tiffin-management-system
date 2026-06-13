import { useState, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { FaCheck, FaTimes } from 'react-icons/fa'
import AppDataTable from '../components/AppDataTable'
import AppButton from '../components/AppButton'
import StatusBadge from '../components/StatusBadge'
import { getPendingTiffins, approveTiffin, rejectTiffin } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './ApprovalsPage.module.css'

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

    const columns = [
        { header: 'Customer', field: 'userName', noWrap: true },
        { header: 'Date', body: row => formatDate(row.date), noWrap: true },
        { header: 'Shift', body: row => <StatusBadge status={row.shift || 'morning'} /> },
        { header: 'Type', body: row => <StatusBadge status={row.type} label={TYPE_LABELS[row.type]} /> },
        { header: 'Chapati', body: row => row.chapatiCount || '—', align: 'center' },
        { header: 'Amount', body: row => <span className={styles.amount}>₹{row.amount}</span> },
        { header: 'Status', body: row => <StatusBadge status={row.status} /> },
        {
            header: 'Actions',
            width: '200px',
            body: row => (
                <div className={styles.actions}>
                    <AppButton
                        label='Approve'
                        icon={<FaCheck />}
                        variant='success'
                        size='sm'
                        onClick={() => handleApprove(row.id)}
                    />
                    <AppButton
                        label='Reject'
                        icon={<FaTimes />}
                        variant='danger'
                        size='sm'
                        onClick={() => handleReject(row.id)}
                    />
                </div>
            ),
        },
    ]

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            <div className={styles.card}>
                <div className={styles.cardHead}>
                    <span>Pending approvals</span>
                    <StatusBadge status='pending' label={`${data.length} pending`} />
                </div>
                <AppDataTable
                    columns={columns}
                    data={data}
                    emptyMessage='All caught up! No pending approvals.'
                    pageSize={10}
                />
            </div>

        </div>
    )
}

export default ApprovalsPage