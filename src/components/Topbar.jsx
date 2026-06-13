import { useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import AppIcon from './AppIcon'
import logo from '../assets/logo.png'
import styles from './Topbar.module.css'

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

const Topbar = ({ onHamburgerClick, isMobile }) => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const title = PAGE_TITLES[location.pathname] || 'Tiffin Manager'

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className={clsx(styles.topbar, isMobile && styles.mobile)}>
            <div className={styles.left}>
                {isMobile && (
                    <button className={styles.hamburger} onClick={onHamburgerClick}>
                        <AppIcon name='menu' size={18} color='var(--text-color)' />
                    </button>
                )}
                {isMobile && <img src={logo} alt='logo' className={styles.logo} />}
                <span className={clsx(styles.title, isMobile && styles.mobile)}>{title}</span>
            </div>

            <div className={styles.right}>
                <div className={styles.avatar}>{currentUser?.avatar}</div>
                {!isMobile && <span className={styles.userName}>{currentUser?.name}</span>}
                <button className={styles.logoutBtn} onClick={handleLogout} title='Logout'>
                    <AppIcon name='logout' size={16} color='var(--text-color-secondary)' />
                </button>
            </div>
        </div>
    )
}

export default Topbar