import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import AppDataTable from '../components/AppDataTable'
import AppDropdown from '../components/AppDropdown'
import AppButton from '../components/AppButton'
import { getAllTiffins } from '../services/tiffinService'
import { useAuth } from '../context/AuthContext'
import { useMiniApiOptions } from '../hooks/useMiniApiOptions'
import { ROLES, SHIFTS } from '../utils/constants'
import { tiffinEntryConfig } from '../config/modules/tiffinEntry.config.jsx'
import { FaPlus, FaEdit } from 'react-icons/fa'
import TiffinMobileCard from '../components/TiffinMobileCard/TiffinMobileCard'
import styles from './ReportsPage.module.css' // Reuse the same styles for filters

const buildMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
        options.push({ label, value })
    }
    return options
}

const MONTHS = buildMonthOptions()

const STATUS_OPTIONS = [
    { label: 'All Status', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
]

const SHIFT_OPTIONS = [
    { label: 'All Shifts', value: 'all' },
    ...SHIFTS
]

const MyTiffinsPage = () => {
    const navigate = useNavigate()
    const toast = useRef(null)
    const { currentUser, isRole } = useAuth()
    const PAGE_SIZE = 10

    const centerId = currentUser?.centerId || 1
    const isCustomer = isRole(ROLES.USER)

    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    
    // Filters
    const [month, setMonth] = useState(MONTHS[0].value)
    const [customerFilter, setCustomerFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [shiftFilter, setShiftFilter] = useState('all')

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    // Load customers for dropdown using Mini API (Centers/Admins only)
    const { options: miniApiCustomers } = useMiniApiOptions(isCustomer ? null : 'customers')

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        try {
            const filters = {
                page,
                limit: PAGE_SIZE,
                month,
            }
            if (isCustomer) {
                filters.userId = currentUser.id
            } else if (customerFilter !== 'all') {
                filters.userId = customerFilter
            } else {
                filters.centerId = centerId
            }
            if (statusFilter !== 'all') filters.status = statusFilter
            if (shiftFilter !== 'all') filters.shift = shiftFilter

            const res = await getAllTiffins(filters)
            if (res?.data && res?.pagination) {
                setData(res.data)
                setPagination(res.pagination)
            } else if (res?.data && Array.isArray(res.data)) {
                setData(res.data)
                setPagination(null)
            } else if (res?.rows) {
                setData(res.rows)
                setPagination(res.pagination)
            } else if (Array.isArray(res)) {
                setData(res)
                setPagination(null)
            }
        } catch (err) {
            console.error('Fetch entries error:', err)
            toast.current?.show({ severity: 'error', summary: 'Failed to load entries', life: 3000 })
        } finally {
            setLoading(false)
        }
    }, [page, month, customerFilter, statusFilter, shiftFilter, centerId, isCustomer, currentUser])

    useEffect(() => { fetchEntries() }, [fetchEntries])

    const customerOptions = [
        { label: 'All customers', value: 'all' },
        ...miniApiCustomers,
    ]

    const handleAdd = () => navigate('/module/tiffinEntry/add')
    const handleEdit = (id) => navigate(`/module/tiffinEntry/edit/${id}`)

    const baseColumns = isCustomer 
        ? tiffinEntryConfig.list.columns.filter(col => col.header !== 'Customer')
        : tiffinEntryConfig.list.columns

    // Inject edit action column
    const columns = [
        ...baseColumns,
        {
            header: 'Actions',
            align: 'center',
            body: row => (
                <AppButton
                    icon={<FaEdit />}
                    variant='text'
                    size='sm'
                    onClick={() => handleEdit(row.id)}
                    title='Edit Entry'
                />
            )
        }
    ]

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '20px', fontWeight: 600 }}>My Tiffins</div>
                <AppButton
                    label='Add Tiffin'
                    icon={<FaPlus size={12} />}
                    variant='primary'
                    size='sm'
                    onClick={handleAdd}
                />
            </div>

            <div className={styles.filters} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Month'
                        value={month}
                        options={MONTHS}
                        onChange={e => { setMonth(e.value); setPage(1) }}
                    />
                </div>
                {!isCustomer && (
                    <div className={styles.filterItem}>
                        <AppDropdown
                            label='Customer'
                            value={customerFilter}
                            options={customerOptions}
                            onChange={e => { setCustomerFilter(e.value); setPage(1) }}
                        />
                    </div>
                )}
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Status'
                        value={statusFilter}
                        options={STATUS_OPTIONS}
                        onChange={e => { setStatusFilter(e.value); setPage(1) }}
                    />
                </div>
                <div className={styles.filterItem}>
                    <AppDropdown
                        label='Shift'
                        value={shiftFilter}
                        options={SHIFT_OPTIONS}
                        onChange={e => { setShiftFilter(e.value); setPage(1) }}
                    />
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>Entries</span>
                    <span className={styles.tableCount}>
                        {loading ? '...' : `${pagination?.total ?? data.length} entr${(pagination?.total ?? data.length) === 1 ? 'y' : 'ies'}`}
                    </span>
                </div>
                <AppDataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage={tiffinEntryConfig.list.emptyMessage}
                    renderMobileCard={(row) => (
                        <TiffinMobileCard 
                            row={row} 
                            hideCustomer={isCustomer}
                            actions={
                                <AppButton
                                    icon={<FaEdit />}
                                    variant='secondary'
                                    size='sm'
                                    onClick={() => navigate(`/module/tiffinEntry/edit/${row.id}`)}
                                />
                            } 
                        />
                    )}
                    pageSize={PAGE_SIZE}
                    serverPagination={pagination}
                    onPageChange={setPage}
                />
            </div>
        </div>
    )
}

export default MyTiffinsPage
