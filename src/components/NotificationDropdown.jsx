import { useState, useEffect, useRef } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Badge } from 'primereact/badge'
import { getNotifications, getUnseenCount, markAsSeen, markAllAsSeen } from '../services/notificationService'
import AppIcon from './AppIcon'
import { useNavigate } from 'react-router-dom'
import styles from './NotificationDropdown.module.css'

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([])
    const [unseenCount, setUnseenCount] = useState(0)
    const op = useRef(null)
    const navigate = useNavigate()

    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                getNotifications({ page: 1, limit: 10 }),
                getUnseenCount()
            ])
            if (notifsRes.success) setNotifications(notifsRes.data)
            if (countRes.success) setUnseenCount(countRes.data?.count || 0)
        } catch (err) {
            console.error('Failed to fetch notifications', err)
        }
    }

    useEffect(() => {
        fetchNotifications()

        const handleNewNotification = () => {
            fetchNotifications()
        }

        window.addEventListener('tms_notification_received', handleNewNotification)
        return () => window.removeEventListener('tms_notification_received', handleNewNotification)
    }, [])

    const handleBellClick = (e) => {
        op.current.toggle(e)
    }

    const handleMarkAllSeen = async () => {
        try {
            await markAllAsSeen()
            fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const handleNotificationClick = async (notif) => {
        if (!notif.isSeen) {
            await markAsSeen(notif.id)
            fetchNotifications()
        }
        
        // Handle routing based on notification type
        if (notif.data?.type === 'NEW_TIFFIN_REQUEST') {
            navigate('/approvals')
        } else if (notif.data?.type === 'TIFFIN_STATUS_UPDATE') {
            navigate('/dashboard')
        }
        
        op.current.hide()
    }

    return (
        <div className={styles.container}>
            <button className={styles.bellBtn} onClick={handleBellClick}>
                <AppIcon name='bell' size={20} color='var(--text-color)' />
                {unseenCount > 0 && <Badge value={unseenCount} severity="danger" className={styles.badge} />}
            </button>

            <OverlayPanel ref={op} className={styles.panel} appendTo={document.body} breakpoints={{'576px': '100vw'}}>
                <div className={styles.header}>
                    <h4>Notifications</h4>
                    {unseenCount > 0 && (
                        <button className={styles.markAllBtn} onClick={handleMarkAllSeen}>
                            Mark all read
                        </button>
                    )}
                </div>
                <div className={styles.list}>
                    {notifications.length === 0 ? (
                        <div className={styles.empty}>No notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                className={`${styles.item} ${n.isSeen ? styles.seen : styles.unseen}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div className={styles.title}>{n.title}</div>
                                <div className={styles.body}>{n.body}</div>
                                <div className={styles.time}>{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </OverlayPanel>
        </div>
    )
}

export default NotificationDropdown
