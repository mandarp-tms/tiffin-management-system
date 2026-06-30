import { useState, useRef, useEffect, useCallback } from 'react'
import { Toast } from 'primereact/toast'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import AppDataTable from '../components/AppDataTable'
import AppButton from '../components/AppButton'
import StatusBadge from '../components/StatusBadge'
import { getPendingTiffins, approveTiffin, rejectTiffin } from '../services/tiffinService'
import { TYPE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import styles from './ApprovalsPage.module.css'

const ApprovalsPage = () => {
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    const centerId = currentUser?.centerId || 1
    const PAGE_SIZE = 10

    const fetchPending = useCallback(async (pageNum = 1) => {
        setLoading(true)
        try {
            const result = await getPendingTiffins(centerId, { page: pageNum, limit: PAGE_SIZE })

            if (result?.data && result?.pagination) {
                setData(result.data)
                setPagination(result.pagination)
            } else {
                setData(Array.isArray(result) ? result : [])
                setPagination(null)
            }
        } catch (err) {
            console.error('Fetch pending error:', err)
            toast.current?.show({ severity: 'error', summary: 'Failed to load approvals', life: 3000 })
            setData([])
            setPagination(null)
        } finally {
            setLoading(false)
        }
    }, [centerId])

    useEffect(() => { fetchPending(page) }, [fetchPending, page])

    const handleApprove = async (id) => {
        try {
            await approveTiffin(id)
            toast.current.show({ severity: 'success', summary: 'Approved', life: 2000 })
            fetchPending(page)
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Approve failed',
                detail: err?.message || 'Could not approve entry',
                life: 3000,
            })
        }
    }

    const handleReject = async (id) => {
        try {
            await rejectTiffin(id)
            toast.current.show({ severity: 'warn', summary: 'Rejected', life: 2000 })
            fetchPending(page)
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Reject failed',
                detail: err?.message || 'Could not reject entry',
                life: 3000,
            })
        }
    }

    const handlePageChange = (newPage) => {
        setPage(newPage)
    }

    const columns = [
        {
            header: 'Customer',
            body: row => row.user?.name || row.userName || '—',
            noWrap: true,
        },
        {
            header: 'Date',
            body: row => formatDate(row.entryDate),
            noWrap: true,
        },
        {
            header: 'Shift',
            body: row => <StatusBadge status={row.shift || 'morning'} />,
        },
        {
            header: 'Type',
            body: row => <StatusBadge status={row.tiffinType} label={TYPE_LABELS[row.tiffinType]} />,
        },
        {
            header: 'Chapati',
            body: row => row.chapatiCount || '—',
            align: 'center',
        },
        {
            header: 'Amount',
            body: row => <span className={styles.amount}>₹{row.amount}</span>,
        },
        {
            header: 'Status',
            body: row => <StatusBadge status={row.status} />,
        },
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
                    <StatusBadge status='pending' label={`${pagination?.total ?? data.length} pending`} />
                </div>
                <AppDataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage='All caught up! No pending approvals.'
                    pageSize={PAGE_SIZE}
                    serverPagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    )
}

export default ApprovalsPage