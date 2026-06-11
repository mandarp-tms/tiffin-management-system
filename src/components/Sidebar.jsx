import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

const allNavItems = [
    { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard', roles: ['admin', 'center', 'user'] },
    { label: 'Add Tiffin', icon: 'pi pi-plus-circle', path: '/add-tiffin', roles: ['center', 'user'] },
    { label: 'Approvals', icon: 'pi pi-check-square', path: '/approvals', roles: ['center'] },
    { label: 'My Bill', icon: 'pi pi-receipt', path: '/my-bill', roles: ['user'] },
    { label: 'Reports', icon: 'pi pi-chart-bar', path: '/reports', roles: ['admin', 'center'] },
    { label: 'Users', icon: 'pi pi-users', path: '/users', roles: ['admin'] },
    { label: 'Pricing', icon: 'pi pi-tag', path: '/pricing', roles: ['admin', 'center'] },
]

const ROLE_LABELS = {
    admin: 'Super Admin',
    center: 'Tiffin Center',
    user: 'User',
}

const Sidebar = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = currentUser?.role
    const navItems = allNavItems.filter(item => item.roles.includes(role))

    const handleNav = (path) => {
        navigate(path)
        if (onNavigate) onNavigate()
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
        if (onNavigate) onNavigate()
    }

    return (
        <div style={{
            width: '220px',
            height: '100vh',
            background: 'var(--surface-card)',
            borderRight: '1px solid var(--surface-border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        }}>

            {/* Brand */}
            <div style={{
                padding: '1.25rem 1rem',
                borderBottom: '1px solid var(--surface-border)',
            }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-color)' }}>
                    🍱 Tiffin Manager
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                    {ROLE_LABELS[role]}
                </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path
                    return (
                        <div
                            key={item.path}
                            onClick={() => handleNav(item.path)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                                background: isActive ? 'var(--primary-50)' : 'transparent',
                                color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '14px',
                                transition: 'all 0.15s',
                                userSelect: 'none',
                            }}
                        >
                            <i className={item.icon} style={{ fontSize: '16px', width: '18px' }} />
                            {item.label}
                        </div>
                    )
                })}
            </nav>

            {/* User info + logout at bottom */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--surface-border)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#E1F5EE', color: '#085041',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', flexShrink: 0,
                }}>
                    {currentUser?.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}>
                        {ROLE_LABELS[role]}
                    </div>
                </div>
                <i
                    className='pi pi-sign-out'
                    onClick={handleLogout}
                    style={{ fontSize: '16px', cursor: 'pointer', color: 'var(--text-color-secondary)' }}
                    title='Logout'
                />
            </div>

        </div>
    )
}

export default Sidebar