import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const MainLayout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            if (!mobile) setDrawerOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const closeDrawer = () => setDrawerOpen(false)

    return (
        <div style={{
            display: 'flex',
            height: '100vh',        // ← fixed height, not minHeight
            overflow: 'hidden',     // ← prevent whole page scroll
            background: 'var(--surface-ground)',
        }}>

            {/* Desktop sidebar */}
            {!isMobile && <Sidebar />}

            {/* Mobile overlay */}
            {isMobile && drawerOpen && (
                <div onClick={closeDrawer} style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 999,
                }} />
            )}

            {/* Mobile drawer */}
            {isMobile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0,
                    height: '100vh', zIndex: 1000,
                    transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                }}>
                    <Sidebar onNavigate={closeDrawer} />
                </div>
            )}

            {/* Right side — topbar + scrollable content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                height: '100vh',      // ← full height
                overflow: 'hidden',   // ← don't let this scroll
            }}>
                {/* Topbar — fixed, never scrolls */}
                <Topbar
                    onHamburgerClick={() => setDrawerOpen(prev => !prev)}
                    isMobile={isMobile}
                />

                {/* Only this part scrolls */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',    // ← ONLY outlet scrolls
                    padding: isMobile ? '1rem' : '1.5rem',
                }}>
                    <Outlet />
                </main>
            </div>

        </div>
    )
}

export default MainLayout