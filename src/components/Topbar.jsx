import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/add-tiffin': 'Add Tiffin',
    '/approvals': 'Approvals',
    '/reports': 'Reports',
    '/pricing': 'Pricing',
    '/my-bill': 'My Bill',
    '/users': 'Users',
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
            padding: isMobile ? '0.65rem 1rem' : '0.75rem 1.5rem',
            background: 'var(--surface-card)',
            borderBottom: '1px solid var(--surface-border)',
            position: 'sticky', top: 0, zIndex: 100,
        }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Hamburger — mobile only */}
                {isMobile && (
                    <Button
                        icon='pi pi-bars'
                        rounded text severity='secondary'
                        onClick={onHamburgerClick}
                        style={{ width: '36px', height: '36px' }}
                    />
                )}
                <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 600 }}>
                    {isMobile ? '🍱 ' : ''}{title}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar
                    label={currentUser?.avatar}
                    shape='circle'
                    size='normal'
                    style={{ background: '#E1F5EE', color: '#085041', fontWeight: 600, flexShrink: 0 }}
                />
                {/* Hide name on mobile to save space */}
                {!isMobile && (
                    <span style={{ fontSize: '14px' }}>{currentUser?.name}</span>
                )}
                <Button
                    icon='pi pi-sign-out'
                    rounded text severity='secondary'
                    tooltip='Logout'
                    tooltipOptions={{ position: 'bottom' }}
                    onClick={handleLogout}
                    style={{ width: '36px', height: '36px' }}
                />
            </div>

        </div>
    )
}

export default Topbar