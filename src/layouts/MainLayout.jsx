import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import clsx from 'clsx'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Breadcrumb from '../components/Breadcrumb'
import styles from './MainLayout.module.css'

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
        <div className={styles.layout}>

            {!isMobile && <Sidebar />}

            {isMobile && drawerOpen && (
                <div className={styles.overlay} onClick={closeDrawer} />
            )}

            {isMobile && (
                <div className={clsx(styles.drawer, drawerOpen ? styles.open : styles.closed)}>
                    <Sidebar onNavigate={closeDrawer} />
                </div>
            )}

            <div className={styles.right}>
                <Topbar
                    onHamburgerClick={() => setDrawerOpen(prev => !prev)}
                    isMobile={isMobile}
                />
                <main className={clsx(styles.main, isMobile && styles.mobile)}>
                    <Breadcrumb />
                    <Outlet />
                </main>
            </div>

        </div>
    )
}

export default MainLayout