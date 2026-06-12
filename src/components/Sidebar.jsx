import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/constants'
import AppIcon from './AppIcon'
import logo from '../assets/logo.png'

const allNavItems = [
    { label: 'Dashboard', icon: 'home', path: '/dashboard', roles: ['admin', 'center', 'user'] },
    { label: 'Add Tiffin', icon: 'plus', path: '/add-tiffin', roles: ['center', 'user'] },
    { label: 'Approvals', icon: 'approvals', path: '/approvals', roles: ['center'] },
    { label: 'My Bill', icon: 'receipt', path: '/my-bill', roles: ['user'] },
    { label: 'Reports', icon: 'chart', path: '/reports', roles: ['admin', 'center'] },
    { label: 'Tiffin Centers', icon: 'users', path: '/tiffin-centers', roles: ['admin'] },
    { label: 'Customers', icon: 'users', path: '/users', roles: ['center'] },
    { label: 'Pricing', icon: 'tag', path: '/pricing', roles: ['center'] },
]

const Sidebar = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const role = currentUser?.role
    const navItems = allNavItems.filter(item => item.roles.includes(role))
    const [profileOpen, setProfileOpen] = useState(false)

    const handleNav = (path) => {
        navigate(path)
        if (onNavigate) onNavigate()
    }

    const handleLogout = () => {
        setProfileOpen(false)
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
            position: 'relative',   // needed for drawer positioning
        }}>

            {/* Brand */}
            <div style={{
                padding: '1.25rem 1rem',
                borderBottom: '1px solid var(--surface-border)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <img
                    src={logo} alt='Tiffin Manager'
                    style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
                />
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-color)', lineHeight: 1.2 }}>
                        Tiffin Manager
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginTop: '2px' }}>
                        {ROLE_LABELS[role]}
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
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

            {/* Profile drawer — slides up from bottom */}
            {profileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setProfileOpen(false)}
                        style={{
                            position: 'fixed', inset: 0,
                            zIndex: 998,
                        }}
                    />
                    {/* Drawer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '64px',       // sits just above the footer
                        left: '12px',
                        right: '12px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px',
                        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                        zIndex: 999,
                        overflow: 'hidden',
                        animation: 'slideUp 0.18s ease',
                    }}>
                        {/* User info inside drawer */}
                        <div style={{
                            padding: '0.875rem 1rem',
                            borderBottom: '1px solid var(--surface-border)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'var(--surface-ground)',
                        }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: '#E1F5EE', color: '#085041',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '12px', flexShrink: 0,
                            }}>
                                {currentUser?.avatar}
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}>
                                    {ROLE_LABELS[role]}
                                </div>
                            </div>
                        </div>

                        {/* Menu items */}
                        {[
                            { icon: 'pi pi-user', label: 'My Profile' },
                            { icon: 'pi pi-bell', label: 'Notifications' },
                            { icon: 'pi pi-cog', label: 'Settings' },
                            { icon: 'pi pi-question-circle', label: 'Help' },
                        ].map(item => (
                            <div
                                key={item.label}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    color: 'var(--text-color)',
                                    transition: 'background 0.1s',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-ground)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <i className={item.icon} style={{ fontSize: '14px', color: 'var(--text-color-secondary)', width: '16px' }} />
                                {item.label}
                                {/* Coming soon badge */}
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '10px',
                                    background: '#FAEEDA',
                                    color: '#633806',
                                    padding: '1px 7px',
                                    borderRadius: '10px',
                                    fontWeight: 500,
                                }}>
                                    Soon
                                </span>
                            </div>
                        ))}

                        {/* Divider + Logout */}
                        <div style={{ borderTop: '1px solid var(--surface-border)' }}>
                            <div
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    color: '#A32D2D',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FCEBEB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <AppIcon name='logout' size={14} color='#A32D2D' />
                                Sign out
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer — click to open profile drawer */}
            <div
                onClick={() => setProfileOpen(prev => !prev)}
                style={{
                    padding: '0.875rem 1rem',
                    borderTop: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: profileOpen ? 'var(--surface-ground)' : 'transparent',
                    userSelect: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-ground)'}
                onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent' }}
            >
                <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#E1F5EE', color: '#085041',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', flexShrink: 0,
                }}>
                    {currentUser?.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '13px', fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {currentUser?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}>
                        {ROLE_LABELS[role]}
                    </div>
                </div>
                {/* Chevron */}
                <i
                    className='pi pi-chevron-up'
                    style={{
                        fontSize: '11px',
                        color: 'var(--text-color-secondary)',
                        transform: profileOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                    }}
                />
            </div>

        </div>
    )
}

export default Sidebar