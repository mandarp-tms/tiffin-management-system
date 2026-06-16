import styles from './StatusBadge.module.css'
import clsx from 'clsx'

const BADGE_CONFIG = {
    approved: { label: 'Approved' },
    pending: { label: 'Pending' },
    rejected: { label: 'Rejected' },
    active: { label: 'Active' },
    morning: { label: '🌅 Morning' },
    night: { label: '🌙 Night' },
    full: { label: 'Full' },
    half: { label: 'Half' },
    chapati: { label: 'Only Chapati' },
    bhakari: { label: 'Bhakari' },
    dalrice: { label: 'Dal Rice' },
    none: { label: 'No Tiffin' },
    // payment statuses
    paid: { label: 'Paid' },
    partial: { label: 'Partial' },
    unpaid: { label: 'Unpaid' },
}

const StatusBadge = ({ status, label, style = {} }) => {
    const cfg = BADGE_CONFIG[status] || { label: status }
    return (
        <span
            className={clsx(styles.badge, styles[status])}
            style={style}
        >
            {label || cfg.label}
        </span>
    )
}

export default StatusBadge