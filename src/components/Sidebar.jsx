import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/constants'
import { ROUTES } from '../routes'
import AppIcon from './AppIcon'
import logo from '../assets/logo.png'
import styles from './Sidebar.module.css'


const DRAWER_ITEMS = [
    { icon: 'pi pi-user', label: 'My Profile' },
    { icon: 'pi pi-bell', label: 'Notifications' },
    { icon: 'pi pi-cog', label: 'Settings' },
    { icon: 'pi pi-question-circle', label: 'Help' },
]

const Sidebar = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = currentUser?.role
    const navItems = ROUTES.filter(r => r.showInNav && r.roles?.includes(role))

    const [profileOpen, setProfileOpen] = useState(false)

    const handleNav = (path) => { navigate(path); if (onNavigate) onNavigate() }

    const handleLogout = () => {
        setProfileOpen(false)
        logout()
        navigate('/login')
        if (onNavigate) onNavigate()
    }

    return (
        <div className={styles.sidebar}>

            {/* Brand */}
            <div className={styles.brand}>
                {/* <img src={logo} alt='Tiffinger' className={styles.brandLogo} /> */}
                <div>
                    <h2 className={styles.brandTitle}>
                        <span className={styles.brandTitleSpan}>Tiffi</span>nger
                    </h2>
                    {/* <div className={styles.brandRole}>{ROLE_LABELS[role]}</div> */}
                </div>
            </div>

            {/* Nav */}
            <nav className={styles.nav}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path
                    return (
                        <div
                            key={item.path}
                            onClick={() => handleNav(item.path)}
                            className={clsx(styles.navItem, isActive && styles.active)}
                        >
                            <AppIcon
                                name={item.icon}
                                size={16}
                                color={isActive ? 'var(--primary-color)' : 'var(--text-color-secondary)'}
                            />
                            {item.label}
                        </div>
                    )
                })}
            </nav>

            {/* Profile drawer */}
            {profileOpen && (
                <>
                    <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div className={styles.drawer}>
                        <div className={styles.drawerHeader}>
                            <div className={styles.avatar}>{currentUser?.avatar}</div>
                            <div>
                                <div className={styles.footerName}>{currentUser?.name}</div>
                                <div className={styles.footerRole}>{ROLE_LABELS[role]}</div>
                            </div>
                        </div>
                        {DRAWER_ITEMS.map(item => (
                            <div key={item.label} className={styles.drawerItem}>
                                <i className={item.icon} style={{ fontSize: '14px', color: 'var(--text-color-secondary)', width: '16px' }} />
                                {item.label}
                                <span className={styles.comingSoon}>Soon</span>
                            </div>
                        ))}
                        <div className={styles.drawerDivider}>
                            <div className={styles.logoutItem} onClick={handleLogout}>
                                <AppIcon name='logout' size={14} color='#A32D2D' />
                                Sign out
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div
                className={clsx(styles.footer, profileOpen && styles.open)}
                onClick={() => setProfileOpen(prev => !prev)}
            >
                <div className={styles.avatar}>{currentUser?.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.footerName}>{currentUser?.name}</div>
                    <div className={styles.footerRole}>{ROLE_LABELS[role]}</div>
                </div>
                <i className={clsx('pi pi-chevron-up', styles.chevron, !profileOpen && styles.rotated)} />
            </div>

        </div>
    )
}

export default Sidebar