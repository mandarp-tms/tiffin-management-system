import styles from './StatusBadge.module.css'
import clsx from 'clsx'

const BADGE_CONFIG = {
    approved: { label: 'Approved' },
    pending: { label: 'Pending' },
    rejected: { label: 'Rejected' },
    active: { label: 'Active' },
    morning: { label: '🌅 Morning' },
    night: { label: '🌙 Night' },
    // payment statuses
    paid: { label: 'Paid' },
    partial: { label: 'Partial' },
    unpaid: { label: 'Unpaid' },
}

const StatusBadge = ({ status, label, style = {} }) => {
    // If not in config, uppercase first letter as fallback for custom tiffin types
    const fallbackLabel = status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : ''
    const cfg = BADGE_CONFIG[status] || { label: fallbackLabel }
    return (
        <span
            className={clsx(styles.badge, styles[status] || styles.defaultStatus)}
            style={style}
        >
            {label || cfg.label}
        </span>
    )
}

export default StatusBadge