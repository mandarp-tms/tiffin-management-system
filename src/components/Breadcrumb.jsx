import { useLocation, useNavigate } from 'react-router-dom'
import { getModule } from '../config'
import styles from './Breadcrumb.module.css'

const STATIC_TITLES = {
    '/dashboard': 'Dashboard',
    '/add-tiffin': 'Add Tiffin',
    '/approvals': 'Approvals',
    '/reports': 'Reports',
    '/pricing': 'Pricing',
    '/my-bill': 'My Bill',
    '/users': 'Customers',
    '/tiffin-centers': 'Tiffin Centers',
}

// Returns [{ label, path? }] — last item has no path (current page)
const getPageTrail = (pathname) => {
    if (STATIC_TITLES[pathname]) {
        return [{ label: STATIC_TITLES[pathname] }]
    }

    const moduleMatch = pathname.match(/^\/module\/([^/]+)(\/add|\/edit\/[^/]+)?$/)
    if (!moduleMatch) return []

    const [, moduleId, action] = moduleMatch
    const config = getModule(moduleId)
    if (!config) return []

    if (!action) return [{ label: config.label }]

    const schema = action === '/add' ? config.add : config.edit
    const currentLabel = action === '/add'
        ? (schema?.title || `Add ${config.label.slice(0, -1)}`)
        : (schema?.title ? `Edit ${schema.title}` : `Edit ${config.label.slice(0, -1)}`)
    const listPath = config.listPath || `/module/${moduleId}`
    return [
        { label: config.label, path: listPath },
        { label: currentLabel },
    ]
}

const Breadcrumb = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pageTrail = getPageTrail(location.pathname)

    if (!pageTrail.length) return null

    // Prefix with Home unless we're already on the dashboard
    const isDashboard = location.pathname === '/dashboard'
    const trail = isDashboard ? pageTrail : [{ label: 'Home', path: '/dashboard' }, ...pageTrail]

    return (
        <div className={styles.breadcrumb}>
            {trail.map((item, i) => (
                <span key={i} className={styles.item}>
                    {item.path ? (
                        <span className={styles.link} onClick={() => navigate(item.path)}>
                            {item.label}
                        </span>
                    ) : (
                        <span className={styles.current}>{item.label}</span>
                    )}
                    {i < trail.length - 1 && <span className={styles.sep}>›</span>}
                </span>
            ))}
        </div>
    )
}

export default Breadcrumb