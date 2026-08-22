import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { getModule } from '../config'
import apiClient from '../utils/apiClient'
import AppDataTable from '../components/AppDataTable'
import AppButton from '../components/AppButton'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import styles from './ModuleListPage.module.css'

const ModuleListPage = ({ moduleId }) => {
    const config = getModule(moduleId)
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const toast = useRef(null)

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        if (!config) return
        setLoading(true)
        try {
            const url = config.apiEndpoint || config.endpoint || `/module/${moduleId}`
            const res = await apiClient.get(url, { params: { centerId: currentUser?.centerId } })
            
            let listData = []
            if (Array.isArray(res.data)) {
                listData = res.data
            } else if (res.data && Array.isArray(res.data.rows)) {
                listData = res.data.rows
            } else if (res.data && Array.isArray(res.data.data)) {
                listData = res.data.data
            } else if (res.data && Array.isArray(res.data.items)) {
                listData = res.data.items
            }
            
            setData(listData)
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Failed to fetch data' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [moduleId, currentUser])

    if (!config || !config.list) {
        return <div style={{ padding: '2rem' }}>Module "{moduleId}" list configuration not found.</div>
    }

    const { title, subtitle, columns } = config.list

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return
        try {
            const url = `${config.apiEndpoint || config.endpoint || `/module/${moduleId}`}/${row.id}`
            await apiClient.delete(url)
            toast.current?.show({ severity: 'success', summary: 'Deleted successfully' })
            fetchData()
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Failed to delete item' })
        }
    }

    const actionColumn = {
        header: 'Actions',
        align: 'right',
        body: (row) => (
            <div className={styles.actions}>
                <button className={styles.iconBtn} onClick={() => navigate(`/module/${moduleId}/edit/${row.id}`)}>
                    <FaEdit />
                </button>
                <button className={styles.iconBtn} onClick={() => handleDelete(row)}>
                    <FaTrash style={{ color: 'var(--danger-color, #dc3545)' }} />
                </button>
            </div>
        )
    }

    const allColumns = [...columns, actionColumn]

    return (
        <div className={styles.page}>
            <Toast ref={toast} />
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>{title}</div>
                    {subtitle && <div className={styles.sub}>{subtitle}</div>}
                </div>
                {config.add && (
                    <AppButton
                        label="Add New"
                        icon={<FaPlus size={12} />}
                        variant="primary"
                        onClick={() => navigate(`/module/${moduleId}/add`)}
                    />
                )}
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                    <span>{title || 'Records'}</span>
                    <span className={styles.tableCount}>
                        {loading ? '...' : `${data.length} record${data.length === 1 ? '' : 's'}`}
                    </span>
                </div>
                <AppDataTable
                    columns={allColumns}
                    data={data}
                    loading={loading}
                    emptyMessage="No records found."
                    renderMobileCard={(row) => (
                        <div className={styles.mobileCard}>
                            {columns.map((col, i) => (
                                <div key={i} className={styles.mobileCardRow}>
                                    <span className={styles.mobileCardLabel}>{col.header}</span>
                                    <span className={styles.mobileCardValue}>
                                        {col.body ? col.body(row) : row[col.field]}
                                    </span>
                                </div>
                            ))}
                            <div className={styles.mobileCardActions}>
                                <AppButton
                                    icon={<FaEdit />}
                                    variant='secondary'
                                    size='sm'
                                    title='Edit'
                                    onClick={() => navigate(`/module/${moduleId}/edit/${row.id}`)}
                                />
                                <AppButton
                                    icon={<FaTrash />}
                                    variant='secondary'
                                    size='sm'
                                    title='Delete'
                                    style={{ color: 'var(--danger-color, #dc3545)' }}
                                    onClick={() => handleDelete(row)}
                                />
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

export default ModuleListPage
