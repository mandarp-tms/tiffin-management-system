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
    const [formValues, setFormValues] = useState({})
    const [fetchingRecord, setFetchingRecord] = useState(mode === 'edit')
    const [customData, setCustomData] = useState(null)
    const [fetchingCustomData, setFetchingCustomData] = useState(!!schema?.fetchCustomData)

    useEffect(() => {
        if (!schema?.fetchCustomData) return
        setFetchingCustomData(true)
        schema.fetchCustomData({ currentUser, mode, id })
            .then(data => setCustomData(data))
            .catch(err => console.error('Failed to fetch custom data:', err))
            .finally(() => setFetchingCustomData(false))
    }, [schema, currentUser, mode, id])

    const listPath = config?.listPath || `/module/${moduleId}`

    useEffect(() => {
        if (mode !== 'edit' || !id || !config) return
        setFetchingRecord(true)
        const baseUrl = config.apiEndpoint || config.endpoint || `/module/${moduleId}`
        apiClient.get(`${baseUrl}/${id}`)
            .then(res => {
                setInitialValues(res.data || {})
                setFormValues(res.data || {})
            })
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
            // Determine URL and method (fallback to top-level apiEndpoint if schema.endpoint missing)
            const endpointDef = schema.endpoint || {}
            const fallbackUrl = config.apiEndpoint || config.endpoint || `/module/${moduleId}`
            let url = (endpointDef.url || fallbackUrl).replace(':id', id || '')
            if (mode === 'edit' && !endpointDef.url && url === fallbackUrl) {
                url = `${url}/${id}` // Append ID if generic top-level endpoint is used for edit
            }
            const method = endpointDef.method || (mode === 'edit' ? 'PUT' : 'POST')

            const payload = {
                ...values,
                ...(schema.injectCenterId && { centerId: currentUser?.centerId }),
                ...(schema.injectRole && { role: schema.injectRole }),
            }

            if (method === 'POST') {
                await apiClient.post(url, payload)
            } else if (method === 'PATCH') {
                await apiClient.patch(url, payload)
            } else if (method === 'PUT') {
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

    if (fetchingRecord || fetchingCustomData) {
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
                        onValuesChange={(newVals, prevVals, helpers) => {
                            setFormValues(newVals)
                            if (schema.onValuesChange) {
                                schema.onValuesChange(newVals, prevVals, { ...helpers, customData, currentUser })
                            }
                        }}
                        renderFooter={schema.renderFooter ? (helpers) => schema.renderFooter({ ...helpers, values: formValues, currentUser, customData }) : undefined}
                        fieldProps={schema.getFieldProps ? schema.getFieldProps({ values: formValues, currentUser, customData }) : {}}
                    />
                </div>
            </div>

        </div>
    )
}

export default ModuleFormPage