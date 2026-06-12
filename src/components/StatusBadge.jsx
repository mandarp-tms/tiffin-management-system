const BADGE_CONFIG = {
    approved: { bg: '#E1F5EE', color: '#085041', label: 'Approved' },
    pending: { bg: '#FAEEDA', color: '#633806', label: 'Pending' },
    rejected: { bg: '#FCEBEB', color: '#791F1F', label: 'Rejected' },
    active: { bg: '#E1F5EE', color: '#085041', label: 'Active' },
    morning: { bg: '#E6F1FB', color: '#042C53', label: '🌅 Morning' },
    night: { bg: '#EEEDFE', color: '#26215C', label: '🌙 Night' },
    full: { bg: '#E1F5EE', color: '#085041', label: 'Full' },
    half: { bg: '#EEEDFE', color: '#3C3489', label: 'Half' },
    chapati: { bg: '#FAEEDA', color: '#633806', label: 'Only Chapati' },
    bhakari: { bg: '#E6F1FB', color: '#0C447C', label: 'Bhakari' },
    dalrice: { bg: '#FAECE7', color: '#712B13', label: 'Dal Rice' },
    none: { bg: '#F1EFE8', color: '#2C2C2A', label: 'No Tiffin' },
}

const StatusBadge = ({ status, label, style = {} }) => {
    const cfg = BADGE_CONFIG[status] || { bg: '#F1EFE8', color: '#2C2C2A', label: status }
    return (
        <span style={{
            background: cfg.bg,
            color: cfg.color,
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            ...style,
        }}>
            {label || cfg.label}
        </span>
    )
}

export default StatusBadge