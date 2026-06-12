import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppIcon from './AppIcon'
import logo from '../assets/logo.png'

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

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '0 1rem' : '0 1.5rem',
            height: '56px',
            background: 'var(--surface-card)',
            borderBottom: '1px solid var(--surface-border)',
            position: 'sticky', top: 0, zIndex: 100,
            flexShrink: 0,
        }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isMobile && (
                    <div
                        onClick={onHamburgerClick}
                        style={{
                            width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '8px',
                            background: 'var(--surface-ground)',
                        }}
                    >
                        <AppIcon name='menu' size={18} color='var(--text-color)' />
                    </div>
                )}
                {isMobile && (
                    <img src={logo} alt='logo'
                        style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                )}
                <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 600 }}>
                    {title}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#E1F5EE', color: '#085041',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', flexShrink: 0,
                }}>
                    {currentUser?.avatar}
                </div>
                {!isMobile && (
                    <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                        {currentUser?.name}
                    </span>
                )}
                <div
                    onClick={handleLogout}
                    style={{
                        width: '34px', height: '34px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', borderRadius: '8px',
                        background: 'var(--surface-ground)',
                    }}
                    title='Logout'
                >
                    <AppIcon name='logout' size={16} color='var(--text-color-secondary)' />
                </div>
            </div>

        </div>
    )
}

export default Topbar