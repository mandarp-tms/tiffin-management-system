import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { useAuth } from '../context/AuthContext'
import AppForm from '../components/AppForm/AppForm'
import { getModule } from '../config'
import apiClient from '../utils/apiClient'
import styles from './ModuleFormPage.module.css'

const ModuleFormPage = ({ mode = 'add' }) => {
    const { moduleId, id } = useParams()
    const navigate = useNavigate()
    const toast = useRef(null)
    const { currentUser } = useAuth()

    const config = getModule(moduleId)
    const schema = mode === 'edit' ? config?.edit : config?.add

    const [loading, setLoading] = useState(false)
    const [initialValues, setInitialValues] = useState({})
    const [fetchingRecord, setFetchingRecord] = useState(mode === 'edit')

    const listPath = config?.listPath || `/module/${moduleId}`

    useEffect(() => {
        if (mode !== 'edit' || !id || !config) return
        setFetchingRecord(true)
        apiClient.get(`${config.endpoint}/${id}`)
            .then(res => setInitialValues(res.data || {}))
            .catch(err => {
                console.error('Fetch record error:', err)
                toast.current?.show({ severity: 'error', summary: 'Could not load record', life: 3000 })
            })
            .finally(() => setFetchingRecord(false))
    }, [mode, id, config])

    if (!config || !schema) {
        return (
            <div style={{ padding: '2rem', color: 'var(--text-color-secondary)', fontSize: '14px' }}>
                Module "{moduleId}" not found or has no {mode} form.
            </div>
        )
    }

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            let url = schema.endpoint.url.replace(':id', id || '')

            const payload = {
                ...values,
                ...(schema.injectCenterId && { centerId: currentUser?.centerId }),
                ...(schema.injectRole && { role: schema.injectRole }),
            }

            if (schema.endpoint.method === 'POST') {
                await apiClient.post(url, payload)
            } else if (schema.endpoint.method === 'PATCH') {
                await apiClient.patch(url, payload)
            } else if (schema.endpoint.method === 'PUT') {
                await apiClient.put(url, payload)
            }

            toast.current.show({
                severity: 'success',
                summary: mode === 'add' ? `${config.label} added` : `${config.label} updated`,
                life: 2000,
            })

            setTimeout(() => navigate(listPath), 1500)

        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: `Failed to ${mode} ${config.label.toLowerCase()}`,
                detail: err?.message || 'Something went wrong',
                life: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    if (fetchingRecord) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color-secondary)', fontSize: '13px' }}>
                <i className='pi pi-spin pi-spinner' style={{ fontSize: '20px', display: 'block', marginBottom: '8px' }} />
                Loading...
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <Toast ref={toast} />

            <div className={styles.header}>
                <div className={styles.title}>{schema.title}</div>
                {schema.subtitle && (
                    <div className={styles.sub}>{schema.subtitle}</div>
                )}
            </div>

            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <AppForm
                        schema={schema}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(listPath)}
                        loading={loading}
                    />
                </div>
            </div>

        </div>
    )
}

export default ModuleFormPage