import { useLocation } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/add-tiffin': 'Add Tiffin',
    '/approvals': 'Approvals',
    '/reports': 'Reports',
    '/pricing': 'Pricing',
    '/my-bill': 'My Bill',
    '/users': 'Customers',
    '/tiffin-centers': 'Tiffin Centers',
}

const Breadcrumb = () => {
    const location = useLocation()
    const title = PAGE_TITLES[location.pathname]

    if (!title) return null

    return (
        <div className={styles.breadcrumb}>
            <span className={styles.title}>{title}</span>
        </div>
    )
}

export default Breadcrumb