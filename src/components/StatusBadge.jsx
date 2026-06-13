import styles from './StatusBadge.module.css'
import clsx from 'clsx'

const StatusBadge = ({ status, label, style = {} }) => {
    const LABELS = {
        approved: 'Approved', pending: 'Pending', rejected: 'Rejected',
        active: 'Active', morning: '🌅 Morning', night: '🌙 Night',
        full: 'Full', half: 'Half', chapati: 'Only Chapati',
        bhakari: 'Bhakari', dalrice: 'Dal Rice', none: 'No Tiffin',
    }

    return (
        <span
            className={clsx(styles.badge, styles[status])}
            style={style}
        >
            {label || LABELS[status] || status}
        </span>
    )
}

export default StatusBadge